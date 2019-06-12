import PDFDocument from '../../lib/document';
import { logData } from './helpers';

describe('Text', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
      compress: false
    });
  });

  describe('text', () => {
    test('with simple content', () => {
      const docData = logData(document);

      const textStream = new Buffer(
        `1 0 0 -1 0 792 cm
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 72 711.384 Tm
/F1 12 Tf
[<73696d706c65207465> 30 <7874> 0] TJ
ET
Q
`,
        'binary'
      );

      document.text('simple text');
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length 116
>>`,
        `stream`,
        textStream,
        `\nendstream`,
        `endobj`
      ]);
    });

    test('with content ending after page right margin', () => {
      const docData = logData(document);

      const textStream = new Buffer(
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
        'binary'
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
        `endobj`
      ]);
    });
  });
});
