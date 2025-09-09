import PDFDocument from '../../lib/document';
import { logData } from './helpers';

describe('List', () => {
  /**
   * @type {PDFDocument}
   */
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
      compress: false,
    });
  });

  describe('list', () => {
    test('with simple content', () => {
      const docData = logData(document);

      document.list(['item 1', 'item 2', 'item 3']);
      document.end();

      expect(docData).toContainText({ text: 'item 1' });
      expect(docData).toContainText({ text: 'item 2' });
      expect(docData).toContainText({ text: 'item 3' });
    });

    test('position after automatic new page - #1596', () => {
      const docData = logData(document);

      document.text('near the bottom of the page', 0, 680);
      document.list(['item 4', 'item 5', 'item 6']);

      document.end();

      expect(docData).toContainText({ text: 'item 4', x: 15 });
      expect(docData).toContainText({ text: 'item 5', x: 15 });
      expect(docData).toContainText({ text: 'item 6', x: 15 });
    });
  });
});
