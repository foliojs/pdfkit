import PDFDocument from '../../lib/document';
import { logData } from './helpers';

describe('Markings', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
      compress: false,
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
        'binary',
      );

      document.markContent('Span');
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
        `endobj`,
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
        'binary',
      );

      const structureContent1 = document.markStructureContent('Span');
      document.endMarkedContent();
      const structureContent2 = document.markStructureContent('Span');
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
        `endobj`,
      ]);
    });

    test('marked using closure', () => {
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
        'binary',
      );

      document.addStructure(document.struct('Span', () => {}));
      document.addStructure(document.struct('Span', () => {}));
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length ${stream.length}
>>`,
        `stream`,
        stream,
        `\nendstream`,
        `endobj`,
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
/Span <<
/Lang (en-AU)
/Alt (Hi, earth! )
/E (Greetings, terrestrial sphere! )
/ActualText (Hello, world! )
>> BDC
EMC
`,
        'binary',
      );

      document.markContent('Artifact', {
        type: 'Pagination',
        bbox: [40, 50, 570, 70],
        attached: ['Top'],
      });
      document.endMarkedContent();
      document.markContent('Span', {
        lang: 'en-AU',
        alt: 'Hi, earth! ',
        actual: 'Hello, world! ',
        expanded: 'Greetings, terrestrial sphere! ',
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
        `endobj`,
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
        'binary',
      );

      document.markContent('Span');
      document.markStructureContent('P');
      document.markContent('Span');
      document.markStructureContent('P');
      document.markContent('Artifact');
      document.markContent('Artifact');
      document.markStructureContent('P');
      document.markStructureContent('P');
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length ${stream.length}
>>`,
        `stream`,
        stream,
        `\nendstream`,
        `endobj`,
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
        'binary',
      );

      const structureContent = document.markStructureContent('P');
      document.markContent('Span');
      document.text('on the first page');
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
        `endobj`,
      ]);
    });
  });

  describe('structure tree', () => {
    test('atomically constructed', () => {
      const docData = logData(document);

      const pContent1 = document.markStructureContent('P');
      const linkContent = document.markStructureContent('Link');
      const pContent2 = document.markStructureContent('P');
      const pContent3 = document.markStructureContent('P');
      document.markContent('Span');

      const section1 = document.struct('Sect', [
        document.struct('P', [
          pContent1,
          document.struct('Link', linkContent),
          pContent2,
        ]),
      ]);
      const section2 = document.struct('Sect', [
        document.struct('P', [pContent3]),
      ]);
      document.addStructure(section1).addStructure(section2);

      document.end();

      expect(docData).toContainChunk([
        `3 0 obj`,
        /\/StructTreeRoot 8 0 R/,
        `endobj`,
      ]);
      expect(docData).toContainChunk([`3 0 obj`, /\/MarkInfo 9 0 R/, `endobj`]);
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
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        `12 0 obj`,
        `<<\n/S /Sect\n/P 8 0 R\n/K [11 0 R]\n>>`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        `11 0 obj`,
        `<<\n/S /P\n/P 12 0 R\n/K [0 10 0 R 2]\n/Pg 7 0 R\n>>`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        `10 0 obj`,
        `<<\n/S /Link\n/P 11 0 R\n/K [1]\n/Pg 7 0 R\n>>`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        `14 0 obj`,
        `<<\n/S /Sect\n/P 8 0 R\n/K [13 0 R]\n>>`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        `13 0 obj`,
        `<<\n/S /P\n/P 14 0 R\n/K [3]\n/Pg 7 0 R\n>>`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([`9 0 obj`, `<<\n>>`, `endobj`]);
    });

    test('incrementally constructed', () => {
      const docData = logData(document);

      const pContent1 = document.markStructureContent('P');
      const linkContent = document.markStructureContent('Link');
      const pContent2 = document.markStructureContent('P');
      const pContent3 = document.markStructureContent('P');
      document.markContent('Span');

      const section1 = document.struct('Sect');
      document.addStructure(section1);
      const section2 = document.struct('Sect');
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
        `endobj`,
      ]);
      expect(docData).toContainChunk([`3 0 obj`, /\/MarkInfo 9 0 R/, `endobj`]);
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
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        `10 0 obj`,
        `<<\n/S /Sect\n/P 8 0 R\n/K [13 0 R]\n>>`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        `13 0 obj`,
        `<<\n/S /P\n/P 10 0 R\n/K [0 12 0 R 2]\n/Pg 7 0 R\n>>`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        `12 0 obj`,
        `<<\n/S /Link\n/P 13 0 R\n/K [1]\n/Pg 7 0 R\n>>`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        `11 0 obj`,
        `<<\n/S /Sect\n/P 8 0 R\n/K [14 0 R]\n>>`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        `14 0 obj`,
        `<<\n/S /P\n/P 11 0 R\n/K [3]\n/Pg 7 0 R\n>>`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([`9 0 obj`, `<<\n>>`, `endobj`]);
    });

    test('constructed with closures', () => {
      const docData = logData(document);

      const section1 = document.struct('Sect');
      document.addStructure(section1);
      const section2 = document.struct('Sect');
      const link = document.struct('Link', () => {});
      const p1 = document.struct('P');
      section1.add(p1);
      p1.add(() => {})
        .add(link)
        .add(() => {})
        .end();
      const p2 = document.struct('P', [() => {}]);
      section2.add(p2);
      document.addStructure(section2);

      document.end();

      expect(docData).toContainChunk([
        `3 0 obj`,
        /\/StructTreeRoot 9 0 R/,
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        `3 0 obj`,
        /\/MarkInfo 13 0 R/,
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        `9 0 obj`,
        `<<
/Type /StructTreeRoot
/ParentTree <<
  /Nums [
    0 [12 0 R 11 0 R 12 0 R 14 0 R]
]
>>
/ParentTreeNextKey 1
/K [8 0 R 10 0 R]
>>`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        `8 0 obj`,
        `<<\n/S /Sect\n/P 9 0 R\n/K [12 0 R]\n>>`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        `12 0 obj`,
        `<<\n/S /P\n/P 8 0 R\n/K [0 11 0 R 2]\n/Pg 7 0 R\n>>`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        `11 0 obj`,
        `<<\n/S /Link\n/P 12 0 R\n/K [1]\n/Pg 7 0 R\n>>`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        `10 0 obj`,
        `<<\n/S /Sect\n/P 9 0 R\n/K [14 0 R]\n>>`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        `14 0 obj`,
        `<<\n/S /P\n/P 10 0 R\n/K [3]\n/Pg 7 0 R\n>>`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([`13 0 obj`, `<<\n>>`, `endobj`]);
    });

    test('with options', () => {
      const docData = logData(document);

      document.addStructure(
        document.struct('P', {
          title: 'My Title',
          lang: 'en-AU',
          alt: 'My Alternative',
          expanded: 'My Expansion',
          actual: 'My Actual Text',
        }),
      );

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
/K []
>>`,
        `endobj`,
      ]);
    });

    test('validation', () => {
      let struct;

      struct = document.struct('Foo').end();
      expect(() => {
        struct.add(document.struct('Bar'));
      }).toThrow();

      struct = document.struct('Foo', []);
      expect(() => {
        struct.add(document.struct('Bar'));
      }).toThrow();

      struct = document.struct('Foo');
      let parent = document.struct('Bar').add(struct);
      expect(() => {
        parent.add(struct);
      }).toThrow();

      expect(() => {
        document.struct('Foo', [1]);
      }).toThrow();
    });

    test('_currentStructureElement tracking with closures', () => {
      const section = document.struct('Sect');
      document.addStructure(section);

      let capturedStructElement = null;

      const paragraph = document.struct('P', () => {
        capturedStructElement = document._currentStructureElement;
      });

      section.add(paragraph);
      section.end();
      document.end();

      expect(capturedStructElement).toBe(paragraph);
    });
  });

  describe('accessible document', () => {
    test('identified as accessible', () => {
      document = new PDFDocument({
        info: {
          CreationDate: new Date(Date.UTC(2018, 1, 1)),
          Title: 'My Title',
        },
        displayTitle: true,
        compress: false,
        pdfVersion: '1.5',
        tagged: true,
        lang: 'en-AU',
      });

      const docData = logData(document);

      document.end();

      expect(docData).toContainChunk([`3 0 obj`, /\/Lang \(en-AU\)/, `endobj`]);
      expect(docData).toContainChunk([`3 0 obj`, /\/MarkInfo 5 0 R/, `endobj`]);
      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<\n/Marked true\n>>`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        `3 0 obj`,
        /\/ViewerPreferences 7 0 R/,
        `endobj`,
      ]);

      expect(docData).toContainChunk([
        `3 0 obj`,
        /\/StructTreeRoot 6 0 R/,
        `endobj`,
      ]);

      expect(docData).toContainChunk([
        `6 0 obj`,
        `<<
/Type /StructTreeRoot
/ParentTree <<
  /Nums [
]
>>
/ParentTreeNextKey 0
>>`,
        `endobj`,
      ]);

      expect(docData).toContainChunk([
        `7 0 obj`,
        /\/DisplayDocTitle true/,
        `endobj`,
      ]);
      expect(docData).toContainChunk([`trailer`, /\/Info 11 0 R/, `startxref`]);
      expect(docData).toContainChunk([`11 0 obj`, /\/Title 15 0 R/, `endobj`]);
      expect(docData).toContainChunk([`15 0 obj`, `(My Title)`, `endobj`]);
      expect(docData).toContainChunk([`10 0 obj`, /\/Tabs \/S/, `endobj`]);
    });
  });

  describe('untagged document', () => {
    test('taborder not set for unmarked content', () => {
      document = new PDFDocument({
        info: {
          CreationDate: new Date(Date.UTC(2018, 1, 1)),
          Title: 'My Title',
        },
        displayTitle: true,
        compress: false,
        pdfVersion: '1.5',
        tagged: false,
        lang: 'en-AU',
      });

      const docData = logData(document);

      document.end();

      expect(docData).toContainChunk([`3 0 obj`, /\/Lang \(en-AU\)/, `endobj`]);
      expect(docData).not.toContainChunk([
        `3 0 obj`,
        /\/MarkInfo 5 0 R/,
        `endobj`,
      ]);
      expect(docData).not.toContainChunk([`10 0 obj`, /\/Tabs \/S/, `endobj`]);
    });
  });

  describe('text integration', () => {
    test('adds paragraphs to structure', () => {
      const docData = logData(document);

      const stream = Buffer.from(
        `1 0 0 -1 0 792 cm
/P <<
/MCID 0
>> BDC
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 72 711.384 Tm
/F1 12 Tf
[<50> 40 <6172> 10 <6167> 10 <72> 10 <6170682031> 0] TJ
ET
Q
EMC
/P <<
/MCID 1
>> BDC
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 72 697.512 Tm
/F1 12 Tf
[<50> 40 <6172> 10 <6167> 10 <72> 10 <6170682032> 0] TJ
ET
Q
EMC
`,
        'binary',
      );

      const section = document.struct('Sect');
      document.addStructure(section);
      document.text('Paragraph 1\nParagraph 2', { structParent: section });
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length ${stream.length}
>>`,
        `stream`,
        stream,
        `\nendstream`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        '11 0 obj',
        '<<\n/S /P\n/P 8 0 R\n/K [0]\n/Pg 7 0 R\n>>',
        'endobj',
      ]);
      expect(docData).toContainChunk([
        '13 0 obj',
        '<<\n/S /P\n/P 8 0 R\n/K [1]\n/Pg 7 0 R\n>>',
        'endobj',
      ]);
      expect(docData).toContainChunk([
        '8 0 obj',
        '<<\n/S /Sect\n/P 9 0 R\n/K [11 0 R 13 0 R]\n>>',
        'endobj',
      ]);
    });

    test('adds list items to structure', () => {
      const docData = logData(document);

      const stream = Buffer.from(
        `1 0 0 -1 0 792 cm
/Lbl <<
/MCID 0
>> BDC
72 76.5 m
72 74.843146 73.343146 73.5 75 73.5 c
76.656854 73.5 78 74.843146 78 76.5 c
78 78.156854 76.656854 79.5 75 79.5 c
73.343146 79.5 72 78.156854 72 76.5 c
h
f
EMC
/LBody <<
/MCID 1
>> BDC
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 87 711.384 Tm
/F1 12 Tf
[<4974656d2031> 0] TJ
ET
Q
EMC
/Lbl <<
/MCID 2
>> BDC
72 90.372 m
72 88.715146 73.343146 87.372 75 87.372 c
76.656854 87.372 78 88.715146 78 90.372 c
78 92.028854 76.656854 93.372 75 93.372 c
73.343146 93.372 72 92.028854 72 90.372 c
h
f
EMC
/LBody <<
/MCID 3
>> BDC
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 87 697.512 Tm
/F1 12 Tf
[<4974656d2032> 0] TJ
ET
Q
EMC
`,
        'binary',
      );

      const list = document.struct('List');
      document.addStructure(list);
      document.list(['Item 1', 'Item 2'], { structParent: list });
      document.end();

      expect(docData).toContainChunk([
        `5 0 obj`,
        `<<
/Length ${stream.length}
>>`,
        `stream`,
        stream,
        `\nendstream`,
        `endobj`,
      ]);
      expect(docData).toContainChunk([
        '12 0 obj',
        '<<\n/S /Lbl\n/P 10 0 R\n/K [0]\n/Pg 7 0 R\n>>',
        'endobj',
      ]);
      expect(docData).toContainChunk([
        '13 0 obj',
        '<<\n/S /LBody\n/P 10 0 R\n/K [1]\n/Pg 7 0 R\n>>',
        'endobj',
      ]);
      expect(docData).toContainChunk([
        '16 0 obj',
        '<<\n/S /Lbl\n/P 15 0 R\n/K [2]\n/Pg 7 0 R\n>>',
        'endobj',
      ]);
      expect(docData).toContainChunk([
        '17 0 obj',
        '<<\n/S /LBody\n/P 15 0 R\n/K [3]\n/Pg 7 0 R\n>>',
        'endobj',
      ]);
      expect(docData).toContainChunk([
        '10 0 obj',
        '<<\n/S /LI\n/P 8 0 R\n/K [12 0 R 13 0 R]\n>>',
        'endobj',
      ]);
      expect(docData).toContainChunk([
        '15 0 obj',
        '<<\n/S /LI\n/P 8 0 R\n/K [16 0 R 17 0 R]\n>>',
        'endobj',
      ]);
      expect(docData).toContainChunk([
        '8 0 obj',
        '<<\n/S /List\n/P 9 0 R\n/K [10 0 R 15 0 R]\n>>',
        'endobj',
      ]);
    });
  });
});
