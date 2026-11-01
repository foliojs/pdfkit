import PDFDocument from '../../lib/document';
import { logData } from './helpers';

describe('page labels', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({ compress: false });
  });

  const catalog = (docData) =>
    docData.find((chunk) => `${chunk}`.includes('/Type /Catalog'));

  test('are not written by default', () => {
    const docData = logData(document);
    document.end();
    expect(catalog(docData)).not.toContain('/PageLabels');
  });

  test('write a number tree in page order to the catalog', () => {
    const docData = logData(document);
    document.addPageLabel(2, { style: 'decimal' });
    document.addPageLabel(0, { style: 'lowerRoman' });
    document.end();

    expect(catalog(docData)).toMatch(
      /\/PageLabels <<\s+\/Nums \[\s+0 <<\s+\/S \/r\s+>>\s+2 <<\s+\/S \/D\s+>>\s+\]\s+>>/,
    );
  });

  test('do not write /Limits, which a root node must not have', () => {
    const docData = logData(document);
    document.addPageLabel(0, { style: 'decimal' });
    document.addPageLabel(5, { style: 'decimal' });
    document.end();

    expect(catalog(docData)).not.toContain('/Limits');
  });

  test.each([
    ['decimal', 'D'],
    ['upperRoman', 'R'],
    ['lowerRoman', 'r'],
    ['upperAlpha', 'A'],
    ['lowerAlpha', 'a'],
  ])('map style %s to /%s', (style, name) => {
    document.addPageLabel(0, { style });
    expect(document._root.data.PageLabels.get(0).S).toBe(name);
  });

  test('write the prefix as a string and the start as a number', () => {
    const docData = logData(document);
    document.addPageLabel(0, {
      style: 'decimal',
      prefix: 'A-',
      start: 49,
    });
    document.end();

    expect(catalog(docData)).toMatch(/\/S \/D\s+\/P \(A-\)\s+\/St 49/);
  });

  test('cover the first page when the first range starts later', () => {
    document.addPageLabel(3, { style: 'upperAlpha' });
    expect(document._root.data.PageLabels.get(0)).toEqual({ S: 'D' });
  });

  test('let a later call replace the range of the first page', () => {
    document.addPageLabel(3, { style: 'upperAlpha' });
    document.addPageLabel(0, { style: 'lowerRoman' });
    expect(document._root.data.PageLabels.get(0)).toEqual({ S: 'r' });
  });

  test('allow a prefix without a style', () => {
    document.addPageLabel(0, { prefix: 'Cover' });
    expect(document._root.data.PageLabels.get(0).S).toBeUndefined();
  });

  test('return the document for chaining', () => {
    expect(document.addPageLabel(0)).toBe(document);
  });

  test.each([[-1], [1.5], ['1'], [undefined]])(
    'reject page index %s',
    (pageIndex) => {
      expect(() => document.addPageLabel(pageIndex)).toThrow(/pageIndex/);
    },
  );

  test('reject an unknown style', () => {
    expect(() => document.addPageLabel(0, { style: 'roman' })).toThrow(
      /style roman invalid/,
    );
    expect(() => document.addPageLabel(0, { style: 'constructor' })).toThrow(
      /invalid/,
    );
  });

  test.each([[0], [1.5], ['2']])('reject start %s', (start) => {
    expect(() => document.addPageLabel(0, { start })).toThrow(
      /start .* invalid/,
    );
  });
});
