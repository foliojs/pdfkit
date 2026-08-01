import { readFileSync, readdirSync } from 'fs';
import AFMFont from '../../lib/font/afm';

const afmDirectory = 'lib/font/data';
const expectedFonts = {
  'Courier-Bold.afm': {
    name: 'Courier-Bold',
    bbox: [-113, -250, 749, 801],
    ascender: 629,
    descender: -157,
    xHeight: 439,
    capHeight: 562,
    lineGap: 265,
    glyphCount: 315,
    spaceWidth: 600,
    kernPairCount: 0,
    avKern: 0,
  },
  'Courier-BoldOblique.afm': {
    name: 'Courier-BoldOblique',
    bbox: [-57, -250, 869, 801],
    ascender: 629,
    descender: -157,
    xHeight: 439,
    capHeight: 562,
    lineGap: 265,
    glyphCount: 315,
    spaceWidth: 600,
    kernPairCount: 0,
    avKern: 0,
  },
  'Courier-Oblique.afm': {
    name: 'Courier-Oblique',
    bbox: [-27, -250, 849, 805],
    ascender: 629,
    descender: -157,
    xHeight: 426,
    capHeight: 562,
    lineGap: 269,
    glyphCount: 315,
    spaceWidth: 600,
    kernPairCount: 0,
    avKern: 0,
  },
  'Courier.afm': {
    name: 'Courier',
    bbox: [-23, -250, 715, 805],
    ascender: 629,
    descender: -157,
    xHeight: 426,
    capHeight: 562,
    lineGap: 269,
    glyphCount: 315,
    spaceWidth: 600,
    kernPairCount: 0,
    avKern: 0,
  },
  'Helvetica-Bold.afm': {
    name: 'Helvetica-Bold',
    bbox: [-170, -228, 1003, 962],
    ascender: 718,
    descender: -207,
    xHeight: 532,
    capHeight: 718,
    lineGap: 265,
    glyphCount: 315,
    spaceWidth: 278,
    kernPairCount: 2481,
    avKern: -80,
  },
  'Helvetica-BoldOblique.afm': {
    name: 'Helvetica-BoldOblique',
    bbox: [-174, -228, 1114, 962],
    ascender: 718,
    descender: -207,
    xHeight: 532,
    capHeight: 718,
    lineGap: 265,
    glyphCount: 315,
    spaceWidth: 278,
    kernPairCount: 2481,
    avKern: -80,
  },
  'Helvetica-Oblique.afm': {
    name: 'Helvetica-Oblique',
    bbox: [-170, -225, 1116, 931],
    ascender: 718,
    descender: -207,
    xHeight: 523,
    capHeight: 718,
    lineGap: 231,
    glyphCount: 315,
    spaceWidth: 278,
    kernPairCount: 2705,
    avKern: -70,
  },
  'Helvetica.afm': {
    name: 'Helvetica',
    bbox: [-166, -225, 1000, 931],
    ascender: 718,
    descender: -207,
    xHeight: 523,
    capHeight: 718,
    lineGap: 231,
    glyphCount: 315,
    spaceWidth: 278,
    kernPairCount: 2705,
    avKern: -70,
  },
  'Symbol.afm': {
    name: 'Symbol',
    bbox: [-180, -293, 1090, 1010],
    ascender: 0,
    descender: 0,
    xHeight: 0,
    capHeight: 0,
    lineGap: 1303,
    glyphCount: 190,
    spaceWidth: 250,
    kernPairCount: 0,
    avKern: 0,
  },
  'Times-Bold.afm': {
    name: 'Times-Bold',
    bbox: [-168, -218, 1000, 935],
    ascender: 683,
    descender: -217,
    xHeight: 461,
    capHeight: 676,
    lineGap: 253,
    glyphCount: 315,
    spaceWidth: 250,
    kernPairCount: 2242,
    avKern: -145,
  },
  'Times-BoldItalic.afm': {
    name: 'Times-BoldItalic',
    bbox: [-200, -218, 996, 921],
    ascender: 683,
    descender: -217,
    xHeight: 462,
    capHeight: 669,
    lineGap: 239,
    glyphCount: 315,
    spaceWidth: 250,
    kernPairCount: 2038,
    avKern: -95,
  },
  'Times-Italic.afm': {
    name: 'Times-Italic',
    bbox: [-169, -217, 1010, 883],
    ascender: 683,
    descender: -217,
    xHeight: 441,
    capHeight: 653,
    lineGap: 200,
    glyphCount: 315,
    spaceWidth: 250,
    kernPairCount: 2321,
    avKern: -105,
  },
  'Times-Roman.afm': {
    name: 'Times-Roman',
    bbox: [-168, -218, 1000, 898],
    ascender: 683,
    descender: -217,
    xHeight: 450,
    capHeight: 662,
    lineGap: 216,
    glyphCount: 315,
    spaceWidth: 250,
    kernPairCount: 2073,
    avKern: -135,
  },
  'ZapfDingbats.afm': {
    name: 'ZapfDingbats',
    bbox: [-1, -143, 981, 820],
    ascender: 0,
    descender: 0,
    xHeight: 0,
    capHeight: 0,
    lineGap: 963,
    glyphCount: 202,
    spaceWidth: 278,
    kernPairCount: 0,
    avKern: 0,
  },
};

const afmFiles = readdirSync(afmDirectory)
  .filter((file) => file.endsWith('.afm'))
  .sort();

describe('AFMFont', () => {
  test('has expectations for every bundled AFM font', () => {
    expect(afmFiles).toEqual(Object.keys(expectedFonts).sort());
  });

  test.each(afmFiles)('sets font properties when parsing %s', (file) => {
    const expected = expectedFonts[file];
    const contents = readFileSync(`${afmDirectory}/${file}`, 'utf8');
    const font = new AFMFont(contents);

    expect(font.attributes.FontName).toBe(expected.name);
    // Bbox have trailing space in AFM files, parser does not trim it
    expect(font.attributes.FontBBox).toBe(`${expected.bbox.join(' ')} `);
    expect(font.bbox).toEqual(expected.bbox);
    expect(font.ascender).toBe(expected.ascender);
    expect(font.descender).toBe(expected.descender);
    expect(font.xHeight).toBe(expected.xHeight);
    expect(font.capHeight).toBe(expected.capHeight);
    expect(font.lineGap).toBe(expected.lineGap);
    expect(Object.keys(font.glyphWidths)).toHaveLength(expected.glyphCount);
    expect(font.glyphWidths.space).toBe(expected.spaceWidth);
    expect(Object.keys(font.kernPairs)).toHaveLength(expected.kernPairCount);
    expect(font.getKernPair('A', 'V')).toBe(expected.avKern);
    expect(JSON.stringify(font.glyphWidths, null, 2)).toMatchSnapshot(
      'glyph widths',
    );
    expect(JSON.stringify(font.kernPairs, null, 2)).toMatchSnapshot(
      'kern pairs',
    );

    if (expected.kernPairCount === 0) {
      expect(font.kernPairs).toEqual({});
    }
  });
});
