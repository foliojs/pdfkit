import PDFDocument from '../../lib/document';
import { logData } from './helpers';

describe('Vector Graphics', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
      compress: false
    });
  });

  describe('dash', () => {
    test('with numeric length argument', () => {
      const docData = logData(document);
      const vectorStream = new Buffer(
        '1 0 0 -1 0 792 cm\n50 20 m\n[2 2] 0 d\nS\n',
        'binary'
      );

      document
        .moveTo(50, 20)
        .dash(2)
        .stroke();
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length 38
>>`,
        `stream`,
        vectorStream,
        `\nendstream`,
        `endobj`
      ]);
    });

    test('with array length argument', () => {
      const docData = logData(document);
      const vectorStream = new Buffer(
        '1 0 0 -1 0 792 cm\n50 20 m\n[1 2] 0 d\nS\n',
        'binary'
      );

      document
        .moveTo(50, 20)
        .dash([1, 2])
        .stroke();
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length 38
>>`,
        `stream`,
        vectorStream,
        `\nendstream`,
        `endobj`
      ]);
    });

    test('with space option', () => {
      const docData = logData(document);
      const vectorStream = new Buffer(
        '1 0 0 -1 0 792 cm\n50 20 m\n[2 10] 0 d\nS\n',
        'binary'
      );

      document
        .moveTo(50, 20)
        .dash(2, { space: 10 })
        .stroke();
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length 39
>>`,
        `stream`,
        vectorStream,
        `\nendstream`,
        `endobj`
      ]);
    });

    test('with phase option', () => {
      const docData = logData(document);
      const vectorStream = new Buffer(
        '1 0 0 -1 0 792 cm\n50 20 m\n[2 2] 8 d\nS\n',
        'binary'
      );

      document
        .moveTo(50, 20)
        .dash(2, { phase: 8 })
        .stroke();
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length 38
>>`,
        `stream`,
        vectorStream,
        `\nendstream`,
        `endobj`
      ]);
    });
  });
});
