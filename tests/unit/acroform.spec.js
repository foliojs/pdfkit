import PDFDocument from '../../lib/document';
import PDFSecurity from '../../lib/security';
import { logData } from './helpers';
import PDFFontFactory from '../../lib/font_factory';
import fs from 'fs'

const ESC = [
  [/\//g, '\\\/'],
  [/\(/g, '\\\('],
  [/\)/g, '\\\)']
];

// manual mock for PDFSecurity to ensure stored id will be the same accross different systems
PDFSecurity.generateFileID = () => {
  return new Buffer('mocked-pdf-id');
};

function joinTokens (arr) {
  if (Array.isArray(arr)) {
    let a = arr.map(i => {
      return i.replace(ESC[0][0], ESC[0][1]).replace(ESC[1][0], ESC[1][1]).replace(ESC[2][0], ESC[2][1]);
    })
    let b = [].concat(['^'], a, ['$']);
    return new RegExp(b.join('\\s*'));
  }
  return arr;
}

describe('AcroForm', () => {
  let doc;

  beforeEach(() => {
    doc = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) }
    });
  });

  test('named JavaScript', () => {
    const expected = [
      '2 0 obj',
      /.*/,
      // '<<\n/Dests <<\n/Names []\n>>\n/JavaScript <<\n/Names [\n(name1) <<\n/JS (my javascript goes here)\n/S /JavaScript\n>>\n]\n>>\n>>',
      // joinTokens(['<<', '/Dests', '<<', '/Names', '[', ']', '>>', '/JavaScript', '<<', '/Names', '[', '(name1)', '<<', '/JS', '(my javascript goes here)', '/S', '/JavaScript', '>>', ']', '>>', '>>']),
      'endobj'
    ];
    const docData = logData(doc);
    doc.addNamedJavaScript('name1', 'my javascript goes here');
    expect(docData.length).toBe(0);
    doc.end();
    expect(docData).toContainChunk(expected);
  })

  describe('init', () => {
    test('no fonts', () => {
      doc.addPage();
      const docData = logData(doc);
      const font = PDFFontFactory.open(
        doc,
        'tests/fonts/Roboto-Regular.ttf'
      );
      doc.initAcroForm();
      expect(docData.length).toBe(0);
    });

    test('push button', () => {

      const expected = [
        '10 0 obj',
        '<<\n/FT /Btn\n/Ff 65536\n/DR <<\n/Font <<\n/F1 8 0 R\n>>\n>>\n/MK <<\n/CA (Test Button)\n/BG [1 1 0]\n>>\n/T (btn1)\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [20 742 120 772]\n>>',
        'endobj'
      ];

      doc.initAcroForm();
      const docData = logData(doc);
      let opts = {
        backgroundColor: 'yellow',
        label: 'Test Button',
      };
      doc.formPushButton('btn1', 20, 20, 100, 30, opts);
      expect(docData.length).toBe(3);
      expect(docData[0]).toBe(expected[0]);
      expect(docData[1]).toBe(expected[1]);
      expect(docData[2]).toBe(expected[2]);
    });

    test('standard fonts', () => {
      const expected = [
        '12 0 obj',
        /.*/,
        // ['<<', '/FT', '/Tx', '/Ff', '4096', '/DR', '<<', '/Font', '<<', '/F3', '10 0 R', '>>', '>>', '/T', '(file0)', '/Subtype', '/Widget', '/F4', '/Type', '/Annot', '/Rect', '[10 292 602 692]', '>>'],
        'endobj'
      ];

      const docData = logData(doc);

      doc.registerFont('myfont1', 'tests/fonts/Roboto-Regular.ttf')

      doc.font('Courier-Bold')    // establishes the default font
      doc.initAcroForm()

      doc.font('myfont1')
        .fontSize(25)
        .text('Test Doc', 0, 20, { width: 612, align: 'center' });
      doc.font('Courier')
        .fontSize(16)
        .text('Courier subheading', 0, 50, { width: 612, align: 'center' });

      doc.font('myfont1').formText('file0', 10, 100, 592, 400, { multiline: true });

      expect(docData.length).toBe(3);
      for (let idx = 0; idx < expected.length; ++idx) {
        expect(docData[idx]).toMatch(joinTokens(expected[idx]))
      }
    });

    test('field heirarchy', () => {

      const expected = [
        "13 0 obj",
        '<<\n/Parent 11 0 R\n/FT /Tx\n/DR <<\n/Font <<\n/F1 8 0 R\n>>\n>>\n/T (leaf1)\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [10 742 210 782]\n>>',
        "endobj",
        '14 0 obj',
        '<<\n/Parent 11 0 R\n/FT /Tx\n/DR <<\n/Font <<\n/F1 8 0 R\n>>\n>>\n/T (leaf2)\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [10 692 210 732]\n>>',
        'endobj',
        '15 0 obj',
        '<<\n/Parent 12 0 R\n/FT /Tx\n/DR <<\n/Font <<\n/F1 8 0 R\n>>\n>>\n/T (leaf3)\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [10 642 210 682]\n>>',
        'endobj'
      ];
      const expected2 = [
        '11 0 obj',
        '<<\n/Parent 10 0 R\n/DR <<\n/Font <<\n/F1 8 0 R\n>>\n>>\n/T (child1Field)\n/Kids [13 0 R 14 0 R]\n>>',
        'endobj',
        '12 0 obj',
        '<<\n/Parent 10 0 R\n/DR <<\n/Font <<\n/F1 8 0 R\n>>\n>>\n/T (child2Field)\n/Kids [15 0 R]\n>>',
        'endobj',
        '10 0 obj',
        '<<\n/DR <<\n/Font <<\n/F1 8 0 R\n>>\n>>\n/T (rootField)\n/Kids [11 0 R 12 0 R]\n>>',
        'endobj',
        '9 0 obj',
        '<<\n/Fields [10 0 R]\n/NeedAppearances true\n/DA (/F1 0 Tf 0 g)\n/DR <<\n/Font <<\n/F1 8 0 R\n>>\n>>\n>>',
        'endobj',
      ];

      const docData = logData(doc);

      doc.font('Helvetica')    // establishes the default font
      doc.initAcroForm()

      let rootField = doc.field('rootField');
      let child1Field = doc.field('child1Field', { Parent: rootField });
      let child2Field = doc.field('child2Field', { Parent: rootField });
      doc.formText('leaf1', 10, 10, 200, 40, { Parent: child1Field })
      doc.formText('leaf2', 10, 60, 200, 40, { Parent: child1Field })
      doc.formText('leaf3', 10, 110, 200, 40, { Parent: child2Field })

      expect(docData.length).toBe(expected.length);
      for (let idx = 0; idx < expected.length; ++idx) {
        expect(docData[idx]).toBe(expected[idx])
      }

      doc.end();

      for (let idx = 0; idx < docData.length; ++idx) {
        if (docData[idx] === expected2[0]) {
          for (let jdx = 0; jdx < expected2.length; ++jdx) {
            expect(docData[idx + jdx]).toBe(expected2[jdx])
          }
        }
      }
    });
  });
});
