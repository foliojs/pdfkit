import AFMFont from '../../lib/font/afm';
import Courier from '../../lib/font/generated/Courier';
import CourierBold from '../../lib/font/generated/CourierBold';
import CourierBoldOblique from '../../lib/font/generated/CourierBoldOblique';
import CourierOblique from '../../lib/font/generated/CourierOblique';
import Helvetica from '../../lib/font/generated/Helvetica';
import HelveticaBold from '../../lib/font/generated/HelveticaBold';
import HelveticaBoldOblique from '../../lib/font/generated/HelveticaBoldOblique';
import HelveticaOblique from '../../lib/font/generated/HelveticaOblique';
import Symbol from '../../lib/font/generated/Symbol';
import TimesBold from '../../lib/font/generated/TimesBold';
import TimesBoldItalic from '../../lib/font/generated/TimesBoldItalic';
import TimesItalic from '../../lib/font/generated/TimesItalic';
import TimesRoman from '../../lib/font/generated/TimesRoman';
import ZapfDingbats from '../../lib/font/generated/ZapfDingbats';

const expectedFonts = [
  {
    data: CourierBold,
    bbox: [-113, -250, 749, 801],
    ascender: 629,
    descender: -157,
    xHeight: 439,
    capHeight: 562,
    lineGap: 265,
    glyphCount: 215,
    spaceWidth: 600,
    kernPairCount: 0,
    avKern: 0,
  },
  {
    data: CourierBoldOblique,
    bbox: [-57, -250, 869, 801],
    ascender: 629,
    descender: -157,
    xHeight: 439,
    capHeight: 562,
    lineGap: 265,
    glyphCount: 215,
    spaceWidth: 600,
    kernPairCount: 0,
    avKern: 0,
  },
  {
    data: CourierOblique,
    bbox: [-27, -250, 849, 805],
    ascender: 629,
    descender: -157,
    xHeight: 426,
    capHeight: 562,
    lineGap: 269,
    glyphCount: 215,
    spaceWidth: 600,
    kernPairCount: 0,
    avKern: 0,
  },
  {
    data: Courier,
    bbox: [-23, -250, 715, 805],
    ascender: 629,
    descender: -157,
    xHeight: 426,
    capHeight: 562,
    lineGap: 269,
    glyphCount: 215,
    spaceWidth: 600,
    kernPairCount: 0,
    avKern: 0,
  },
  {
    data: HelveticaBold,
    bbox: [-170, -228, 1003, 962],
    ascender: 718,
    descender: -207,
    xHeight: 532,
    capHeight: 718,
    lineGap: 265,
    glyphCount: 215,
    spaceWidth: 278,
    kernPairCount: 1102,
    avKern: -80,
  },
  {
    data: HelveticaBoldOblique,
    bbox: [-174, -228, 1114, 962],
    ascender: 718,
    descender: -207,
    xHeight: 532,
    capHeight: 718,
    lineGap: 265,
    glyphCount: 215,
    spaceWidth: 278,
    kernPairCount: 1102,
    avKern: -80,
  },
  {
    data: HelveticaOblique,
    bbox: [-170, -225, 1116, 931],
    ascender: 718,
    descender: -207,
    xHeight: 523,
    capHeight: 718,
    lineGap: 231,
    glyphCount: 215,
    spaceWidth: 278,
    kernPairCount: 1220,
    avKern: -70,
  },
  {
    data: Helvetica,
    bbox: [-166, -225, 1000, 931],
    ascender: 718,
    descender: -207,
    xHeight: 523,
    capHeight: 718,
    lineGap: 231,
    glyphCount: 215,
    spaceWidth: 278,
    kernPairCount: 1220,
    avKern: -70,
  },
  {
    data: Symbol,
    bbox: [-180, -293, 1090, 1010],
    ascender: 0,
    descender: 0,
    xHeight: 0,
    capHeight: 0,
    lineGap: 1303,
    glyphCount: 43,
    spaceWidth: 250,
    kernPairCount: 0,
    avKern: 0,
  },
  {
    data: TimesBold,
    bbox: [-168, -218, 1000, 935],
    ascender: 683,
    descender: -217,
    xHeight: 461,
    capHeight: 676,
    lineGap: 253,
    glyphCount: 215,
    spaceWidth: 250,
    kernPairCount: 996,
    avKern: -145,
  },
  {
    data: TimesBoldItalic,
    bbox: [-200, -218, 996, 921],
    ascender: 683,
    descender: -217,
    xHeight: 462,
    capHeight: 669,
    lineGap: 239,
    glyphCount: 215,
    spaceWidth: 250,
    kernPairCount: 930,
    avKern: -95,
  },
  {
    data: TimesItalic,
    bbox: [-169, -217, 1010, 883],
    ascender: 683,
    descender: -217,
    xHeight: 441,
    capHeight: 653,
    lineGap: 200,
    glyphCount: 215,
    spaceWidth: 250,
    kernPairCount: 961,
    avKern: -105,
  },
  {
    data: TimesRoman,
    bbox: [-168, -218, 1000, 898],
    ascender: 683,
    descender: -217,
    xHeight: 450,
    capHeight: 662,
    lineGap: 216,
    glyphCount: 215,
    spaceWidth: 250,
    kernPairCount: 935,
    avKern: -135,
  },
  {
    data: ZapfDingbats,
    bbox: [-1, -143, 981, 820],
    ascender: 0,
    descender: 0,
    xHeight: 0,
    capHeight: 0,
    lineGap: 963,
    glyphCount: 1,
    spaceWidth: 278,
    kernPairCount: 0,
    avKern: 0,
  },
];

describe('AFMFont', () => {
  test.each(expectedFonts)(
    'decodes generated metrics for $data.name',
    (expected) => {
      const font = new AFMFont(expected.data);

      expect(font.name).toBe(expected.data.name);
      expect(font.bbox).toEqual(expected.bbox);
      expect(font.ascender).toBe(expected.ascender);
      expect(font.descender).toBe(expected.descender);
      expect(font.xHeight).toBe(expected.xHeight);
      expect(font.capHeight).toBe(expected.capHeight);
      expect(font.lineGap).toBe(expected.lineGap);
      expect(Object.keys(font.glyphWidths)).toHaveLength(expected.glyphCount);
      expect(font.widthOfGlyph('space')).toBe(expected.spaceWidth);
      expect(Object.keys(font.kernPairs)).toHaveLength(expected.kernPairCount);
      expect(font.getKernPair('A', 'V')).toBe(expected.avKern);
    },
  );

  test('preserves encoding and glyph advance behavior', () => {
    const font = new AFMFont(Helvetica);

    expect(font.encodeText('A€')).toEqual(['41', '80']);
    expect(font.glyphsForString('A€')).toEqual(['A', 'Euro']);
    expect(font.advancesForGlyphs(['A', 'V'])).toEqual([597, 667]);
    expect(font.characterToGlyph('☃'.charCodeAt(0))).toBe('.notdef');
    expect(font.widthOfGlyph('.notdef')).toBe(0);
    expect(font.getKernPair('A', '.notdef')).toBe(0);
  });

  test('does not mutate generated data while decoding it', () => {
    const originalData = JSON.stringify(Helvetica);
    const font = new AFMFont(Helvetica);

    font.bbox[0] = 0;
    expect(JSON.stringify(Helvetica)).toBe(originalData);
  });
});
