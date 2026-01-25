import PDFDocument from '../../lib/document';

describe('page', function () {
  describe('userUnit', function () {
    test('defaults to 1.0', function () {
      const doc = new PDFDocument();
      expect(doc.page.userUnit).toBe(1.0);
      expect(doc.page.dictionary.data.UserUnit).toBe(1.0);
    });

    test('can be set via page options', function () {
      const doc = new PDFDocument({ autoFirstPage: false });
      doc.addPage({ userUnit: 2.5 });
      expect(doc.page.userUnit).toBe(2.5);
      expect(doc.page.dictionary.data.UserUnit).toBe(2.5);
    });
  });

  test('cascade page options', function () {
    const doc = new PDFDocument({
      autoFirstPage: false,
      bufferPages: true,
    });
    doc.addPage({ size: [50, 50], margin: 0 });
    doc.text(Array(10).fill('TEST').join('\n'));
    doc._pageBuffer.forEach((page) => {
      expect(page.size).toEqual([50, 50]);
      expect(page.margins).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    });
  });
});
