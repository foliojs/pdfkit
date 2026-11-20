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

  describe('column widths', () => {
    test.each([
      ['equal stars', ['*', '*'], [256, 256]],
      ['later minimum', ['*', { minWidth: 450 }], [62, 450]],
      ['earlier minimum', [{ minWidth: 450 }, '*'], [450, 62]],
      ['several stars', ['*', '*', { minWidth: 450 }], [31, 31, 450]],
      ['later maximum', ['*', { maxWidth: 62 }], [450, 62]],
      [
        'several maxima can release a minimum',
        [{ maxWidth: 120 }, { maxWidth: 120 }, { minWidth: 130 }, '*'],
        [120, 120, 136, 136],
      ],
      ['earlier maximum', [{ maxWidth: 62 }, '*'], [62, 450]],
      [
        'a maximum raises the share above a minimum',
        [{ minWidth: 200 }, { maxWidth: 10 }, '*'],
        [251, 10, 251],
      ],
      [
        'a minimum lowers the share below a maximum',
        [{ minWidth: 400 }, { maxWidth: 100 }, '*'],
        [400, 56, 56],
      ],
      [
        'interleaved fixed columns',
        [40, '*', 50, { minWidth: 300 }, '*'],
        [40, 61, 50, 300, 61],
      ],
      [
        'fractional widths',
        [50.5, '*', { minWidth: 300.25 }],
        [50.5, 161.25, 300.25],
      ],
      ['percentage widths', ['25%', '*', { minWidth: '50%' }], [128, 128, 256]],
      ['exact minima', [{ minWidth: 256 }, { minWidth: 256 }], [256, 256]],
      ['impossible minima', [{ minWidth: 300 }, { minWidth: 300 }], [300, 300]],
      ['all stars capped', [{ maxWidth: 100 }, { maxWidth: 200 }], [100, 200]],
      ['zero maximum is unbounded', ['*', { maxWidth: 0 }], [256, 256]],
    ])('%s', (_name, columnStyles, expected) => {
      const document = new PDFDocument({ margin: 50 });
      const table = document.table({ maxWidth: 512, columnStyles });
      table.row(columnStyles.map(() => ''));

      expect(table._columnWidths).toHaveLength(expected.length);
      expected.forEach((width, i) => {
        expect(table._columnWidths[i]).toBeCloseTo(width, 8);
        expect(table._columnXPos[i]).toBeCloseTo(
          50 + expected.slice(0, i).reduce((sum, value) => sum + value, 0),
          8,
        );
      });
      table.end();
      document.end();
    });

    test('uses the allocated columns for spanning cells', () => {
      const document = new PDFDocument({ margin: 50 });
      const boundsOfString = vi.spyOn(document, 'boundsOfString');
      const table = document.table({
        maxWidth: 512,
        columnStyles: ['*', '*', { minWidth: 450 }],
        defaultStyle: { padding: 0 },
      });
      table.row([{ text: 'ITEM', colSpan: 2 }, 'TOTAL']);

      expect(table._columnWidths).toEqual([31, 31, 450]);
      expect(boundsOfString).toHaveBeenCalledWith(
        'ITEM',
        0,
        0,
        expect.objectContaining({ width: 62 }),
      );
      table.end();
      document.end();
    });
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

describe('headerRows - #1657', () => {
  const rows = (count) =>
    Array.from({ length: count }, (_, i) => [`row ${i}`, `value ${i}`]);

  const draw = (table, options) => {
    const doc = new PDFDocument({ bufferPages: true, ...options });
    const drawn = [];
    const text = doc.text;
    doc.text = function (value, x, y, opts) {
      drawn.push({ value, y, page: this.page });
      return text.call(this, value, x, y, opts);
    };
    doc.table(table);
    return { doc, drawn, pages: doc.bufferedPageRange().count };
  };

  test('repeats one row at the top of each new page', () => {
    const { doc, drawn, pages } = draw({
      headerRows: 1,
      data: [['Name', 'Value'], ...rows(120)],
    });
    expect(pages).toBeGreaterThan(1);

    const headers = drawn.filter(({ value }) => value === 'Name');
    expect(headers).toHaveLength(pages);
    expect(new Set(headers.map(({ page }) => page)).size).toBe(pages);
    headers.forEach(({ y }) =>
      expect(y).toBeLessThan(doc.page.margins.top + 20),
    );
  });

  test('places the next row below the repeated row', () => {
    const { drawn, pages } = draw({
      headerRows: 1,
      data: [['Name', 'Value'], ...rows(120)],
    });
    expect(pages).toBeGreaterThan(1);

    const secondPage = drawn.find(
      ({ value, page }) => value === 'Name' && page !== drawn[0].page,
    ).page;
    const onPage = drawn.filter(({ page }) => page === secondPage);
    expect(onPage[0].value).toBe('Name');
    expect(onPage[1].value).toBe('Value');
    expect(onPage[2].y).toBeGreaterThan(onPage[0].y);
  });

  test('repeats several rows in order', () => {
    const { drawn, pages } = draw({
      headerRows: 2,
      data: [['A', 'B'], ['C', 'D'], ...rows(120)],
    });
    expect(pages).toBeGreaterThan(1);

    const firstNew = drawn.findIndex(({ page }) => page !== drawn[0].page);
    expect(
      drawn.slice(firstNew, firstNew + 4).map(({ value }) => value),
    ).toEqual(['A', 'B', 'C', 'D']);
    expect(drawn[firstNew + 2].y).toBeGreaterThan(drawn[firstNew].y);
  });

  test('repeats nothing by default', () => {
    const { drawn, pages } = draw({ data: [['Name', 'Value'], ...rows(120)] });
    expect(pages).toBeGreaterThan(1);
    expect(drawn.filter(({ value }) => value === 'Name')).toHaveLength(1);
  });

  test('skips the header when the next row would not fit below it', () => {
    const { doc, drawn, pages } = draw({
      headerRows: 1,
      rowStyles: (i) => (i === 2 ? { height: 640 } : {}),
      data: [
        ['Name', 'Value'],
        ['first', '1'],
        ['tall', '2'],
      ],
    });
    expect(pages).toBe(2);
    expect(doc.page.contentHeight).toBeLessThan(660);
    expect(drawn.filter(({ value }) => value === 'Name')).toHaveLength(1);
  });

  test('keeps a structured table to one row per data row', () => {
    const doc = new PDFDocument({ tagged: true, pdfVersion: '1.7' });
    const markContent = vi.spyOn(doc, 'markContent');
    const struct = vi.spyOn(doc, 'struct');
    doc.table({
      structParent: doc,
      headerRows: 1,
      data: [['Name', 'Value'], ...rows(120)],
    });
    expect(struct.mock.calls.filter(([type]) => type === 'TR')).toHaveLength(
      121,
    );
    expect(
      markContent.mock.calls.filter(([type]) => type === 'Artifact').length,
    ).toBeGreaterThan(0);
    doc.end();
  });
});
