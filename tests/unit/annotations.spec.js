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
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) }
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
>>`
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
>>`
      ]);
    });

    test('using url on continue', () => {
      document.addPage();

      const docData = logData(document);

      document.text('Go to url', {
        link: 'http://www.example.com',
        continued: true
      });
      document.text('continued link');

      expect(docData).toContainChunk([
        `11 0 obj`,
        `<<
/S /URI
/URI (http://www.example.com)
>>`
      ]);

      expect(docData).toContainChunk([
        `14 0 obj`,
        `<<
/S /URI
/URI (http://www.example.com)
>>`
      ]);
    });

    test('using url on continue', () => {
      document.addPage();

      const docData = logData(document);

      document.text('Go to url', {
        link: 'http://www.example.com',
        continued: true
      });
      document.text('no continued link', { link: null });

      // console.log(docData);
      expect(docData).toContainChunk([
        `11 0 obj`,
        `<<
/S /URI
/URI (http://www.example.com)
>>`
      ]);

      expect(docData).not.toContainChunk([`14 0 obj`]);
    });
  });
});
