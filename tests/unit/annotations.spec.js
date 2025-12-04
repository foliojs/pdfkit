import PDFDocument from '../../lib/document';
import PDFSecurity from '../../lib/security';
import { logData } from './helpers';

// manual mock for PDFSecurity to ensure stored id will be the same accross different systems
PDFSecurity.generateFileID = () => {
  return Buffer.from('mocked-pdf-id');
};

describe('Annotations', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
    });
  });

  describe('link', () => {
    test('using page index', () => {
      document.addPage();

      const docData = logData(document);

      document.text('Go To First Page', { link: 0 });

      expect(docData).toContainChunk([
        `11 0 obj`,
        `<<
/S /GoTo
/D [7 0 R /XYZ null null null]
>>`,
      ]);
    });

    test('using url', () => {
      document.addPage();

      const docData = logData(document);

      document.text('Go to url', { link: 'http://www.example.com' });

      expect(docData).toContainChunk([
        `11 0 obj`,
        `<<
/S /URI
/URI (http://www.example.com)
>>`,
      ]);
    });

    test('using url on continue', () => {
      document.addPage();

      const docData = logData(document);

      document.text('Go to url', {
        link: 'http://www.example.com',
        continued: true,
      });
      document.text('continued link');

      expect(docData).toContainChunk([
        `11 0 obj`,
        `<<
/S /URI
/URI (http://www.example.com)
>>`,
      ]);

      expect(docData).toContainChunk([
        `14 0 obj`,
        `<<
/S /URI
/URI (http://www.example.com)
>>`,
      ]);
    });

    test('using url on continue', () => {
      document.addPage();

      const docData = logData(document);

      document.text('Go to url', {
        link: 'http://www.example.com',
        continued: true,
      });
      document.text('no continued link', { link: null });

      // console.log(docData);
      expect(docData).toContainChunk([
        `11 0 obj`,
        `<<
/S /URI
/URI (http://www.example.com)
>>`,
      ]);

      expect(docData).not.toContainChunk([`14 0 obj`]);
    });
  });

  describe('fileAnnotation', () => {
    test('creating a fileAnnotation', () => {
      const docData = logData(document);

      document.fileAnnotation(100, 100, 20, 20, {
        src: Buffer.from('example text'),
        name: 'file.txt',
      });

      expect(docData).toContainChunk([
        `10 0 obj`,
        `<<
/Subtype /FileAttachment
/FS 9 0 R
/Type /Annot
/Rect [100 672 120 692]
/Border [0 0 0]
/C [0 0 0]
>>`,
      ]);
    });

    test("using the file's description", () => {
      const docData = logData(document);

      document.fileAnnotation(100, 100, 20, 20, {
        src: Buffer.from('example text'),
        name: 'file.txt',
        description: 'file description',
      });

      expect(docData).toContainChunk([
        `10 0 obj`,
        `<<
/Subtype /FileAttachment
/FS 9 0 R
/Contents (file description)
/Type /Annot
/Rect [100 672 120 692]
/Border [0 0 0]
/C [0 0 0]
>>`,
      ]);
    });

    test("overriding the file's description", () => {
      const docData = logData(document);

      document.fileAnnotation(
        100,
        100,
        20,
        20,
        {
          src: Buffer.from('example text'),
          name: 'file.txt',
          description: 'file description',
        },
        {
          Contents: 'other description',
        },
      );

      expect(docData).toContainChunk([
        `10 0 obj`,
        `<<
/Contents (other description)
/Subtype /FileAttachment
/FS 9 0 R
/Type /Annot
/Rect [100 672 120 692]
/Border [0 0 0]
/C [0 0 0]
>>`,
      ]);
    });
  });

  describe('annotations with structure parent', () => {
    test('should add structParent to link annotations', () => {
      document = new PDFDocument({
        info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
        compress: false,
        tagged: true,
      });

      const docData = logData(document);

      const linkElement = document.struct('Link');
      document.addStructure(linkElement);

      document.link(100, 100, 100, 20, 'http://example.com', {
        structParent: linkElement,
      });

      linkElement.end();
      document.end();

      const dataStr = docData.join('\n');
      expect(dataStr).toContain('/StructParent 0');
      expect(dataStr).toContain('/Contents ()');
    });

    test('should work without structParent (backwards compatibility)', () => {
      const docData = logData(document);

      document.link(100, 100, 100, 20, 'http://example.com');
      document.end();

      const dataStr = docData.join('\n');
      expect(dataStr).toContain('/Subtype /Link');
      expect(dataStr).not.toContain('/StructParent');
    });
  });
});
