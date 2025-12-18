import PDFDocument from '../../lib/document';
import { logData } from './helpers';

describe('Text', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
      compress: false,
    });
  });

  describe('text', () => {
    test('with simple content', () => {
      const docData = logData(document);

      document.text('simple text');
      document.end();

      expect(docData).toContainText({ text: 'simple text' });
    });

    test('with destination', () => {
      // just check that there is no exception
      document.text('simple text', { destination: 'anchor' });
    });

    test('with content ending after page right margin', () => {
      const docData = logData(document);

      const textStream = Buffer.from(
        `1 0 0 -1 0 792 cm
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 600 763.384 Tm
/F1 12 Tf
[<73696d706c65207465> 30 <7874> 0] TJ
ET
Q
`,
        'binary',
      );

      document.text('simple text', 600, 20);
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length 117
>>`,
        `stream`,
        textStream,
        `\nendstream`,
        `endobj`,
      ]);
    });

    test('with line too thin to contain a single character', () => {
      const docData = logData(document);

      const text = 'simple text';
      const textStream = Buffer.from(
        `1 0 0 -1 0 792 cm
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 773.384 Tm
/F1 12 Tf
[<73> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 759.512 Tm
/F1 12 Tf
[<69> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 745.64 Tm
/F1 12 Tf
[<6d> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 731.768 Tm
/F1 12 Tf
[<70> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 717.896 Tm
/F1 12 Tf
[<6c> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 704.024 Tm
/F1 12 Tf
[<65> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 690.152 Tm
/F1 12 Tf
[<2074> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 676.28 Tm
/F1 12 Tf
[<65> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 662.408 Tm
/F1 12 Tf
[<78> 0] TJ
ET
Q
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 10 648.536 Tm
/F1 12 Tf
[<74> 0] TJ
ET
Q
`,
        'binary',
      );

      // before this test, this case used to make the code run into an infinite loop.
      // To handle regression gracefully and avoid sticking this test into an infinite loop,
      // we look out for a side effect of this infinite loop, witch is adding an infinite number of pages.
      // Normally, there should not be any page added to the document.

      document.on('pageAdded', () => {
        const pageRange = document.bufferedPageRange();
        const newPageIndex = pageRange.start + pageRange.count;
        // We try restrict the fail condition to only infinite loop, so we wait for several pages to be added.
        if (newPageIndex > 10) {
          throw new Error('Infinite loop detected');
        }
      });

      document.text(text, 10, 10, { width: 2 });
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length 738
>>`,
        `stream`,
        textStream,
        `\nendstream`,
        `endobj`,
      ]);
    });

    test('bounded text precision - issue #1611', () => {
      const docData = logData(document);
      const text = 'New york';
      const bounds = document.boundsOfString(text);
      // Draw text which is constrained to the bounds
      document.text(text, {
        ellipsis: true,
        width: bounds.width,
        height: bounds.height,
      });

      document.end();

      expect(docData).toContainText({ text });
    });
  });

  describe('text with structure parent links', () => {
    beforeEach(() => {
      document = new PDFDocument({
        info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
        compress: false,
        tagged: true,
      });
    });

    test('should auto-link text inside Link structure element', () => {
      const docData = logData(document);

      const linkElement = document.struct('Link', () => {
        document.text('Click here', 100, 100, {
          link: 'http://example.com',
        });
      });

      document.addStructure(linkElement);
      linkElement.end();
      document.end();

      const dataStr = docData.join('\n');
      expect(dataStr).toContain('/S /Link');
      expect(dataStr).toContain('/StructParent');
    });

    test('should not add StructParent outside Link structure', () => {
      const docData = logData(document);

      document.text('Click here', 100, 100, {
        link: 'http://example.com',
      });

      document.end();

      const dataStr = docData.join('\n');
      expect(dataStr).toContain('/Subtype /Link');
      expect(dataStr).not.toContain('/StructParent');
    });

    test('should not leak link options to subsequent structure elements with continued text', () => {
      const docData = logData(document);

      const paragraph = document.struct('P');
      document.addStructure(paragraph);

      paragraph.add(
        document.struct('Span', () => {
          document.text('This is some text before ', 100, 100, {
            continued: true,
          });
        }),
      );

      paragraph.add(
        document.struct('Link', () => {
          document.text('Here is a link!', {
            link: 'http://google.com/',
            underline: true,
            continued: true,
          });
        }),
      );

      paragraph.add(
        document.struct('Span', () => {
          document.text(' and this is text after the link.');
        }),
      );

      paragraph.end();
      document.end();

      const dataStr = docData.join('\n');

      // Count how many link annotations exist - should be exactly 1
      const linkMatches = dataStr.match(/\/Subtype \/Link/g);
      expect(linkMatches).toBeTruthy();
      expect(linkMatches.length).toBe(1);

      expect(dataStr).toContain('/S /Span');
      expect(dataStr).toContain('/S /Link');
    });
  });
});
