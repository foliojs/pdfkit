import PDFDocument from '../../lib/document';

describe('page', function () {
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
