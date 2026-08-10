# AFM conversion tools

The AFM conversion tools generate one ECMAScript module per input font. Runtime
conversion also generates a shared glyph-name module when Courier, Helvetica,
or Times is present. PDFKit emits each generated runtime module as separate CJS
and ESM artifacts. Node loads them on demand, while browser applications import
and register only the standard fonts they use.

Raw AFM files remain the source of truth and are retained in distributions.
The runtime modules in `lib/font/generated` are committed build inputs. Do not
edit them directly; regenerate them from the AFM sources and format the result.

## Commands

Generate compact runtime data:

```sh
node tools/convert-afm-runtime.js --output-dir /tmp/pdfkit-afm-runtime
```

Generate the complete parsed AFM state used for converter verification:

```sh
node tools/convert-afm-parsed.js --output-dir /tmp/pdfkit-afm-parsed
```

With no input paths, each command converts all bundled AFMs. Pass one or more
AFM paths after `--output-dir` to convert only selected fonts. Both converters
use the same normalized filenames, such as `Helvetica.js`,
`HelveticaBold.js`, and `TimesBoldItalic.js`, so use separate output
directories when retaining both formats.

Runtime conversion also creates `standardGlyphNames.js` when a font uses the
standard Roman glyph table. Each font file is an importable ES module with a
default export.

## Parsed-data schema

The parsed-data module exports the parser's three data structures without
normalizing their values:

```js
export default {
  attributes: { FontName: 'Helvetica' },
  glyphWidths: { space: 278 },
  kernPairs: { 'A\0V': -70 },
};
```

This format is immediately usable after JavaScript module parsing and serves
as the low-decoding-cost baseline. Because glyph names are repeated in the
large kerning maps, it is only modestly smaller than AFM for proportional
fonts.

## Runtime schema

The runtime module keeps the font-level values PDFKit consumes and only the
glyphs reachable through its current 256-entry character mapping:

```js
import glyphNames from './standardGlyphNames.js';

export default {
  name: 'Helvetica',
  bbox: [-166, -225, 1000, 931],
  ascender: 718,
  descender: -207,
  xHeight: 523,
  capHeight: 718,
  glyphNames,
  glyphWidths: [278, 278, 355],
  kernPairs: [-70, [12, 4, 9]],
};
```

`standardGlyphNames.js` exports the identical space-separated 215-name table
used by all Courier, Helvetica, and Times variants. Bundlers include this
dependency once when one or more of those fonts are used. Symbol, ZapfDingbats,
and nonmatching AFMs keep their glyph-name strings inline.

`glyphWidths` uses indexes matching `glyphNames`. `kernPairs` alternates a
kerning amount and an array of delta-encoded pair IDs. A pair ID is
`leftIndex * glyphCount + rightIndex`. Pair IDs are sorted within each amount
group before delta encoding.

Decoder pseudocode:

```js
const names = data.glyphNames.split(' ');
const widths = Object.fromEntries(
  names.map((name, index) => [name, data.glyphWidths[index]]),
);
const kernPairs = {};

for (let index = 0; index < data.kernPairs.length; index += 2) {
  const amount = data.kernPairs[index];
  let pairId = 0;

  for (const delta of data.kernPairs[index + 1]) {
    pairId += delta;
    const left = Math.floor(pairId / names.length);
    const right = pairId % names.length;
    kernPairs[`${names[left]}\0${names[right]}`] = amount;
  }
}
```

## Format rationale

Across PDFKit's 14 AFMs, the raw sources are about 619 KB. Generated output,
including license headers, is about 550 KB for direct parsed data and 52 KB for
compact runtime data. Sharing the 1,492-byte Roman glyph-name string removes 11
duplicate copies from a complete runtime conversion. These size limits are
also guarded by the converter tests.

[`@pdf-lib/standard-fonts`](https://github.com/Hopding/standard-fonts) deflates
base64-encoded JSON, which is compact but requires inflation and JSON parsing
at runtime. [jsPDF](https://raw.githubusercontent.com/parallax/jsPDF/master/src/modules/standard_fonts_metrics.js)
uses custom numeric packing and a character-level decoder. The runtime format
here borrows numeric indexing and value grouping while retaining native
JavaScript numbers and arrays, avoiding an inflate dependency or custom token
parser. The source fields and `KPX` behavior follow the
[Adobe AFM specification](https://www.adobe.com/content/dam/acom/en/devnet/font/pdfs/5004.AFM_Spec.pdf)
and PDFKit's existing parser.
