import PDFFont from '../font';
import { WIN_ANSI_MAP } from './afm';

const toHex = function (num) {
  return `0000${num.toString(16)}`.slice(-4);
};

// Inverse of WIN_ANSI_MAP (code point -> WinAnsiEncoding code), for the one
// block (0x80-0x9F) where the two diverge; every other code between
// FIRST_WIN_ANSI_CHAR and LAST_WIN_ANSI_CHAR maps 1:1 to the same code point.
const WIN_ANSI_CODE_TO_UNICODE = Object.fromEntries(
  Object.entries(WIN_ANSI_MAP).map(([codePoint, code]) => [
    code,
    Number(codePoint),
  ]),
);
const UNDEFINED_WIN_ANSI_CODES = new Set([129, 141, 143, 144, 157]); // unused slots in that block
const FIRST_WIN_ANSI_CHAR = 32;
const LAST_WIN_ANSI_CHAR = 255;

function unicodeForWinAnsiCode(code) {
  if (UNDEFINED_WIN_ANSI_CODES.has(code)) {
    return null;
  }
  return WIN_ANSI_CODE_TO_UNICODE[code] ?? code;
}

/**
 * Builds a subset of `font` holding every glyph, numbered exactly as in `font`
 * itself.
 *
 * This goes through the ordinary subset encoder rather than using the font's
 * own program buffer untouched, because the source may be a WOFF/WOFF2 file,
 * whose raw bytes are a compressed container rather than a valid standalone
 * TrueType/CFF program; fontkit's subset encoder already normalizes any source
 * format into one.
 *
 * Including every glyph in ascending order makes the subset's own renumbering
 * (fontkit's `Subset#includeGlyph`) assign each glyph the id it already had,
 * so glyph ids taken from `font` address the resulting program directly.
 */
function completeSubsetOf(font) {
  const subset = font.createSubset();
  for (let gid = 0; gid < font.numGlyphs; gid++) {
    subset.includeGlyph(gid);
  }
  return subset;
}

class EmbeddedFont extends PDFFont {
  constructor(document, font, id) {
    super();
    this.document = document;
    this.font = font;
    this.id = id;
    this.subset = this.font.createSubset();
    this.unicode = [[0]];
    this.widths = [this.font.getGlyph(0).advanceWidth];

    this.name = this.font.postscriptName;
    this.scale = 1000 / this.font.unitsPerEm;
    this.ascender = this.font.ascent * this.scale;
    this.descender = this.font.descent * this.scale;
    this.xHeight = this.font.xHeight * this.scale;
    this.capHeight = this.font.capHeight * this.scale;
    this.lineGap = this.font.lineGap * this.scale;
    this.bbox = this.font.bbox;

    if (document.options.fontLayoutCache !== false) {
      this.layoutCache = Object.create(null);
    }
  }

  layoutRun(text, features) {
    const run = this.font.layout(text, features);

    // Normalize position values
    for (let i = 0; i < run.positions.length; i++) {
      const position = run.positions[i];
      for (let key in position) {
        position[key] *= this.scale;
      }

      position.advanceWidth = run.glyphs[i].advanceWidth * this.scale;
    }

    return run;
  }

  layoutCached(text) {
    if (!this.layoutCache) {
      return this.layoutRun(text);
    }
    let cached;
    if ((cached = this.layoutCache[text])) {
      return cached;
    }

    const run = this.layoutRun(text);
    this.layoutCache[text] = run;
    return run;
  }

  layout(text, features, onlyWidth) {
    // Skip the cache if any user defined features are applied
    if (features) {
      return this.layoutRun(text, features);
    }

    let glyphs = onlyWidth ? null : [];
    let positions = onlyWidth ? null : [];
    let advanceWidth = 0;

    // Split the string by words to increase cache efficiency.
    // For this purpose, spaces and tabs are a good enough delimeter.
    let last = 0;
    let index = 0;
    while (index <= text.length) {
      var needle;
      if (
        (index === text.length && last < index) ||
        ((needle = text.charAt(index)), [' ', '\t'].includes(needle))
      ) {
        const run = this.layoutCached(text.slice(last, ++index));
        if (!onlyWidth) {
          glyphs = glyphs.concat(run.glyphs);
          positions = positions.concat(run.positions);
        }

        advanceWidth += run.advanceWidth;
        last = index;
      } else {
        index++;
      }
    }

    return { glyphs, positions, advanceWidth };
  }

