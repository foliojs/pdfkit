const fs = require('fs');
const path = require('path');

const RUNTIME_GLYPH_NAMES = `\
.notdef space exclam quotedbl numbersign dollar percent ampersand quotesingle
parenleft parenright asterisk plus comma hyphen period slash zero one two three
four five six seven eight nine colon semicolon less equal greater question at A
B C D E F G H I J K L M N O P Q R S T U V W X Y Z bracketleft backslash
bracketright asciicircum underscore grave a b c d e f g h i j k l m n o p q r
s t u v w x y z braceleft bar braceright asciitilde Euro quotesinglbase florin
quotedblbase ellipsis dagger daggerdbl circumflex perthousand Scaron
guilsinglleft OE Zcaron quoteleft quoteright quotedblleft quotedblright bullet
endash emdash tilde trademark scaron guilsinglright oe zcaron ydieresis
exclamdown cent sterling currency yen brokenbar section dieresis copyright
ordfeminine guillemotleft logicalnot registered macron degree plusminus
twosuperior threesuperior acute mu paragraph periodcentered cedilla onesuperior
ordmasculine guillemotright onequarter onehalf threequarters questiondown Agrave
Aacute Acircumflex Atilde Adieresis Aring AE Ccedilla Egrave Eacute Ecircumflex
Edieresis Igrave Iacute Icircumflex Idieresis Eth Ntilde Ograve Oacute
Ocircumflex Otilde Odieresis multiply Oslash Ugrave Uacute Ucircumflex Udieresis
Yacute Thorn germandbls agrave aacute acircumflex atilde adieresis aring ae
ccedilla egrave eacute ecircumflex edieresis igrave iacute icircumflex idieresis
eth ntilde ograve oacute ocircumflex otilde odieresis divide oslash ugrave
uacute ucircumflex udieresis yacute thorn`.split(/\s+/);

const STANDARD_GLYPH_NAMES = RUNTIME_GLYPH_NAMES.filter(
  (name) => name !== '.notdef',
).join(' ');
const STANDARD_GLYPH_NAMES_FILE = 'standardGlyphNames.js';
const DEFAULT_AFM_DIRECTORY = path.join(__dirname, '../lib/font/data');

const ADOBE_DISTRIBUTION_NOTICE =
  'This file and the 14 PostScript(R) AFM files it accompanies may be used, ' +
  'copied, and distributed for any purpose and without charge, with or ' +
  'without modification, provided that all copyright notices are retained; ' +
  'that the AFM files are not distributed without this file; that all ' +
  'modifications to this file or any of the AFM files are prominently noted ' +
  'in the modified file(s); and that this paragraph is not modified. Adobe ' +
  'Systems has no responsibility or obligation to support the use of the AFM ' +
  'files.';

function parseAFM(contents) {
  const attributes = {};
  const glyphWidths = {};
  const kernPairs = {};
  let section = '';

  for (const line of contents.split('\n')) {
    let match;
    let attribute;

    if ((match = line.match(/^Start(\w+)/))) {
      section = match[1];
      continue;
    } else if (/^End(\w+)/.test(line)) {
      section = '';
      continue;
    }

    switch (section) {
      case 'FontMetrics': {
        match = line.match(/(^\w+)\s+(.*)/);
        if (!match) {
          throw new Error(`Invalid font metrics line: ${line}`);
        }

        const key = match[1];
        const value = match[2];
        if ((attribute = attributes[key])) {
          if (!Array.isArray(attribute)) {
            attribute = attributes[key] = [attribute];
          }
          attribute.push(value);
        } else {
          attributes[key] = value;
        }
        break;
      }

      case 'CharMetrics': {
        if (!/^CH?\s/.test(line)) {
          continue;
        }

        const nameMatch = line.match(/\bN\s+(\.?\w+)\s*;/);
        const widthMatch = line.match(/\bWX\s+(\d+)\s*;/);
        if (!nameMatch || !widthMatch) {
          throw new Error(`Invalid character metrics line: ${line}`);
        }

        glyphWidths[nameMatch[1]] = +widthMatch[1];
        break;
      }

      case 'KernPairs': {
        match = line.match(/^KPX\s+(\.?\w+)\s+(\.?\w+)\s+(-?\d+)/);
        if (match) {
          kernPairs[`${match[1]}\0${match[2]}`] = parseInt(match[3]);
        }
        break;
      }
    }
  }

  if (!attributes.FontName || !attributes.FontBBox) {
    throw new Error('AFM data is missing FontName or FontBBox.');
  }

  return { attributes, glyphWidths, kernPairs };
}

function createParsedData(parsed) {
  return parsed;
}

function createRuntimeData(parsed) {
  const { attributes, glyphWidths, kernPairs } = parsed;
  const glyphNames = RUNTIME_GLYPH_NAMES.filter((name) =>
    Object.hasOwn(glyphWidths, name),
  );
  const glyphIndexes = Object.fromEntries(
    glyphNames.map((name, index) => [name, index]),
  );
  const pairsByAmount = new Map();

  for (const [pair, amount] of Object.entries(kernPairs)) {
    const [left, right] = pair.split('\0');
    if (!(left in glyphIndexes) || !(right in glyphIndexes)) {
      continue;
    }

    let pairIds = pairsByAmount.get(amount);
    if (!pairIds) {
      pairIds = [];
      pairsByAmount.set(amount, pairIds);
    }

    pairIds.push(glyphIndexes[left] * glyphNames.length + glyphIndexes[right]);
  }

  const compactKernPairs = [];
  const amounts = [...pairsByAmount.keys()].sort((a, b) => a - b);
  for (const amount of amounts) {
    const pairIds = pairsByAmount.get(amount).sort((a, b) => a - b);
    const deltas = pairIds.map((pairId, index) =>
      index === 0 ? pairId : pairId - pairIds[index - 1],
    );
    compactKernPairs.push(amount, deltas);
  }

  return {
    name: attributes.FontName,
    bbox: attributes.FontBBox.trim().split(/\s+/).map(Number),
    ascender: +(attributes.Ascender || 0),
    descender: +(attributes.Descender || 0),
    xHeight: +(attributes.XHeight || 0),
    capHeight: +(attributes.CapHeight || 0),
    glyphNames: glyphNames.join(' '),
    glyphWidths: glyphNames.map((name) => glyphWidths[name]),
    kernPairs: compactKernPairs,
  };
}

