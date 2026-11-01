import PDFDocument from '../../lib/document';

describe('pageNumber - #1408', () => {
  test('starts at 0 and follows addPage', () => {
    const doc = new PDFDocument();
    expect(doc.pageNumber).toBe(0);
    doc.addPage();
    expect(doc.pageNumber).toBe(1);
  });

  test('is null before the first page', () => {
    const doc = new PDFDocument({ autoFirstPage: false });
    expect(doc.pageNumber).toBeNull();
    doc.addPage();
    expect(doc.pageNumber).toBe(0);
  });

  test('follows switchToPage', () => {
    const doc = new PDFDocument({ bufferPages: true });
    doc.addPage();
    doc.addPage();
    doc.switchToPage(1);
    expect(doc.pageNumber).toBe(1);
    doc.switchToPage(0);
    expect(doc.pageNumber).toBe(0);
  });

  test('counts pages that were flushed', () => {
    const doc = new PDFDocument();
    doc.addPage();
    doc.addPage();
    expect(doc.bufferedPageRange().start).toBe(2);
    expect(doc.pageNumber).toBe(2);
  });

  test('follows text flowing onto a new page', () => {
    const doc = new PDFDocument();
    doc.text('line\n'.repeat(100));
    expect(doc.pageNumber).toBeGreaterThan(0);
    expect(doc.bufferedPageRange().start).toBe(doc.pageNumber);
  });
});
