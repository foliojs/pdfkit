import { vi } from 'vitest';
import PDFDocument from '../../lib/document';
import PDFTable from '../../lib/table';
import { deepMerge } from '../../lib/table/utils';
import fs from 'fs';

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

  describe('font', () => {
    test('column font', () => {
      const standardFont = 'Courier';
      const fontPath = 'tests/fonts/Roboto-Regular.ttf';
      const fontBuffer = fs.readFileSync('tests/fonts/Roboto-Regular.ttf');
      const document = new PDFDocument();
      const fontSpy = vi.spyOn(document, 'font');

      const table = document.table({
        columnStyles: [
          { font: { src: standardFont } },
          { font: { src: fontPath } },
          { font: { src: fontBuffer } },
        ],
      });
      table.row(['A', 'B', 'C']);
      expect(fontSpy).toHaveBeenCalledWith(
        standardFont,
        expect.toSatisfy(() => true),
      );
      expect(fontSpy).toHaveBeenCalledWith(
        fontPath,
        expect.toSatisfy(() => true),
      );
      expect(fontSpy).toHaveBeenCalledWith(
        fontBuffer,
        expect.toSatisfy(() => true),
      );
    });

    test('row font', () => {
      const standardFont = 'Courier';
      const fontPath = 'tests/fonts/Roboto-Regular.ttf';
      const fontBuffer = fs.readFileSync('tests/fonts/Roboto-Regular.ttf');
      const document = new PDFDocument();
      const fontSpy = vi.spyOn(document, 'font');

      const table = document.table({
        rowStyles: [
          { font: { src: standardFont } },
          { font: { src: fontPath } },
          { font: { src: fontBuffer } },
        ],
      });
      table.row(['A']);
      table.row(['B']);
      table.row(['C']);
      expect(fontSpy).toHaveBeenCalledWith(
        standardFont,
        expect.toSatisfy(() => true),
      );
      expect(fontSpy).toHaveBeenCalledWith(
        fontPath,
        expect.toSatisfy(() => true),
      );
      expect(fontSpy).toHaveBeenCalledWith(
        fontBuffer,
        expect.toSatisfy(() => true),
      );
    });

    test('cell font', () => {
      const standardFont = 'Courier';
      const fontPath = 'tests/fonts/Roboto-Regular.ttf';
      const fontBuffer = fs.readFileSync('tests/fonts/Roboto-Regular.ttf');
      const document = new PDFDocument();
      const fontSpy = vi.spyOn(document, 'font');

      const table = document.table();
      table.row([
        { text: 'A', font: { src: standardFont } },
        { text: 'B', font: { src: fontPath } },
        { text: 'C', font: { src: fontBuffer } },
      ]);
      expect(fontSpy).toHaveBeenCalledWith(
        standardFont,
        expect.toSatisfy(() => true),
      );
      expect(fontSpy).toHaveBeenCalledWith(
        fontPath,
        expect.toSatisfy(() => true),
      );
      expect(fontSpy).toHaveBeenCalledWith(
        fontBuffer,
        expect.toSatisfy(() => true),
      );
    });

    test('merge table font', () => {
      const colFamily = 'family1';
      const rowFamily = 'family2';
      const cellFamily = 'family3';
      const fontSrcs = {
        colStandardFont: 'Courier',
        colFontPath: 'tests/fonts/Roboto-Regular.ttf',
        colFontBuffer: fs.readFileSync('tests/fonts/Roboto-Regular.ttf'),
        rowStandardFont: 'Courier-Bold',
        rowFontPath: 'tests/fonts/Roboto-Medium.ttf',
        rowFontBuffer: fs.readFileSync('tests/fonts/Roboto-Medium.ttf'),
        cellStandardFont: 'Courier-Oblique',
        cellFontPath: 'tests/fonts/Roboto-MediumItalic.ttf',
        cellFontBuffer: fs.readFileSync('tests/fonts/Roboto-MediumItalic.ttf'),
      };
      const fontSrcSet = Object.values(fontSrcs);

      /**
       * Check whether given spy has been called with specified allowed fonts
       * and not other fonts within concerned font set
       * @param {*} fontSpy
       * @param {import('../../lib/table/utils').Font[]} allowedFonts
       */
      function expectFonts(
        fontSpy,
        allowedFonts = [],
        testedFonts = fontSrcSet,
      ) {
        const allowedFontSrc = allowedFonts.map((font) => {
          expect(fontSpy).toHaveBeenCalledWith(font.src, font.family);
          return font.src;
        });
        testedFonts.forEach((fontSrc) => {
          if (!allowedFontSrc.includes(fontSrc)) {
            expect(fontSpy).not.toHaveBeenCalledWith(
              fontSrc,
              expect.toSatisfy(() => true),
            );
          }
        });
      }
      const document = new PDFDocument();
      const fontSpy = vi.spyOn(document, 'font');

      const table = document.table({
        columnStyles: [
          { font: { src: fontSrcs.colStandardFont, family: colFamily } },
          { font: { src: fontSrcs.colFontPath, family: colFamily } },
          { font: { src: fontSrcs.colFontBuffer, family: colFamily } },
        ],
        rowStyles: [
          {},
          { font: { src: fontSrcs.rowStandardFont, family: rowFamily } },
          { font: { src: fontSrcs.rowFontPath, family: rowFamily } },
          { font: { src: fontSrcs.rowFontBuffer, family: rowFamily } },
          { font: { src: fontSrcs.rowFontBuffer, family: rowFamily } },
        ],
      });
      // fonts in column styles
      fontSpy.mockClear();
      table.row([{ text: 'A' }, { text: 'B' }, { text: 'C' }]);
      expectFonts(fontSpy, [
        { src: fontSrcs.colStandardFont, family: colFamily },
        { src: fontSrcs.colFontPath, family: colFamily },
        { src: fontSrcs.colFontBuffer, family: colFamily },
      ]);

      // fonts in column + row styles
      fontSpy.mockClear();
      table.row([{ text: 'A' }, { text: 'B' }, { text: 'C' }]);
      expectFonts(fontSpy, [
        { src: fontSrcs.rowStandardFont, family: rowFamily },
      ]);
      fontSpy.mockClear();
      table.row([{ text: 'A' }, { text: 'B' }, { text: 'C' }]);
      expectFonts(fontSpy, [{ src: fontSrcs.rowFontPath, family: rowFamily }]);
      fontSpy.mockClear();
      table.row([{ text: 'A' }, { text: 'B' }, { text: 'C' }]);
      expectFonts(fontSpy, [
        { src: fontSrcs.rowFontBuffer, family: rowFamily },
      ]);

      // fonts in column + row + cell style
      fontSpy.mockClear();
      table.row([
        {
          text: 'A',
          font: { src: fontSrcs.cellStandardFont, family: cellFamily },
        },
        { text: 'B', font: { src: fontSrcs.cellFontPath, family: cellFamily } },
        {
          text: 'C',
          font: { src: fontSrcs.cellFontBuffer, family: cellFamily },
        },
      ]);
      expectFonts(fontSpy, [
        { src: fontSrcs.cellStandardFont, family: cellFamily },
        { src: fontSrcs.cellFontPath, family: cellFamily },
        { src: fontSrcs.cellFontBuffer, family: cellFamily },
      ]);
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
      [
        { a: Buffer.from([1, 2, 3]) },
        { b: Buffer.from([4, 5, 6]) },
        { a: Buffer.from([1, 2, 3]), b: Buffer.from([4, 5, 6]) },
      ],
      [
        { a: new Uint8Array([1, 2, 3]) },
        { b: new Uint8Array([4, 5, 6]) },
        { a: new Uint8Array([1, 2, 3]), b: new Uint8Array([4, 5, 6]) },
      ],
    ])('%o -> %o', function () {
      const opts = Array.from(arguments);
      const expected = opts.splice(-1, 1)[0];
      expect(deepMerge(...opts)).toEqual(expected);
    });
  });
});
