import fs from 'fs';
import { vi } from 'vitest';
import PDFDocument from '../../lib/document';
import PDFTable from '../../lib/table';
import { deepMerge } from '../../lib/table/utils';

describe('table', () => {
  test('created', () => {
    const document = new PDFDocument();
    expect(document.table()).toBeInstanceOf(PDFTable);
    expect(document.table({ data: [] })).toBe(document);
  });
  test('row', () => {
    const document = new PDFDocument();
    const table = document.table();
    table.row(['A', 'B', 'C']);
    expect(table._columnWidths.length).toBe(3);
  });

  describe('font resolution across style levels', () => {
    const REGULAR = 'tests/fonts/Roboto-Regular.ttf';
    const MEDIUM = 'tests/fonts/Roboto-Medium.ttf';

    test('a cell overriding only src does not inherit the row family', () => {
      // `family` names a subfamily/variation inside the src, so carrying the
      // row's family over to a different src produced a pair that was never
      // configured. With a real font that threw "Variations require a font with
      // the fvar, gvar and glyf, or CFF2 tables".
      const document = new PDFDocument({ font: REGULAR });
      const spy = vi.spyOn(document, 'font');

      expect(() =>
        document
          .table({ rowStyles: [{ font: { src: REGULAR, family: 'Roboto' } }] })
          .row([{ text: 'x', font: { src: MEDIUM } }]),
      ).not.toThrow();

      expect(spy).toHaveBeenCalledWith(MEDIUM, undefined);
      expect(spy).not.toHaveBeenCalledWith(MEDIUM, 'Roboto');
    });

    test('a binary font src is passed through untouched', () => {
      // deepMerge deep-cloned the src, turning a Buffer/Uint8Array into a plain
      // object of numeric keys, so the font no longer looked like a font:
      // "Not a supported font format or standard PDF font." It also made that
      // merge walk every byte of the file.
      const document = new PDFDocument({ font: REGULAR });
      const spy = vi.spyOn(document, 'font');
      const buffer = fs.readFileSync(REGULAR);

      expect(() =>
        document.table().row([{ text: 'x', font: { src: buffer } }]),
      ).not.toThrow();

      // the very same object, not a copy of it
      expect(spy.mock.calls.some(([src]) => src === buffer)).toBe(true);
    });

    test('a cell overriding only family still refines the inherited src', () => {
      const document = new PDFDocument({ font: REGULAR });
      // Resolution only - the font is stubbed so that an arbitrary family name
      // does not have to exist inside the file.
      const spy = vi.spyOn(document, 'font').mockReturnThis();

      document
        .table({ rowStyles: [{ font: { src: REGULAR } }] })
        .row([{ text: 'x', font: { family: 'Condensed' } }]);

      expect(spy).toHaveBeenCalledWith(REGULAR, 'Condensed');
    });
  });

  describe('text mask', () => {
    // Returns the rect of each clip applied while rendering
    function textMasks(document, render) {
      const rect = vi.spyOn(document, 'rect');
      const clip = vi.spyOn(document, 'clip');
      render();
      return clip.mock.invocationCallOrder.map((order) => {
        const i = rect.mock.invocationCallOrder.findLastIndex((o) => o < order);
        return rect.mock.calls[i];
      });
    }

    test('leaves room for glyphs that rise above the ascender', () => {
      // Accented capitals such as Ä and Õ rise above the Helvetica ascender
      // (718), up to the top of its bbox (931). The first line starts at the
      // ascender, so a mask at the top padding cut off their accents.
      const document = new PDFDocument({ margin: 0 });
      const [[, y, , height]] = textMasks(document, () =>
        document.table().row(['ÕÜÖÄ'], true),
      );
      const padding = 3; // default 0.25em at 12pt
      const overshoot = ((931 - 718) / 1000) * 12;
      expect(y).toBeCloseTo(padding - overshoot);
      // the bottom of the mask still stops at the padding
      expect(y + height).toBeCloseTo(document.y - padding);
    });

    test('does not extend past the top of the cell', () => {
      const document = new PDFDocument({ margin: 0 });
      const [[, y, , height]] = textMasks(document, () =>
        document.table({ defaultStyle: { padding: 1 } }).row(['ÕÜÖÄ'], true),
      );
      expect(y).toBeCloseTo(0);
      expect(y + height).toBeCloseTo(document.y - 1);
    });

    test('uses the bbox of an embedded font', () => {
      const document = new PDFDocument({
        margin: 0,
        font: 'tests/fonts/Roboto-Regular.ttf',
      });
      const [[, y]] = textMasks(document, () =>
        document.table().row(['ÕÜÖÄ'], true),
      );
      const { font } = document._font;
      const overshoot = ((font.bbox.maxY - font.ascent) / font.unitsPerEm) * 12;
      expect(overshoot).toBeGreaterThan(0);
      expect(y).toBeCloseTo(3 - overshoot);
    });
  });
});

describe('utils', () => {
  describe('deepMerge', () => {
    test.each([
      [{ a: 'hello' }, { b: 'world' }, { a: 'hello', b: 'world' }],
      [{ a: 'hello' }, { a: 'world' }, { a: 'world' }],
      [{}, { a: 'hello' }, { a: 'hello' }],
      [{ a: 'hello' }, undefined, { a: 'hello' }],
      [undefined, null, undefined],
      [1, 2, 1],
      [1, {}, 1],
      [{ a: 'hello' }, { a: {} }, { a: 'hello' }],
      [{ a: { b: 'hello' } }, { a: { b: 'world' } }, { a: { b: 'world' } }],
    ])('%o -> %o', function () {
      const opts = Array.from(arguments);
      const expected = opts.splice(-1, 1)[0];
      expect(deepMerge(...opts)).toEqual(expected);
    });
  });
});
