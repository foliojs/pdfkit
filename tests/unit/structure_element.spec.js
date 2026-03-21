import PDFDocument from '../../lib/document';
import { logData } from './helpers';

describe('PDFStructureElement', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
      compress: false,
    });
  });

  describe('layout attributes', () => {
    test('bbox converts PDFKit coordinates to PDF', () => {
      const docData = logData(document);

      document.addStructure(
        document.struct('Figure', {
          alt: 'A triangle.',
          bbox: [100, 150, 200, 250],
        }),
      );

      document.end();

      // PDFKit y-down [left, top, right, bottom] to PDF y-up [left, bottom, right, top]
      // default is Letter which is 792 points tall, so:
      // from [100, 150, 200, 250] to [100, 792-250, 200, 792-150] gives us [100, 542, 200, 642]
      expect(docData).toContainChunk([
        `8 0 obj`,
        `<<
/S /Figure
/Alt (A triangle.)
/A <<
/O /Layout
/Placement /Block
/BBox [100 542 200 642]
>>
/P 9 0 R
/K []
>>`,
        `endobj`,
      ]);
    });

    test('bbox converts PDFKit coordinates to PDF on A4 pages', () => {
      const a4doc = new PDFDocument({
        info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
        compress: false,
        size: 'A4',
      });
      const docData = logData(a4doc);

      a4doc.addStructure(
        a4doc.struct('Figure', {
          bbox: [100, 150, 200, 250],
        }),
      );

      a4doc.end();

      // PDFKit y-down [left, top, right, bottom] to PDF y-up [left, bottom, right, top]
      // A4 is 841.89 points tall, so:
      // from [100, 150, 200, 250] to [100, 841.89-250, 200, 841.89-150] gives us [100, 591.89, 200, 691.89]
      expect(docData).toContainChunk([
        `8 0 obj`,
        `<<
/S /Figure
/A <<
/O /Layout
/Placement /Block
/BBox [100 591.89 200 691.89]
>>
/P 9 0 R
/K []
>>`,
        `endobj`,
      ]);
    });

    test('placement option overrides the Block default', () => {
      const docData = logData(document);

      document.addStructure(
        document.struct('Figure', {
          bbox: [100, 150, 200, 250],
          placement: 'Inline',
        }),
      );

      document.end();

      expect(docData).toContainChunk([
        `8 0 obj`,
        `<<
/S /Figure
/A <<
/O /Layout
/Placement /Inline
/BBox [100 542 200 642]
>>
/P 9 0 R
/K []
>>`,
        `endobj`,
      ]);
    });

    test('placement without bbox creates layout attribute with no BBox', () => {
      const docData = logData(document);

      document.addStructure(
        document.struct('Figure', {
          placement: 'Inline',
        }),
      );

      document.end();

      expect(docData).toContainChunk([
        `8 0 obj`,
        `<<
/S /Figure
/A <<
/O /Layout
/Placement /Inline
>>
/P 9 0 R
/K []
>>`,
        `endobj`,
      ]);
    });

    test('no layout attribute when neither bbox nor placement is specified', () => {
      const docData = logData(document);

      document.addStructure(document.struct('Figure'));

      document.end();

      expect(docData).toContainChunk([
        `8 0 obj`,
        `<<
/S /Figure
/P 9 0 R
/K []
>>`,
        `endobj`,
      ]);
    });
  });
});
