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

    test.each([
      ['numbered', 'center', '1.', 300.324],
      ['numbered', 'right', '1.', 510.648],
      ['lettered', 'center', 'A.', 300.324],
      ['lettered', 'right', 'A.', 510.648],
    ])(
      '%s list with align %s keeps the label at the indent',
      (listType, align, label, bodyX) => {
        const docData = logData(document);

        document.list(['alpha', 'beta'], { listType, align });
        document.end();

        expect(docData).toContainText({ text: label, x: 72 });
        expect(docData).toContainText({ text: 'alpha', x: bodyX });
      },
    );

    test('numbered list with the default align is unchanged', () => {
      const docData = logData(document);

      document.list(['alpha', 'beta'], { listType: 'numbered' });
      document.end();

      expect(docData).toContainText({ text: '1.', x: 72 });
      expect(docData).toContainText({ text: 'alpha', x: 90 });
      expect(docData).toContainText({ text: '2.', x: 72 });
      expect(docData).toContainText({ text: 'beta', x: 90 });
    });

    test('numbered list counts from start - #1350', () => {
      const docData = logData(document);

      document.list(['alpha', 'beta'], { listType: 'numbered', start: 5 });
      document.end();

      expect(docData).toContainText({ text: '5.' });
      expect(docData).toContainText({ text: '6.' });
      expect(docData).not.toContainText({ text: '1.' });
    });

    test('lettered list counts from start', () => {
      const docData = logData(document);

      document.list(['alpha', 'beta'], { listType: 'lettered', start: 3 });
      document.end();

      expect(docData).toContainText({ text: 'C.' });
      expect(docData).toContainText({ text: 'D.' });
    });

    test('start applies to the top level only', () => {
      const docData = logData(document);

      document.list(['alpha', ['nested'], 'beta'], {
        listType: 'numbered',
        start: 7,
      });
      document.end();

      expect(docData).toContainText({ text: '7.' });
      expect(docData).toContainText({ text: '1.' });
      expect(docData).toContainText({ text: '8.' });
    });

    test('numbered list with align justify underlines only the label', () => {
      const docData = logData(document);

      document.list(['alpha', 'beta'], {
        listType: 'numbered',
        align: 'justify',
        underline: true,
      });
      document.end();

      // master throws on the first label, and draws the second to the width of
      // the first item's text
      expect(docData).toContainChunk(['stream', /72 82\.1 m\n82\.008 82\.1 l/]);
      expect(docData).toContainChunk([
        'stream',
        /72 95\.972 m\n82\.008 95\.972 l/,
      ]);
    });

    test('numbered list label link covers only the label', () => {
      const docData = logData(document);

      document.list(['alpha', 'beta'], {
        listType: 'numbered',
        link: 'http://example.com',
      });
      document.end();

      // the label of the second item must not be sized from the first item
      expect(docData).toContainChunk([
        '14 0 obj',
        '<<\n/Subtype /Link\n/A 13 0 R\n/Type /Annot\n/Rect [72 695.028 82.008 706.128]\n/Border [0 0 0]\n/F 4\n>>',
      ]);
    });
  });
});