  encode(text, features) {
    const { glyphs, positions } = this.layout(text, features);

    const res = [];
    for (let i = 0; i < glyphs.length; i++) {
      const glyph = glyphs[i];
      const gid = this.subset.includeGlyph(glyph.id);
      res.push(`0000${gid.toString(16)}`.slice(-4));

      if (this.widths[gid] == null) {
        this.widths[gid] = glyph.advanceWidth * this.scale;
      }
      if (this.unicode[gid] == null) {
        this.unicode[gid] = glyph.codePoints;
      }
    }

    return [res, positions];
  }

  widthOfString(string, size, features) {
    const width = this.layout(string, features, true).advanceWidth;
    const scale = size / 1000;
    return width * scale;
  }

  /**
   * Returns the PDFReference of a complete, text-addressable embedding of this
   * font, embedding it the first time it's requested.
   *
   * The font `ref()` returns is a Type0 composite font under `/Encoding
   * /Identity-H`, subsetted down to the glyphs pdfkit has drawn so far and
   * addressed directly by glyph id, so it carries neither a character
   * encoding nor the glyphs a caller has not used yet. A consumer that has to
   * resolve arbitrary text against the font on its own -- rather than being
   * handed glyph ids, as pdfkit's own content streams are -- needs both. This
   * embedding is complete and addressed by character code instead.
   *
   * It costs a full copy of the font program, so call it only when that is
   * actually needed.
   */
  completeRef() {
    return this.completeDictionary != null
      ? this.completeDictionary
      : (this.completeDictionary = this.document.ref());
  }

  finalize() {
    if (this.embedded) {
      return;
    }
    if (this.dictionary != null) {
      this.embed();
    }
    if (this.completeDictionary != null) {
      this.embedComplete();
    }
    this.embedded = true;
  }

  /**
   * Embeds a font program and its descriptor, and returns them together with
   * the `/BaseFont` name they must be referenced under.
   *
   * `complete` says whether the program holds every glyph. Such a program is
   * not a subset in the sense of spec 9.6.4, so its name must not carry the
   * subset tag and it needs no `/CIDSet`.
   */
  embedProgram(subset, complete) {
    const isCFF = subset.cff != null;
    const fontProgram = subset.encode();

    const fontFile = this.document.ref();
    if (isCFF) {
      fontFile.data.Subtype = 'CIDFontType0C';
    } else if (complete) {
      // Required for FontFile2 (spec 9.9, Table 127): the length in bytes of
      // the uncompressed TrueType program. Without it, Acrobat reports the
      // font as one it "could not be extracted" when it loads the program
      // rather than just the dictionary.
      fontFile.data.Length1 = fontProgram.length;
    }
    fontFile.end(fontProgram);

    const familyClass =
      ((this.font['OS/2'] != null
        ? this.font['OS/2'].sFamilyClass
        : undefined) || 0) >> 8;
    let flags = 0;
    if (this.font.post.isFixedPitch) {
      flags |= 1 << 0;
    }
    if (1 <= familyClass && familyClass <= 7) {
      flags |= 1 << 1;
    }
    flags |= 1 << 2; // assume the font uses non-latin characters
    if (familyClass === 10) {
      flags |= 1 << 3;
    }
    if (this.font.head.macStyle.italic) {
      flags |= 1 << 6;
    }

    // A subset is named with a six-uppercase-letter tag meaning "an arbitrary
    // subset of the font named after the +" (spec 9.6.4); 17 is the char code
    // offset from '0' to 'A', and 73 maps to 'Z'. A complete program is no
    // such subset, and tagging it anyway would give two different programs
    // the same name, which Acrobat rejects.
    const postscriptName = this.font.postscriptName?.replaceAll(' ', '_');
    const tag = [1, 2, 3, 4, 5, 6]
      .map((i) => String.fromCharCode((this.id.charCodeAt(i) || 73) + 17))
      .join('');
    const name = complete ? postscriptName : `${tag}+${postscriptName}`;

    const { bbox } = this.font;
    const descriptor = this.document.ref({
      Type: 'FontDescriptor',
      FontName: name,
      Flags: flags,
      FontBBox: [
        bbox.minX * this.scale,
        bbox.minY * this.scale,
        bbox.maxX * this.scale,
        bbox.maxY * this.scale,
      ],
      ItalicAngle: this.font.italicAngle,
      Ascent: this.ascender,
      Descent: this.descender,
      CapHeight: (this.font.capHeight || this.font.ascent) * this.scale,
      XHeight: (this.font.xHeight || 0) * this.scale,
      StemV: 0,
    }); // not sure how to calculate this

    if (isCFF) {
      descriptor.data.FontFile3 = fontFile;
    } else {
      descriptor.data.FontFile2 = fontFile;
    }

    // /CIDSet lists the CIDs a subset actually contains, which PDF/A-1
    // requires of a subsetted font and only of one.
    if (!complete && this.document.subset && this.document.subset === 1) {
      const maxCID = this.widths.length - 1;
      const cidSetBuffer = new Uint8Array(Math.ceil((maxCID + 1) / 8));
      for (let cid = 0; cid <= maxCID; cid++) {
        if (this.widths[cid] != null) {
          cidSetBuffer[Math.floor(cid / 8)] |= 0x80 >> (cid % 8);
        }
      }
      const CIDSetRef = this.document.ref();
      CIDSetRef.write(cidSetBuffer);
      CIDSetRef.end();

      descriptor.data.CIDSet = CIDSetRef;
    }

    descriptor.end();

    return { descriptor, name, isCFF };
  }

