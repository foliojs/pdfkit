import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { createRequire } from 'module';
import { tmpdir } from 'os';
import path from 'path';
import { pathToFileURL } from 'url';
import AFMFont from '../../lib/font/afm';

const repositoryRoot = process.cwd();
const require = createRequire(import.meta.url);
const {
  convertFiles,
  STANDARD_GLYPH_NAMES,
  STANDARD_GLYPH_NAMES_FILE,
} = require('../../tools/afm-converter');
const afmDirectory = path.join(repositoryRoot, 'lib/font/data');
const afmFiles = readdirSync(afmDirectory)
  .filter((file) => file.endsWith('.afm'))
  .sort();
const afmPaths = afmFiles.map((file) => path.join(afmDirectory, file));

let temporaryDirectory;
let runtimeOutput;
let secondRuntimeOutput;
let parsedOutput;
let secondParsedOutput;

function runConverter(format, outputDirectory, inputs = []) {
  convertFiles(['--output-dir', outputDirectory, ...inputs], format, () => {});
}

function outputName(afmFile) {
  return `${path.basename(afmFile, '.afm').replaceAll('-', '')}.js`;
}

function readOutput(outputDirectory, afmFile) {
  return readFileSync(path.join(outputDirectory, outputName(afmFile)), 'utf8');
}

async function importOutput(outputDirectory, afmFile) {
  const file = path.join(outputDirectory, outputName(afmFile));
  return (await import(pathToFileURL(file).href)).default;
}

function javascriptFiles(outputDirectory) {
  return readdirSync(outputDirectory)
    .filter((file) => file.endsWith('.js'))
    .sort();
}

function enableESModules(outputDirectory) {
  writeFileSync(
    path.join(outputDirectory, 'package.json'),
    JSON.stringify({ type: 'module' }),
  );
}

function decodeRuntimeData(data) {
  const glyphNames = data.glyphNames ? data.glyphNames.split(' ') : [];
  const glyphWidths = Object.fromEntries(
    glyphNames.map((name, index) => [name, data.glyphWidths[index]]),
  );
  const kernPairs = {};

  for (let index = 0; index < data.kernPairs.length; index += 2) {
    const amount = data.kernPairs[index];
    let pairId = 0;

    for (const delta of data.kernPairs[index + 1]) {
      pairId += delta;
      const left = Math.floor(pairId / glyphNames.length);
      const right = pairId % glyphNames.length;
      kernPairs[`${glyphNames[left]}\0${glyphNames[right]}`] = amount;
    }
  }

  return { glyphNames, glyphWidths, kernPairs };
}

beforeAll(() => {
  temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'pdfkit-afm-'));
  runtimeOutput = path.join(temporaryDirectory, 'runtime');
  secondRuntimeOutput = path.join(temporaryDirectory, 'runtime-second');
  parsedOutput = path.join(temporaryDirectory, 'parsed');
  secondParsedOutput = path.join(temporaryDirectory, 'parsed-second');

  runConverter('runtime', runtimeOutput);
  runConverter('runtime', secondRuntimeOutput, [...afmPaths].reverse());
  runConverter('parsed', parsedOutput);
  runConverter('parsed', secondParsedOutput, [...afmPaths].reverse());
  for (const outputDirectory of [
    runtimeOutput,
    secondRuntimeOutput,
    parsedOutput,
    secondParsedOutput,
  ]) {
    enableESModules(outputDirectory);
  }
});

afterAll(() => {
  rmSync(temporaryDirectory, { recursive: true, force: true });
});

