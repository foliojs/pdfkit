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

  describe('undefined option values', () => {
    // `doc.annotate()` passes arbitrary dictionary keys straight through by
    // design, so unlike the acroform options there is no call site at which an
    // absent value could be normalised first.
    test('drops the key but keeps every other entry', () => {
      const docData = logData(document);

      document.annotate(10, 30, 30, 30, { Subtype: 'Text', CA: undefined });

      const dataStr = docData.join('\n');
      // the defect
      expect(dataStr).not.toContain('/CA');
      expect(dataStr).not.toContain('undefined');
      // ...and the rest of the dictionary must survive, which a guard that
      // dropped every key would also satisfy the negative assertions above
      expect(dataStr).toContain('/Subtype /Text');
      expect(dataStr).toContain('/Type /Annot');
      expect(dataStr).toContain('/Rect [10 732 40 762]');
      expect(dataStr).toContain('/Border [0 0 0]');
    });

    test('keeps array positions when an entry is absent', () => {
      // A destination array is [page /XYZ left top zoom], and ISO 32000-1
      // Table 151 explicitly allows null for left, top and zoom - it means
      // "retain the current value". So this is a place where the stand-in is
      // legal, and the point of the test is positional: skipping the hole
      // instead would slide `3` from the zoom slot into the top slot.
      const docData = logData(document);

      document.annotate(10, 30, 30, 30, {
        Subtype: 'Link',
        // eslint-disable-next-line no-sparse-arrays
        Dest: [document.page.dictionary, 'XYZ', 1, , 3],
      });

      const dataStr = docData.join('\n');
      // asserted on the tail so the page object number stays incidental
      expect(dataStr).toContain('/XYZ 1 null 3]');
      expect(dataStr).not.toContain('/XYZ 1  3]');
    });
  });

  describe('note', () => {
    test.each([
      ['null', null],
      ['undefined', undefined],
    ])('uses the default icon when Name is %s', (_label, Name) => {
      const docData = logData(document);

      document.note(10, 30, 30, 30, 'Text of note', { Name });

      const dataStr = docData.join('\n');
      expect(dataStr).toContain('/Subtype /Text');
      expect(dataStr).toContain('/Name /Comment');
      expect(dataStr).not.toContain(`/Name ${Name}`);
    });

    test('does not mutate caller options', () => {
      const options = {};

      document.note(10, 30, 30, 30, 'Text of note', options);

      expect(options).toEqual({});
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
