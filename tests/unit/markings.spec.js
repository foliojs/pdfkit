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
    test('non-structural', () => {
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

    test('structural', () => {
      const docData = logData(document);

      const stream = Buffer.from(
        `1 0 0 -1 0 792 cm
/Span <<
/MCID 0
>> BDC
EMC
/Span <<
/MCID 1
>> BDC
EMC
`,
        'binary'
      );

      const structureContent1 = document.markStructureContent("Span");
      document.endMarkedContent();
      const structureContent2 = document.markStructureContent("Span");
      document.endMarkedContent();
      document.end();

      expect(structureContent1.refs.length).toEqual(1);
      expect(structureContent1.refs[0].pageRef.toString()).toEqual('7 0 R');
      expect(structureContent1.refs[0].mcid).toEqual(0);
      expect(structureContent2.refs.length).toEqual(1);
      expect(structureContent2.refs[0].pageRef.toString()).toEqual('7 0 R');
      expect(structureContent2.refs[0].mcid).toEqual(1);
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

    test('with options', () => {
      const docData = logData(document);

      const stream = Buffer.from(
        `1 0 0 -1 0 792 cm
/Artifact <<
/Type /Pagination
/BBox [40 722 570 742]
/Attached [/Top]
>> BDC
EMC
`,
        'binary'
      );

      document.markContent("Artifact", {
        type: "Pagination",
        bbox: [40, 50, 570, 70],
        attached: [ "Top" ]
      });
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
/P <<
/MCID 0
>> BDC
/Span BMC
EMC
EMC
/P <<
/MCID 1
>> BDC
EMC
/Artifact BMC
EMC
/Artifact BMC
EMC
/P <<
/MCID 2
>> BDC
EMC
/P <<
/MCID 3
>> BDC
EMC
EMC
`,
        'binary'
      );

      document.markContent("Span");
      document.markStructureContent("P");
      document.markContent("Span");
      document.markStructureContent("P");
      document.markContent("Artifact");
      document.markContent("Artifact");
      document.markStructureContent("P");
      document.markStructureContent("P");
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
/P <<
/MCID 0
>> BDC
/Span BMC
EMC
EMC
`,
        'binary'
      );

      const structureContent = document.markStructureContent("P");
      document.markContent("Span");
      document.text("on the first page");
      document.continueOnNewPage();
      document.end();

      expect(structureContent.refs.length).toEqual(2);
      expect(structureContent.refs[0].pageRef.toString()).toEqual('7 0 R');
      expect(structureContent.refs[0].mcid).toEqual(0);
      expect(structureContent.refs[1].pageRef.toString()).toEqual('13 0 R');
      expect(structureContent.refs[1].mcid).toEqual(0);
      expect(docData).toContainChunk([
        `11 0 obj`,
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

  describe('structure tree', () => {
    test('atomically constructed', () => {
      const docData = logData(document);

      const pContent1 = document.markStructureContent("P");
      const linkContent = document.markStructureContent("Link");
      const pContent2 = document.markStructureContent("P");
      const pContent3 = document.markStructureContent("P");
      document.markContent("Span");

      const section1 = document.struct('Section', [
        document.struct('P', [
          pContent1,
          document.struct('Link', [ linkContent ]),
          pContent2
        ])
      ]);
      const section2 = document.struct('Section', [
        document.struct('P', [
          pContent3,
        ])
      ]);
      document.addStructure(section1).addStructure(section2);

      document.end();

      expect(docData).toContainChunk([
        `3 0 obj`,
        /\/StructTreeRoot 8 0 R/,
        `endobj`
      ]);
      expect(docData).toContainChunk([
        `3 0 obj`,
        /\/Markings 9 0 R/,
        `endobj`
      ]);
      expect(docData).toContainChunk([
        `8 0 obj`,
        `<<
/Type /StructTreeRoot
/ParentTree <<
  /Nums [
    0 [11 0 R 10 0 R 11 0 R 13 0 R]
]
>>
/ParentTreeNextKey 1
/K [12 0 R 14 0 R]
>>`,
        `endobj`
      ]);
      expect(docData).toContainChunk([
        `12 0 obj`,
        `<<
/S /Section
/K [11 0 R]
/P 8 0 R
>>`,
        `endobj`
      ]);
      expect(docData).toContainChunk([
        `11 0 obj`,
        `<<
/S /P
/K [0 10 0 R 2]
/Pg 7 0 R
/P 12 0 R
>>`,
        `endobj`
      ]);
      expect(docData).toContainChunk([
        `10 0 obj`,
        `<<
/S /Link
/K [1]
/Pg 7 0 R
/P 11 0 R
>>`,
        `endobj`
      ]);
      expect(docData).toContainChunk([
        `14 0 obj`,
        `<<
/S /Section
/K [13 0 R]
/P 8 0 R
>>`,
        `endobj`
      ]);
      expect(docData).toContainChunk([
        `13 0 obj`,
        `<<
/S /P
/K [3]
/Pg 7 0 R
/P 14 0 R
>>`,
        `endobj`
      ]);
      expect(docData).toContainChunk([
        `9 0 obj`,
        `<<
>>`,
        `endobj`
      ]);
    });

    test('incrementally constructed', () => {
      const docData = logData(document);

      const pContent1 = document.markStructureContent("P");
      const linkContent = document.markStructureContent("Link");
      const pContent2 = document.markStructureContent("P");
      const pContent3 = document.markStructureContent("P");
      document.markContent("Span");

      const section1 = document.struct('Section');
      document.addStructure(section1);
      const section2 = document.struct('Section');
      document.addStructure(section2);
      const link = document.struct('Link');
      link.add(linkContent);
      const p1 = document.struct('P');
      section1.add(p1);
      p1.add(pContent1).add(link).add(pContent2).end();
      const p2 = document.struct('P');
      p2.add(pContent3);
      section2.add(p2);

      document.end();

      expect(docData).toContainChunk([
        `3 0 obj`,
        /\/StructTreeRoot 8 0 R/,
        `endobj`
      ]);
      expect(docData).toContainChunk([
        `3 0 obj`,
        /\/Markings 9 0 R/,
        `endobj`
      ]);
      expect(docData).toContainChunk([
        `8 0 obj`,
        `<<
/Type /StructTreeRoot
/ParentTree <<
  /Nums [
    0 [13 0 R 12 0 R 13 0 R 14 0 R]
]
>>
/ParentTreeNextKey 1
/K [10 0 R 11 0 R]
>>`,
        `endobj`
      ]);
      expect(docData).toContainChunk([
        `10 0 obj`,
        `<<
/S /Section
/P 8 0 R
/K [13 0 R]
>>`,
        `endobj`
      ]);
      expect(docData).toContainChunk([
        `13 0 obj`,
        `<<
/S /P
/P 10 0 R
/K [0 12 0 R 2]
/Pg 7 0 R
>>`,
        `endobj`
      ]);
      expect(docData).toContainChunk([
        `12 0 obj`,
        `<<
/S /Link
/K [1]
/Pg 7 0 R
/P 13 0 R
>>`,
        `endobj`
      ]);
      expect(docData).toContainChunk([
        `11 0 obj`,
        `<<
/S /Section
/P 8 0 R
/K [14 0 R]
>>`,
        `endobj`
      ]);
      expect(docData).toContainChunk([
        `14 0 obj`,
        `<<
/S /P
/K [3]
/Pg 7 0 R
/P 11 0 R
>>`,
        `endobj`
      ]);
      expect(docData).toContainChunk([
        `9 0 obj`,
        `<<
>>`,
        `endobj`
      ]);
    });

    test('with options', () => {
      const docData = logData(document);

      document.addStructure(document.struct('P', {
        title: "My Title",
        lang: "en-AU",
        alt: "My Alternative",
        expanded: "My Expansion",
        actual: "My Actual Text"
      }));

      document.end();

      expect(docData).toContainChunk([
        `8 0 obj`,
        `<<
/S /P
/T (My Title)
/Lang (en-AU)
/Alt (My Alternative)
/E (My Expansion)
/ActualText (My Actual Text)
/P 9 0 R
>>`,
        `endobj`
      ]);
    });

    test('identified as tagged', () => {
      document = new PDFDocument({
        info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
        compress: false,
        pdfVersion: '1.5',
        tagged: true
      });

      const docData = logData(document);

      document.end();

      expect(docData).toContainChunk([
        `3 0 obj`,
        /\/Markings 5 0 R/,
        `endobj`
      ]);
      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Marked true
>>`,
        `endobj`
      ]);
    });
  });
});