describe('AFM JavaScript converters', () => {
  test('create one independently named module per input font', () => {
    expect(javascriptFiles(runtimeOutput)).toEqual(
      [
        ...afmFiles.map((file) => outputName(file)),
        STANDARD_GLYPH_NAMES_FILE,
      ].sort(),
    );
    expect(javascriptFiles(parsedOutput)).toEqual(
      afmFiles.map((file) => outputName(file)).sort(),
    );
  });

  test('normalizes generated filenames', () => {
    expect(outputName('Helvetica-Bold.afm')).toBe('HelveticaBold.js');
    expect(outputName('Times-BoldItalic.afm')).toBe('TimesBoldItalic.js');
    expect(
      javascriptFiles(runtimeOutput).every((file) => !file.includes('-')),
    ).toBe(true);
  });

  test.each(afmFiles)('creates deterministic output for %s', (file) => {
    expect(readOutput(runtimeOutput, file)).toBe(
      readOutput(secondRuntimeOutput, file),
    );
    expect(readOutput(parsedOutput, file)).toBe(
      readOutput(secondParsedOutput, file),
    );
  });

  test('creates a deterministic standard glyph-name module', () => {
    expect(
      readFileSync(path.join(runtimeOutput, STANDARD_GLYPH_NAMES_FILE), 'utf8'),
    ).toBe(
      readFileSync(
        path.join(secondRuntimeOutput, STANDARD_GLYPH_NAMES_FILE),
        'utf8',
      ),
    );
  });

  test('shares glyph names across Courier, Helvetica, and Times modules', async () => {
    const sharedGlyphNames = (
      await import(
        pathToFileURL(path.join(runtimeOutput, STANDARD_GLYPH_NAMES_FILE)).href
      )
    ).default;
    expect(sharedGlyphNames).toBe(STANDARD_GLYPH_NAMES);

    const romanFiles = afmFiles.filter((file) =>
      /^(Courier|Helvetica|Times)/.test(file),
    );
    for (const file of romanFiles) {
      const source = readOutput(runtimeOutput, file);
      const generated = await importOutput(runtimeOutput, file);
      expect(source).toContain(
        `import glyphNames from './${STANDARD_GLYPH_NAMES_FILE}';`,
      );
      expect(source).toContain('glyphNames');
      expect(source).not.toContain(JSON.stringify(STANDARD_GLYPH_NAMES));
      expect(generated.glyphNames).toBe(sharedGlyphNames);
    }
  });

  test('keeps Symbol and ZapfDingbats glyph names inline', () => {
    for (const file of ['Symbol.afm', 'ZapfDingbats.afm']) {
      const source = readOutput(runtimeOutput, file);
      expect(source).not.toContain(`from './${STANDARD_GLYPH_NAMES_FILE}'`);
      expect(source).toMatch(/"glyphNames":"[^"]+"/);
    }
  });

  test('emits the companion for a single Roman font but not Symbol alone', () => {
    const romanOutput = path.join(temporaryDirectory, 'single-roman');
    const symbolOutput = path.join(temporaryDirectory, 'symbol-only');
    runConverter('runtime', romanOutput, [
      path.join(afmDirectory, 'Helvetica.afm'),
    ]);
    runConverter('runtime', symbolOutput, [
      path.join(afmDirectory, 'Symbol.afm'),
    ]);

    expect(javascriptFiles(romanOutput)).toEqual([
      'Helvetica.js',
      STANDARD_GLYPH_NAMES_FILE,
    ]);
    expect(javascriptFiles(symbolOutput)).toEqual(['Symbol.js']);
  });

  test.each(afmFiles)(
    'preserves the complete parsed state for %s',
    async (file) => {
      const contents = readFileSync(path.join(afmDirectory, file), 'utf8');
      const font = new AFMFont(contents);
      const generated = await importOutput(parsedOutput, file);

      expect(generated).toEqual({
        attributes: font.attributes,
        glyphWidths: font.glyphWidths,
        kernPairs: font.kernPairs,
      });
    },
  );

  test.each(afmFiles)(
    'preserves reachable runtime data for %s',
    async (file) => {
      const contents = readFileSync(path.join(afmDirectory, file), 'utf8');
      const font = new AFMFont(contents);
      const generated = await importOutput(runtimeOutput, file);
      const decoded = decodeRuntimeData(generated);
      const reachableGlyphs = new Set(
        Array.from({ length: 256 }, (_, index) => font.characterToGlyph(index)),
      );
      const expectedGlyphWidths = Object.fromEntries(
        Object.entries(font.glyphWidths).filter(([name]) =>
          reachableGlyphs.has(name),
        ),
      );
      const includedGlyphs = new Set(Object.keys(expectedGlyphWidths));
      const expectedKernPairs = Object.fromEntries(
        Object.entries(font.kernPairs).filter(([pair]) =>
          pair.split('\0').every((name) => includedGlyphs.has(name)),
        ),
      );

      expect(generated).toMatchObject({
        name: font.attributes.FontName,
        bbox: font.bbox,
        ascender: font.ascender,
        descender: font.descender,
        xHeight: font.xHeight,
        capHeight: font.capHeight,
      });
      expect(decoded.glyphWidths).toEqual(expectedGlyphWidths);
      expect(decoded.kernPairs).toEqual(expectedKernPairs);
      expect(
        decoded.glyphNames.every((name) => reachableGlyphs.has(name)),
      ).toBe(true);
    },
  );

  test('handles fonts with absent kerning and optional height metrics', async () => {
    const courier = await importOutput(runtimeOutput, 'Courier.afm');
    const symbol = await importOutput(runtimeOutput, 'Symbol.afm');
    const zapfDingbats = await importOutput(runtimeOutput, 'ZapfDingbats.afm');

    expect(courier.kernPairs).toEqual([]);
    expect(symbol).toMatchObject({
      ascender: 0,
      descender: 0,
      xHeight: 0,
      capHeight: 0,
      kernPairs: [],
    });
    expect(zapfDingbats).toMatchObject({
      ascender: 0,
      descender: 0,
      xHeight: 0,
      capHeight: 0,
      glyphNames: 'space',
      glyphWidths: [278],
      kernPairs: [],
    });
  });

  test('retains the Adobe notice and marks generated data as modified', () => {
    for (const format of ['runtime', 'parsed']) {
      const generated = readOutput(
        format === 'runtime' ? runtimeOutput : parsedOutput,
        'Helvetica.afm',
      );

      expect(generated).toContain('Generated from Helvetica.afm');
      expect(generated).toContain('this is a modification');
      expect(generated).toContain(
        'This file and the 14 PostScript(R) AFM files it accompanies',
      );
      const header = generated.slice(0, generated.indexOf('*/'));
      expect(header).toMatch(/Copyright.*Adobe Systems Incorporated/i);
      expect(header.match(/Copyright \(c\)/gi)).toHaveLength(1);
    }
  });

  test('keeps both generated corpora below their size limits', () => {
    const rawSize = afmPaths.reduce(
      (total, file) => total + readFileSync(file).byteLength,
      0,
    );
    const generatedSize = (outputDirectory) =>
      javascriptFiles(outputDirectory).reduce(
        (total, file) =>
          total + readFileSync(path.join(outputDirectory, file)).byteLength,
        0,
      );

    expect(generatedSize(parsedOutput)).toBeLessThan(rawSize);
    expect(generatedSize(runtimeOutput)).toBeLessThan(rawSize * 0.15);
  });

  test.each(['runtime', 'parsed'])(
    '%s conversion reports invalid command-line input without writing output',
    (format) => {
      const invalidAFM = path.join(temporaryDirectory, 'invalid.afm');
      writeFileSync(invalidAFM, 'not an AFM file');

      for (let index = 0; index < 5; index++) {
        const outputDirectory = path.join(
          temporaryDirectory,
          `invalid-${format}-${index}`,
        );
        const cases = [
          [],
          ['--output-dir', outputDirectory, 'README.md'],
          ['--output-dir', outputDirectory, 'missing.afm'],
          ['--output-dir', outputDirectory, invalidAFM],
          ['--output-dir', outputDirectory, afmPaths[0], afmPaths[0]],
        ];

        expect(() => convertFiles(cases[index], format, () => {})).toThrow();
        expect(existsSync(outputDirectory)).toBe(false);
      }
    },
  );
});
