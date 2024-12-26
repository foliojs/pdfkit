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
      const vectorStream = Buffer.from(
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
      const vectorStream = Buffer.from(
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
      const vectorStream = Buffer.from(
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
      const vectorStream = Buffer.from(
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

    describe('validation', () => {
      test('length 1', () => {
        const doc = new PDFDocument();

        expect(() => doc.dash(1)).not.toThrow();
      });

      test('length 1.5', () => {
        const doc = new PDFDocument();

        expect(() => doc.dash(1.5)).not.toThrow();
      });

      test('length 0 throws', () => {
        const doc = new PDFDocument();

        expect(() => doc.dash(0)).toThrow(
          'dash(0, {}) invalid, lengths must be numeric and greater than zero'
        );
      });

      test('length -1 throws', () => {
        const doc = new PDFDocument();

        expect(() => doc.dash(-1)).toThrow(
          'dash(-1, {}) invalid, lengths must be numeric and greater than zero'
        );
      });

      test('length null throws', () => {
        const doc = new PDFDocument();

        expect(() => doc.dash(null)).toThrow(
          'dash(null, {}) invalid, lengths must be numeric and greater than zero'
        );
      });

      test('length array', () => {
        const doc = new PDFDocument();

        expect(() => doc.dash([2, 3])).not.toThrow();
      });

      test('length array containing zeros throws', () => {
        const doc = new PDFDocument();

        expect(() => doc.dash([2, 0, 3])).toThrow(
          'dash([2,0,3], {}) invalid, lengths must be numeric and greater than zero'
        );
      });
    });
  });

  describe('translate', () => {
    test('identity transform is ignored', () => {
      const docData = logData(document);
      const vectorStream = Buffer.from(`1 0 0 -1 0 792 cm\n1 0 0 1 0 0 cm\n`, 'binary');

      document
        .translate(0, 0);
      document.end();

      expect(docData).not.toContainChunk([
        `5 0 obj`,
        `<<
/Length 33
>>`,
        `stream`,
        vectorStream,
        `\nendstream`,
        `endobj`
      ]);
    });
  });
});
