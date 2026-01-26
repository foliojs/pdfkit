import PDFDocument from '../../lib/document';

describe('outline', () => {
  describe('PageMode', () => {
    test('sets PageMode to UseOutlines when not already set', () => {
      const doc = new PDFDocument();

      doc.outline.addItem('Test');
      doc.end();

      expect(doc._root.data.PageMode).toBe('UseOutlines');
    });

    test('preserves existing PageMode when already set', () => {
      const doc = new PDFDocument();
      doc._root.data.PageMode = 'FullScreen';

      doc.outline.addItem('Test');
      doc.end();

      expect(doc._root.data.PageMode).toBe('FullScreen');
    });
  });
});
