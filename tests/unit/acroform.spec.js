import PDFDocument from '../../lib/document';
import PDFSecurity from '../../lib/security';
import { logData, joinTokens } from './helpers';
import PDFFontFactory from '../../lib/font_factory';

// manual mock for PDFSecurity to ensure stored id will be the same accross different systems
PDFSecurity.generateFileID = () => {
  return Buffer.from('mocked-pdf-id');
};

describe('acroform', () => {
  let doc;

  beforeEach(() => {
    doc = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) }
    });
  });

  test('named JavaScript', () => {
    const expected = [
      '2 0 obj',
      // '<<\n/Dests <<\n/Names []\n>>\n/JavaScript <<\n/Names [\n(name1) <<\n/JS (my javascript goes here)\n/S /JavaScript\n>>\n]\n>>\n>>',
      joinTokens(
        '<<',
        '/Dests',
        '<<',
        '/Names',
        '[',
        ']',
        '>>',
        '/JavaScript',
        '<<',
        '/Names',
        '[',
        '(name1)',
        '<<',
        '/JS',
        '(my javascript goes here)',
        '/S',
        '/JavaScript',
        '>>',
        ']',
        '>>',
        '>>'
      ),
      'endobj'
    ];
    const docData = logData(doc);
    doc.addNamedJavaScript('name1', 'my javascript goes here');
    expect(docData.length).toBe(0);
    doc.end();
    expect(docData).toContainChunk(expected);
  });

  test('init no fonts', () => {
    doc.addPage();
    const docData = logData(doc);
    PDFFontFactory.open(doc, 'tests/fonts/Roboto-Regular.ttf');
    doc.initForm();
    expect(docData.length).toBe(0);
  });

  test('init standard fonts', () => {
    const expected = [
      '12 0 obj',
      joinTokens(
        '<<',
        '/FT',
        '/Tx',
        '/Ff',
        '4096',
        '/DR',
        '<<',
        '/Font',
        '<<',
        '/F3',
        '10 0 R',
        '>>',
        '>>',
        '/DA',
        '(/F3 0 Tf 0 g)',
        '/T',
        '(file0)',
        '/Subtype',
        '/Widget',
        '/F',
        '4',
        '/Type',
        '/Annot',
        '/Rect',
        '[10 292 602 692]',
        '/Border [0 0 0]',
        '/C [0 0 0]',
        '>>'
      ),
      'endobj'
    ];

    const docData = logData(doc);
    doc.registerFont('myfont1', 'tests/fonts/Roboto-Regular.ttf');

    doc.font('Courier-Bold'); // establishes the default font
    doc.initForm();

    doc
      .font('myfont1')
      .fontSize(25)
      .text('Test Doc', 0, 20, { width: 612, align: 'center' });
    doc
      .font('Courier')
      .fontSize(16)
      .text('Courier subheading', 0, 50, { width: 612, align: 'center' });

    doc
      .font('myfont1')
      .formText('file0', 10, 100, 592, 400, { multiline: true });

    expect(docData.length).toBe(3);
    expect(docData).toContainChunk(expected);
  });

  test('push button', () => {
    const expected = [
      '10 0 obj',
      '<<\n/FT /Btn\n/Ff 65536\n/MK <<\n/CA (Test Button)\n/BG [1 1 0]\n>>\n/T (btn1)\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [20 742 120 772]\n/Border [0 0 0]\n/C [0 0 0]\n>>',
      'endobj'
    ];
    doc.initForm();
    const docData = logData(doc);
    let opts = {
      backgroundColor: 'yellow',
      label: 'Test Button'
    };
    doc.formPushButton('btn1', 20, 20, 100, 30, opts);
    expect(docData.length).toBe(3);
    expect(docData[0]).toBe(expected[0]);
    expect(docData[1]).toBe(expected[1]);
    expect(docData[2]).toBe(expected[2]);
  });

  describe('text format', () => {
    test('number', () => {
      const expected = [
        '10 0 obj',
        '<<\n/FT /Tx\n/V 32.98\n/AA <<\n/K <<\n/S /JavaScript\n' +
          '/JS (AFNumber_Keystroke\\(2,1,"MinusBlack",null,"$",true\\);)\n>>\n' +
          '/F <<\n/S /JavaScript\n/JS (AFNumber_Format\\(2,1,"MinusBlack",null,"$",true\\);)\n>>\n>>\n' +
          '/T (dollars)\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [20 752 70 772]\n/Border [0 0 0]\n/C [0 0 0]\n>>',
        'endobj'
      ];
      doc.initForm();
      const docData = logData(doc);
      let opts = {
        value: 32.98,
        format: {
          type: 'number',
          nDec: 2,
          currency: '$',
          currencyPrepend: true
        }
      };
      doc.formText('dollars', 20, 20, 50, 20, opts);
      expect(docData.length).toBe(3);
      expect(docData).toContainChunk(expected);
    });
    test('date', () => {
      const expected = [
        '10 0 obj',
        '<<\n/FT /Tx\n/V (1999-12-31)\n/AA <<\n/K <<\n/S /JavaScript\n' +
          '/JS (AFDate_KeystrokeEx\\(yyyy-mm-dd\\);)\n>>\n' +
          '/F <<\n/S /JavaScript\n/JS (AFDate_Format\\(yyyy-mm-dd\\);)\n>>\n>>\n' +
          '/T (date)\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [20 752 70 772]\n/Border [0 0 0]\n/C [0 0 0]\n>>',
        'endobj'
      ];
      doc.initForm();
      const docData = logData(doc);
      let opts = {
        value: '1999-12-31',
        format: {
          type: 'date',
          param: 'yyyy-mm-dd'
        }
      };
      doc.formText('date', 20, 20, 50, 20, opts);
      expect(docData.length).toBe(3);
      expect(docData).toContainChunk(expected);
    });
  });

  test('flags', () => {
    const expected = [
      '10 0 obj',
      '<<\n/FT /Tx\n' +
        '/Ff 4206599\n/Q 1\n' +
        '/T (flags)\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [20 752 70 772]\n/Border [0 0 0]\n/C [0 0 0]\n>>',
      'endobj'
    ];
    doc.initForm();
    const docData = logData(doc);
    let opts = {
      required: true,
      noExport: true,
      readOnly: true,
      align: 'center',
      multiline: true,
      password: true,
      noSpell: true
    };
    doc.formText('flags', 20, 20, 50, 20, opts);
    expect(docData.length).toBe(3);
    expect(docData).toContainChunk(expected);
  });

  test('false flags should be ignored', () => {
    const expectedDoc = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) }
    });
    expectedDoc.initForm();
    const expectedDocData = logData(expectedDoc);
    let emptyOpts = {
      align: 'center'
    };
    expectedDoc.formText('flags', 20, 20, 50, 20, emptyOpts);

    doc.initForm();
    const docData = logData(doc);
    let opts = {
      required: false,
      noExport: false,
      readOnly: false,
      align: 'center',
      multiline: false,
      password: false,
      noSpell: false
    };
    doc.formText('flags', 20, 20, 50, 20, opts);

    expect(docData).toContainChunk(expectedDocData);
  });

  test('font size', () => {
    const expected = [
      '11 0 obj',
      '<<\n' +
        '/fontSize 16\n' +
        '/FT /Tx\n' +
        '/DR <<\n' +
        '/Font <<\n' +
        '/F2 10 0 R\n' +
        '>>\n' +
        '>>\n' +
        '/DA (/F2 16 Tf 0 g)\n' +
        '/T (text)\n' +
        '/Subtype /Widget\n' +
        '/F 4\n' +
        '/Type /Annot\n' +
        '/Rect [20 752 70 772]\n' +
        '/Border [0 0 0]\n' +
        '/C [0 0 0]\n' +
        '/FontSize 16\n' +
        '>>',
      'endobj'
    ];
    doc.registerFont('myfont1', 'tests/fonts/Roboto-Regular.ttf');
    doc.initForm();
    const docData = logData(doc);
    let opts = {
      fontSize: 16
    };
    doc.font('myfont1').formText('text', 20, 20, 50, 20, opts);
    expect(docData.length).toBe(3);
    expect(docData).toContainChunk(expected);
  });

  test('field heirarchy', () => {
    const expected = [
      '13 0 obj',
      '<<\n/Parent 11 0 R\n/FT /Tx\n/T (leaf1)\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [10 742 210 782]\n/Border [0 0 0]\n/C [0 0 0]\n>>',
      'endobj',
      '14 0 obj',
      '<<\n/Parent 11 0 R\n/FT /Tx\n/T (leaf2)\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [10 692 210 732]\n/Border [0 0 0]\n/C [0 0 0]\n>>',
      'endobj',
      '15 0 obj',
      '<<\n/Parent 12 0 R\n/FT /Tx\n/T (leaf3)\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [10 642 210 682]\n/Border [0 0 0]\n/C [0 0 0]\n>>',
      'endobj'
    ];
    const expected2 = [
      '11 0 obj',
      '<<\n/Parent 10 0 R\n/T (child1Field)\n/Kids [13 0 R 14 0 R]\n>>',
      'endobj',
      '12 0 obj',
      '<<\n/Parent 10 0 R\n/T (child2Field)\n/Kids [15 0 R]\n>>',
      'endobj',
      '10 0 obj',
      '<<\n/T (rootField)\n/Kids [11 0 R 12 0 R]\n>>',
      'endobj',
      '9 0 obj',
      '<<\n/Fields [10 0 R]\n/NeedAppearances true\n/DA (/F1 0 Tf 0 g)\n/DR <<\n/Font <<\n/F1 8 0 R\n>>\n>>\n>>',
      'endobj'
    ];

    const docData = logData(doc);

    doc.font('Helvetica'); // establishes the default font
    doc.initForm();

    let rootField = doc.formField('rootField');
    let child1Field = doc.formField('child1Field', { Parent: rootField });
    let child2Field = doc.formField('child2Field', { Parent: rootField });
    doc.formText('leaf1', 10, 10, 200, 40, { Parent: child1Field });
    doc.formText('leaf2', 10, 60, 200, 40, { Parent: child1Field });
    doc.formText('leaf3', 10, 110, 200, 40, { Parent: child2Field });

    expect(docData.length).toBe(expected.length);
    for (let idx = 0; idx < expected.length; ++idx) {
      expect(docData[idx]).toBe(expected[idx]);
    }

    doc.end();

    for (let idx = 0; idx < docData.length; ++idx) {
      if (docData[idx] === expected2[0]) {
        for (let jdx = 0; jdx < expected2.length; ++jdx) {
          expect(docData[idx + jdx]).toBe(expected2[jdx]);
        }
      }
    }
  });
});