  embed() {
    const { descriptor, name, isCFF } = this.embedProgram(this.subset, false);

    const descendantFontData = {
      Type: 'Font',
      Subtype: 'CIDFontType0',
      BaseFont: name,
      CIDSystemInfo: {
        Registry: new String('Adobe'),
        Ordering: new String('Identity'),
        Supplement: 0,
      },
      FontDescriptor: descriptor,
      W: [0, this.widths],
    };

    if (!isCFF) {
      descendantFontData.Subtype = 'CIDFontType2';
      descendantFontData.CIDToGIDMap = 'Identity';
    }

    const descendantFont = this.document.ref(descendantFontData);

    descendantFont.end();

    this.dictionary.data = {
      Type: 'Font',
      Subtype: 'Type0',
      BaseFont: name,
      Encoding: 'Identity-H',
      DescendantFonts: [descendantFont],
      ToUnicode: this.toUnicodeCmap(),
    };

    return this.dictionary.end();
  }

  /**
   * Embeds the font `completeRef()` hands out: a composite font holding every
   * glyph, addressed through a custom WinAnsiEncoding-to-glyph CMap instead of
   * the usual `/Identity-H`. See `completeRef()` for why it exists separately
   * from `embed()`, and `winAnsiToGidCmap()` for why it is a composite font
   * with a custom `/Encoding` rather than a simple font with `/Encoding
   * /WinAnsiEncoding`.
   */
  embedComplete() {
    const { descriptor, name, isCFF } = this.embedProgram(
      completeSubsetOf(this.font),
      true,
    );

    // One width per glyph id, matching the font program above, which holds
    // every glyph rather than only the WinAnsiEncoding-representable ones.
    const widths = [];
    for (let gid = 0; gid < this.font.numGlyphs; gid++) {
      widths.push(this.font.getGlyph(gid).advanceWidth * this.scale);
    }

    const descendantFontData = {
      Type: 'Font',
      Subtype: isCFF ? 'CIDFontType0' : 'CIDFontType2',
      BaseFont: name,
      CIDSystemInfo: {
        Registry: new String('Adobe'),
        Ordering: new String('Identity'),
        Supplement: 0,
      },
      FontDescriptor: descriptor,
      W: [0, widths],
    };
    if (!isCFF) {
      descendantFontData.CIDToGIDMap = 'Identity';
    }

    const descendantFont = this.document.ref(descendantFontData);
    descendantFont.end();

    this.completeDictionary.data = {
      Type: 'Font',
      Subtype: 'Type0',
      BaseFont: name,
      Encoding: this.winAnsiToGidCmap(),
      DescendantFonts: [descendantFont],
    };

    return this.completeDictionary.end();
  }

