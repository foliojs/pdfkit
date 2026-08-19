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
