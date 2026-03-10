import PDFDocument from '../../lib/document';
import { logData, getObjects } from './helpers';

describe('Vector Graphics', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
      compress: false,
    });
  });

  describe('dash', () => {
    test('with numeric length argument', () => {
      const docData = logData(document);
      const vectorStream = Buffer.from(
        '1 0 0 -1 0 792 cm\n50 20 m\n[2 2] 0 d\nS\n',
        'binary',
      );

      document.moveTo(50, 20).dash(2).stroke();
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length 38
>>`,
        `stream`,
        vectorStream,
        `\nendstream`,
        `endobj`,
      ]);
    });

    test('with array length argument', () => {
      const docData = logData(document);
      const vectorStream = Buffer.from(
        '1 0 0 -1 0 792 cm\n50 20 m\n[1 2] 0 d\nS\n',
        'binary',
      );

      document.moveTo(50, 20).dash([1, 2]).stroke();
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length 38
>>`,
        `stream`,
        vectorStream,
        `\nendstream`,
        `endobj`,
      ]);
    });

    test('with space option', () => {
      const docData = logData(document);
      const vectorStream = Buffer.from(
        '1 0 0 -1 0 792 cm\n50 20 m\n[2 10] 0 d\nS\n',
        'binary',
      );

      document.moveTo(50, 20).dash(2, { space: 10 }).stroke();
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length 39
>>`,
        `stream`,
        vectorStream,
        `\nendstream`,
        `endobj`,
      ]);
    });

    test('with phase option', () => {
      const docData = logData(document);
      const vectorStream = Buffer.from(
        '1 0 0 -1 0 792 cm\n50 20 m\n[2 2] 8 d\nS\n',
        'binary',
      );

      document.moveTo(50, 20).dash(2, { phase: 8 }).stroke();
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length 38
>>`,
        `stream`,
        vectorStream,
        `\nendstream`,
        `endobj`,
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
          'dash(0, {}) invalid, lengths must be numeric and greater than zero',
        );
      });

      test('length -1 throws', () => {
        const doc = new PDFDocument();

        expect(() => doc.dash(-1)).toThrow(
          'dash(-1, {}) invalid, lengths must be numeric and greater than zero',
        );
      });

      test('length null throws', () => {
        const doc = new PDFDocument();

        expect(() => doc.dash(null)).toThrow(
          'dash(null, {}) invalid, lengths must be numeric and greater than zero',
        );
      });

      test('length array', () => {
        const doc = new PDFDocument();

        expect(() => doc.dash([2, 3])).not.toThrow();
      });

      test('length array containing zeros throws', () => {
        const doc = new PDFDocument();

        expect(() => doc.dash([2, 0, 3])).toThrow(
          'dash([2,0,3], {}) invalid, lengths must be numeric and greater than zero',
        );
      });
    });
  });

  describe('translate', () => {
    test('identity transform is ignored', () => {
      const docData = logData(document);
      const vectorStream = Buffer.from(
        `1 0 0 -1 0 792 cm\n1 0 0 1 0 0 cm\n`,
        'binary',
      );

      document.translate(0, 0);
      document.end();

      expect(docData).not.toContainChunk([
        `5 0 obj`,
        `<<
/Length 33
>>`,
        `stream`,
        vectorStream,
        `\nendstream`,
        `endobj`,
      ]);
    });
  });

  describe('roundedRect', () => {
    test('uses cornerRadius to draw rounded corners by default', () => {
      const docData = logData(document);

      document.roundedRect(50, 50, 100, 80, 20).stroke();
      document.end();

      const objects = getObjects(docData);
      const vectorObject = objects.find((obj) =>
        obj.items.some((item) => item instanceof Buffer),
      );
      const streamBuffer =
        vectorObject && vectorObject.items.find((item) => item instanceof Buffer);
      const streamString = streamBuffer?.toString('ascii') || '';

      // Expect at least one Bezier curve command (`c`) in the vector stream
      expect(streamString).toMatch(/\sc[\s\n]/);
    });

    test('cornerConfig can disable rounded corners', () => {
      const docData = logData(document);

      document.roundedRect(50, 50, 100, 80, 20, '0000').stroke();
      document.end();

      const objects = getObjects(docData);
      const vectorObject = objects.find((obj) =>
        obj.items.some((item) => item instanceof Buffer),
      );
      const streamBuffer =
        vectorObject && vectorObject.items.find((item) => item instanceof Buffer);
      const streamString = streamBuffer?.toString('ascii') || '';

      // No Bezier curve command (`c`) should be present when all corners are disabled
      expect(streamString).not.toMatch(/\sc[\s\n]/);
    });

    test('top-right corner ends at expected point', () => {
      const docData = logData(document);

      const x = 10;
      const y = 20;
      const w = 30;
      const r = 5;

      // Only the top-right corner is rounded
      document.roundedRect(x, y, w, 40, r, '1000').stroke();
      document.end();

      const objects = getObjects(docData);
      const vectorObject = objects.find((obj) =>
        obj.items.some((item) => item instanceof Buffer),
      );
      const streamBuffer =
        vectorObject && vectorObject.items.find((item) => item instanceof Buffer);
      const streamString = streamBuffer?.toString('ascii') || '';

      const expectedX = x + w; // 40
      const expectedY = y + r; // 25

      // Look for a cubic Bezier segment whose end point is (expectedX, expectedY)
      // Numbers are written using PDFObject.number, but these coordinates are integers.
      const endPointPattern = new RegExp(
        `\\b${expectedX}(?:\\.0+)?\\s+${expectedY}(?:\\.0+)?\\s+c\\b`,
      );

      expect(streamString).toMatch(endPointPattern);
    });
  });
});
