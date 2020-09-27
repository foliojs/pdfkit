import PDFDocument from '../../lib/document';
import { logData } from './helpers';

describe('Markings', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
      compress: false
    });
  });

  describe('marked content', () => {
    test('with no dictionary', () => {
      const docData = logData(document);

      const stream = Buffer.from(
        `1 0 0 -1 0 792 cm
/Span BMC
EMC
`,
        'binary'
      );

      document.markContent("Span");
      document.endMarkedContent();
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length ${stream.length}
>>`,
        `stream`,
        stream,
        `\nendstream`,
        `endobj`
      ]);
    });

    test('with empty dictionary', () => {
      const docData = logData(document);

      const stream = Buffer.from(
        `1 0 0 -1 0 792 cm
/Span <<
>> BDC
EMC
`,
        'binary'
      );

      document.markContent("Span", {});
      document.endMarkedContent();
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length ${stream.length}
>>`,
        `stream`,
        stream,
        `\nendstream`,
        `endobj`
      ]);
    });

    test('automatically closed', () => {
      const docData = logData(document);

      const stream = Buffer.from(
        `1 0 0 -1 0 792 cm
/Span BMC
EMC
`,
        'binary'
      );

      document.markContent("Span");
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length ${stream.length}
>>`,
        `stream`,
        stream,
        `\nendstream`,
        `endobj`
      ]);
    });

    test('continued on a new page', () => {
      const docData = logData(document);

      const stream = Buffer.from(
        `1 0 0 -1 0 792 cm
/Span BMC
EMC
`,
        'binary'
      );

      document.markContent("Span");
      document.text("on the first page");
      document.continueOnNewPage();
      document.end();

      expect(docData).toContainChunk([
        `9 0 obj`,
        `<<
/Length ${stream.length}
>>`,
        `stream`,
        stream,
        `\nendstream`,
        `endobj`
      ]);
    });

  });
});