  /**
   * Builds an embedded CMap mapping each single-byte WinAnsiEncoding code to
   * the id of the glyph it represents (which are the same numbers as CIDs
   * here, see `embedComplete()`), for use as that method's Type0 font's
   * `/Encoding` in place of a standard name such as `/Identity-H`.
   *
   * `Identity-H` only works when whoever writes the content stream already
   * knows which glyph id corresponds to each character, which is exactly what
   * a consumer starting from plain text does not know -- and fontkit's subset
   * encoder never retains the font's own cmap or glyph-name tables it could
   * otherwise have used, no matter how many glyphs a subset includes
   * (composite fonts, which is all pdfkit ever produces elsewhere, never need
   * them, so the encoder doesn't build them). This gives such a consumer a
   * character encoding to resolve text against anyway, without depending on
   * either.
   */
  winAnsiToGidCmap() {
    const cmap = this.document.ref();
    cmap.data.Type = 'CMap';

    const entries = [];
    for (let code = FIRST_WIN_ANSI_CHAR; code <= LAST_WIN_ANSI_CHAR; code++) {
      const codePoint = unicodeForWinAnsiCode(code);
      if (codePoint == null || !this.font.hasGlyphForCodePoint(codePoint)) {
        continue;
      }
      const gid = this.font.glyphForCodePoint(codePoint).id;
      entries.push(`<${code.toString(16).padStart(2, '0')}> ${gid}`);
    }

    const chunkSize = 100;
    const chunks = Math.ceil(entries.length / chunkSize);
    const ranges = [];
    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize;
      const end = Math.min((i + 1) * chunkSize, entries.length);
      ranges.push(
        `${end - start} begincidchar\n${entries.slice(start, end).join('\n')}\nendcidchar`,
      );
    }

    cmap.end(`\
/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CIDSystemInfo <<
  /Registry (Adobe)
  /Ordering (Identity)
  /Supplement 0
>> def
/CMapName /Adobe-Identity-WinAnsi def
/CMapType 1 def
1 begincodespacerange
<20> <ff>
endcodespacerange
${ranges.join('\n')}
endcmap
CMapName currentdict /CMap defineresource pop
end
end\
`);

    return cmap;
  }

  // Maps the glyph ids encoded in the PDF back to unicode strings
  // Because of ligature substitutions and the like, there may be one or more
  // unicode characters represented by each glyph.
  toUnicodeCmap() {
    const cmap = this.document.ref();

    const entries = [];
    for (let codePoints of this.unicode) {
      const encoded = [];

      // encode codePoints to utf16
      for (let value of codePoints) {
        if (value > 0xffff) {
          value -= 0x10000;
          encoded.push(toHex(((value >>> 10) & 0x3ff) | 0xd800));
          value = 0xdc00 | (value & 0x3ff);
        }

        encoded.push(toHex(value));
      }

      entries.push(`<${encoded.join(' ')}>`);
    }

    const chunkSize = 256;
    const chunks = Math.ceil(entries.length / chunkSize);
    const ranges = [];
    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize;
      const end = Math.min((i + 1) * chunkSize, entries.length);
      ranges.push(
        `<${toHex(start)}> <${toHex(end - 1)}> [${entries.slice(start, end).join(' ')}]`,
      );
    }

    cmap.end(`\
/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CIDSystemInfo <<
  /Registry (Adobe)
  /Ordering (UCS)
  /Supplement 0
>> def
/CMapName /Adobe-Identity-UCS def
/CMapType 2 def
1 begincodespacerange
<0000><ffff>
endcodespacerange
${ranges.length} beginbfrange
${ranges.join('\n')}
endbfrange
endcmap
CMapName currentdict /CMap defineresource pop
end
end\
`);

    return cmap;
  }
}

export default EmbeddedFont;