function asArray(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function createHeader(inputName, attributes) {
  const notices = asArray(attributes.Notice).map((notice) => ` * ${notice}`);

  return [
    '/*',
    ` * Generated from ${inputName}. Do not edit directly.`,
    ' * The source AFM metrics were converted to JavaScript; this is a modification.',
    ...notices,
    ' *',
    ` * ${ADOBE_DISTRIBUTION_NOTICE}`,
    ' */',
  ].join('\n');
}

function createModule(inputName, parsed, format) {
  const header = createHeader(inputName, parsed.attributes);
  if (format === 'parsed') {
    return {
      output: `${header}\nexport default ${JSON.stringify(createParsedData(parsed))};\n`,
      usesStandardGlyphNames: false,
    };
  }

  const data = createRuntimeData(parsed);
  if (data.glyphNames !== STANDARD_GLYPH_NAMES) {
    return {
      output: `${header}\nexport default ${JSON.stringify(data)};\n`,
      usesStandardGlyphNames: false,
    };
  }

  const serialized = JSON.stringify(data).replace(
    `"glyphNames":${JSON.stringify(STANDARD_GLYPH_NAMES)}`,
    'glyphNames',
  );
  return {
    output:
      `${header}\n` +
      `import glyphNames from './${STANDARD_GLYPH_NAMES_FILE}';\n` +
      `export default ${serialized};\n`,
    usesStandardGlyphNames: true,
  };
}

function createStandardGlyphNamesModule() {
  return (
    '/* Generated by tools/convert-afm-runtime.js. Do not edit directly. */\n' +
    `export default ${JSON.stringify(STANDARD_GLYPH_NAMES)};\n`
  );
}

function parseArguments(argv) {
  let outputDirectory;
  const inputs = [];

  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === '--output-dir') {
      outputDirectory = argv[++index];
      if (!outputDirectory || outputDirectory.startsWith('--')) {
        throw new Error('--output-dir requires a directory.');
      }
    } else if (argument.startsWith('--')) {
      throw new Error(`Unknown option: ${argument}`);
    } else {
      inputs.push(argument);
    }
  }

  if (!outputDirectory) {
    throw new Error('Usage: --output-dir <directory> [font.afm ...]');
  }

  if (inputs.length === 0) {
    inputs.push(
      ...fs
        .readdirSync(DEFAULT_AFM_DIRECTORY)
        .filter((file) => path.extname(file).toLowerCase() === '.afm')
        .sort()
        .map((file) => path.join(DEFAULT_AFM_DIRECTORY, file)),
    );
  }

  return { outputDirectory, inputs };
}

function convertFiles(argv, format, log = console.log) {
  const { outputDirectory, inputs } = parseArguments(argv);
  const conversions = [];
  const outputNames = new Set();

  for (const input of inputs) {
    if (path.extname(input).toLowerCase() !== '.afm') {
      throw new Error(`Expected an .afm input file: ${input}`);
    }

    const basename = path.basename(input, path.extname(input));
    const outputName = `${basename.replaceAll('-', '')}.js`;
    if (outputNames.has(outputName)) {
      throw new Error(`Duplicate output filename: ${outputName}`);
    }
    outputNames.add(outputName);

    const contents = fs.readFileSync(input, 'utf8');
    const parsed = parseAFM(contents);
    const generatedModule = createModule(path.basename(input), parsed, format);
    conversions.push({
      input,
      inputBytes: Buffer.byteLength(contents),
      outputName,
      ...generatedModule,
    });
  }

  fs.mkdirSync(outputDirectory, { recursive: true });
  if (
    conversions.some(({ usesStandardGlyphNames }) => usesStandardGlyphNames)
  ) {
    const output = createStandardGlyphNamesModule();
    const outputPath = path.join(outputDirectory, STANDARD_GLYPH_NAMES_FILE);
    fs.writeFileSync(outputPath, output);
    log(
      `Standard glyph names -> ${outputPath} ` +
        `(${Buffer.byteLength(output)} bytes)`,
    );
  }

  for (const conversion of conversions) {
    const outputPath = path.join(outputDirectory, conversion.outputName);
    fs.writeFileSync(outputPath, conversion.output);
    const outputBytes = Buffer.byteLength(conversion.output);
    const reduction = (100 * (1 - outputBytes / conversion.inputBytes)).toFixed(
      1,
    );
    log(
      `${conversion.input} -> ${outputPath} ` +
        `(${conversion.inputBytes} -> ${outputBytes} bytes, ${reduction}% smaller)`,
    );
  }
}

module.exports = {
  convertFiles,
  createParsedData,
  createRuntimeData,
  parseAFM,
  RUNTIME_GLYPH_NAMES,
  STANDARD_GLYPH_NAMES,
  STANDARD_GLYPH_NAMES_FILE,
};
