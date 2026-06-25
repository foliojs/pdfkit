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
    test('colum standard font', () => {
      const document = new PDFDocument();
      const table = document.table({
        columnStyles: {
          font: { src: 'Courier' },
        },
      });
      table.row(['A']);
      expect(table._columnWidths.length).toBe(1);
    });

    test('colum embeded font with path', () => {
      const document = new PDFDocument();
      const table = document.table({
        columnStyles: {
          font: { src: 'tests/fonts/Roboto-Regular.ttf' },
        },
      });
      table.row(['A']);
      expect(table._columnWidths.length).toBe(1);
    });

    test('colum embeded font with Buffer', () => {
      const document = new PDFDocument();
      const buffer = fs.readFileSync('tests/fonts/Roboto-Regular.ttf');
      console.log('buffer instanceof Buffer:', buffer instanceof Buffer);
      const table = document.table({
        columnStyles: {
          font: {
            src: buffer,
          },
        },
      });
      table.row(['A']);
      expect(table._columnWidths.length).toBe(1);
    });

    test('row standard font', () => {
      const document = new PDFDocument();
      const table = document.table({
        rowStyles: {
          font: { src: 'Courier' },
        },
      });
      table.row(['A']);
      expect(table._columnWidths.length).toBe(1);
    });

    test('row embeded font with path', () => {
      const document = new PDFDocument();
      const table = document.table({
        rowStyles: {
          font: { src: 'tests/fonts/Roboto-Regular.ttf' },
        },
      });
      table.row(['A']);
      expect(table._columnWidths.length).toBe(1);
    });

    test('row embeded font with Buffer', () => {
      const document = new PDFDocument();
      const buffer = fs.readFileSync('tests/fonts/Roboto-Regular.ttf');
      console.log('buffer instanceof Buffer:', buffer instanceof Buffer);
      const table = document.table({
        rowStyles: {
          font: {
            src: buffer,
          },
        },
      });
      table.row(['A']);
      expect(table._columnWidths.length).toBe(1);
    });

    test('cell standard font', () => {
      const document = new PDFDocument();
      const table = document.table();
      table.row([
        {
          text: 'A',
          font: {
            src: 'Courier',
          },
        },
      ]);
      expect(table._columnWidths.length).toBe(1);
    });

    test('cell embeded font with path', () => {
      const document = new PDFDocument();
      const table = document.table();
      table.row([
        {
          text: 'A',
          font: {
            src: 'tests/fonts/Roboto-Regular.ttf',
          },
        },
      ]);
      expect(table._columnWidths.length).toBe(1);
    });

    test('cell embeded font with Buffer', () => {
      const document = new PDFDocument();
      const table = document.table();
      table.row([
        {
          text: 'A',
          font: {
            src: fs.readFileSync('tests/fonts/Roboto-Regular.ttf'),
          },
        },
      ]);
      expect(table._columnWidths.length).toBe(1);
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
