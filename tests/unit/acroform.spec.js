import zlib from 'zlib';
import PDFDocument from '../../lib/document';
import PDFSecurity from '../../lib/security';
import { logData, joinTokens } from './helpers';
import PDFFontFactory from '../../lib/font_factory';

// Returns the body (as a single binary string, stream bytes included) of the
// `n 0 obj ... endobj` entry logged by `logData`.
function objectBody(docData, n) {
  const start = docData.indexOf(`${n} 0 obj`);
  if (start === -1) return null;
  const end = docData.indexOf('endobj', start);
  return docData
    .slice(start + 1, end)
    .map((item) => (item instanceof Buffer ? item.toString('binary') : item))
    .join('\n');
}

// manual mock for PDFSecurity to ensure stored id will be the same accross different systems
PDFSecurity.generateFileID = () => {
  return Buffer.from('mocked-pdf-id');
};

describe('acroform', () => {
  let doc;

  beforeEach(() => {
    doc = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
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
        '>>',
      ),
      'endobj',
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
        '>>',
      ),
      'endobj',
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
      'endobj',
    ];
    doc.initForm();
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

  test('a field built with hidden: true starts hidden', () => {
    doc.initForm();
    const docData = logData(doc);
    doc.formPushButton('btn1', 20, 20, 100, 30, { hidden: true });
    // 6 = Hidden + Print, overriding the usual default of 4 (print only)
    expect(docData[1]).toContain('/F 6');
  });

  test('a field without hidden keeps the usual print-only default', () => {
    doc.initForm();
    const docData = logData(doc);
    doc.formPushButton('btn1', 20, 20, 100, 30, {});
    expect(docData[1]).toContain('/F 4');
  });

  test('push button with an onClick action', () => {
    const expected = [
      '10 0 obj',
      '<<\n/FT /Btn\n/Ff 65536\n/AA <<\n/U <<\n/S /JavaScript\n/JS (app.alert\\(1\\);)\n>>\n>>\n' +
        '/T (btn1)\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [20 742 120 772]\n/Border [0 0 0]\n/C [0 0 0]\n>>',
      'endobj',
    ];
    doc.initForm();
    const docData = logData(doc);
    doc.formPushButton('btn1', 20, 20, 100, 30, { onClick: 'app.alert(1);' });
    expect(docData.length).toBe(3);
    expect(docData).toContainChunk(expected);
  });

  test.each([
    ['onClick', 'U'],
    ['onMouseDown', 'D'],
    ['onMouseEnter', 'E'],
    ['onMouseExit', 'X'],
    ['onFocus', 'Fo'],
    ['onBlur', 'Bl'],
  ])('%s is written as the /%s action', (option, key) => {
    doc.initForm();
    const docData = logData(doc);
    doc.formText('txt1', 20, 20, 100, 20, { [option]: 'app.alert(1);' });
    expect(docData[1]).toContain(
      `/AA <<\n/${key} <<\n/S /JavaScript\n/JS (app.alert\\(1\\);)\n>>\n>>`,
    );
  });

  test('several actions are written into one AA dictionary', () => {
    doc.initForm();
    const docData = logData(doc);
    doc.formText('txt1', 20, 20, 100, 20, {
      onFocus: 'a();',
      onBlur: 'b();',
    });
    expect(docData[1]).toContain('/Fo <<\n/S /JavaScript\n/JS (a\\(\\);)\n>>');
    expect(docData[1]).toContain('/Bl <<\n/S /JavaScript\n/JS (b\\(\\);)\n>>');
  });

  test('an action given as a function is called with the document as this', () => {
    doc.initForm();
    const docData = logData(doc);
    function onClick() {
      this.getField('txt1').value = 'set';
    }
    doc.formPushButton('btn1', 20, 20, 100, 30, { onClick });

    // The function is written into the action as its own source text. PDF
    // string literals escape parens and newlines, so build the expectation the
    // same way rather than hardcoding the exact whitespace
    // `Function.prototype.toString()` happens to use (see lib/object.js's
    // `escapable` map).
    const expectedJs = `(${onClick}).call(this);`.replace(
      /[\n\r\t\b\f()\\]/g,
      (char) => ({ '\n': '\\n', '\r': '\\r', '(': '\\(', ')': '\\)' })[char],
    );
    expect(docData[1]).toContain('/S /JavaScript');
    expect(docData[1]).toContain(expectedJs);
  });

  test('an action and text formatting combine into one AA dictionary', () => {
    doc.initForm();
    const docData = logData(doc);
    let opts = {
      value: 32.98,
      onClick: 'app.alert(1);',
      format: {
        type: 'number',
        nDec: 2,
      },
    };
    doc.formText('dollars', 20, 20, 50, 20, opts);
    // The onClick action survives...
    expect(docData[1]).toContain(
      '/U <<\n/S /JavaScript\n/JS (app.alert\\(1\\);)\n>>',
    );
    // ...alongside the format-validation actions mapFormat() adds.
    expect(docData[1]).toContain('/K <<\n/S /JavaScript');
    expect(docData[1]).toContain('/F <<\n/S /JavaScript');
  });

  test('an action is added to the AA escape hatch rather than replacing it', () => {
    doc.initForm();
    const docData = logData(doc);
    doc.formText('dollars', 20, 20, 50, 20, {
      value: 32.98,
      onClick: 'app.alert(1);',
      AA: { E: { S: 'JavaScript', JS: new String('enter();') } },
      format: { type: 'number', nDec: 2 },
    });
    expect(docData[1]).toContain(
      '/E <<\n/S /JavaScript\n/JS (enter\\(\\);)\n>>',
    );
    expect(docData[1]).toContain(
      '/U <<\n/S /JavaScript\n/JS (app.alert\\(1\\);)\n>>',
    );
  });

  test('type flags do not leak implementation markers', () => {
    doc.initForm();
    const docData = logData(doc);

    doc.formRadioButton('radio1', 20, 20, 50, 20);
    doc.formCombo('combo1', 20, 50, 50, 20);

    expect(docData[1]).toContain('/Ff 32768');
    expect(docData[1]).not.toContain('radioButton');
    expect(docData[1]).not.toContain('RadioButton');
    expect(docData[4]).toContain('/Ff 131072');
    expect(docData[4]).not.toContain('/combo');
    expect(docData[4]).not.toContain('/Combo');
  });

  describe('text format', () => {
    test('number', () => {
      const expected = [
        '10 0 obj',
        '<<\n/FT /Tx\n/V 32.98\n/AA <<\n/K <<\n/S /JavaScript\n' +
          '/JS (AFNumber_Keystroke\\(2,1,"MinusBlack",null,"$",true\\);)\n>>\n' +
          '/F <<\n/S /JavaScript\n/JS (AFNumber_Format\\(2,1,"MinusBlack",null,"$",true\\);)\n>>\n>>\n' +
          '/T (dollars)\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [20 752 70 772]\n/Border [0 0 0]\n/C [0 0 0]\n>>',
        'endobj',
      ];
      doc.initForm();
      const docData = logData(doc);
      let opts = {
        value: 32.98,
        format: {
          type: 'number',
          nDec: 2,
          currency: '$',
          currencyPrepend: true,
        },
      };
      doc.formText('dollars', 20, 20, 50, 20, opts);
      expect(docData.length).toBe(3);
      expect(docData).toContainChunk(expected);
    });
    test('date', () => {
      const expected = [
        '10 0 obj',
        '<<\n/FT /Tx\n/V (1999-12-31)\n/AA <<\n/K <<\n/S /JavaScript\n' +
          '/JS (AFDate_KeystrokeEx\\("yyyy-mm-dd"\\);)\n>>\n' +
          '/F <<\n/S /JavaScript\n/JS (AFDate_FormatEx\\("yyyy-mm-dd"\\);)\n>>\n>>\n' +
          '/T (date)\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [20 752 70 772]\n/Border [0 0 0]\n/C [0 0 0]\n>>',
        'endobj',
      ];
      doc.initForm();
      const docData = logData(doc);
      let opts = {
        value: '1999-12-31',
        format: {
          type: 'date',
          param: 'yyyy-mm-dd',
        },
      };
      doc.formText('date', 20, 20, 50, 20, opts);
      expect(docData.length).toBe(3);
      expect(docData).toContainChunk(expected);
    });

    test('date format containing spaces and commas', () => {
      // an unquoted format is not valid JavaScript, so the viewer
      // cannot run the action and the field is left unformatted
      const expected = [
        '10 0 obj',
        '<<\n/FT /Tx\n/V (1999-12-31)\n/AA <<\n/K <<\n/S /JavaScript\n' +
          '/JS (AFDate_KeystrokeEx\\("mmmm d, yyyy"\\);)\n>>\n' +
          '/F <<\n/S /JavaScript\n/JS (AFDate_FormatEx\\("mmmm d, yyyy"\\);)\n>>\n>>\n' +
          '/T (date)\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [20 752 70 772]\n/Border [0 0 0]\n/C [0 0 0]\n>>',
        'endobj',
      ];
      doc.initForm();
      const docData = logData(doc);
      let opts = {
        value: '1999-12-31',
        format: {
          type: 'date',
          param: 'mmmm d, yyyy',
        },
      };
      doc.formText('date', 20, 20, 50, 20, opts);
      expect(docData.length).toBe(3);
      expect(docData).toContainChunk(expected);
    });

    test.each([
      ['undefined', undefined],
      ['null', null],
    ])('nullish %s value uses an empty string', (_label, value) => {
      const expectedDoc = new PDFDocument({
        info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
      });
      expectedDoc.initForm();
      const expectedDocData = logData(expectedDoc);
      expectedDoc.formText('empty', 20, 20, 50, 20, { value: '' });

      doc.initForm();
      const docData = logData(doc);
      doc.formText('empty', 20, 20, 50, 20, { value });

      expect(docData).toContainChunk(expectedDocData);
    });
  });

  test('flags', () => {
    const expected = [
      '10 0 obj',
      '<<\n/FT /Tx\n' +
        '/Ff 4206599\n/Q 1\n' +
        '/T (flags)\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [20 752 70 772]\n/Border [0 0 0]\n/C [0 0 0]\n>>',
      'endobj',
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
      noSpell: true,
    };
    doc.formText('flags', 20, 20, 50, 20, opts);
    expect(docData.length).toBe(3);
    expect(docData).toContainChunk(expected);
  });

  test('false flags should be ignored', () => {
    const expectedDoc = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
    });
    expectedDoc.initForm();
    const expectedDocData = logData(expectedDoc);
    let emptyOpts = {
      align: 'center',
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
      noSpell: false,
    };
    doc.formText('flags', 20, 20, 50, 20, opts);

    expect(docData).toContainChunk(expectedDocData);
  });

  test('undefined flags should be ignored', () => {
    const expectedDoc = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
    });
    expectedDoc.initForm();
    const expectedDocData = logData(expectedDoc);
    let emptyOpts = {};
    expectedDoc.formText('flags', 20, 20, 50, 20, emptyOpts);

    doc.initForm();
    const docData = logData(doc);
    let opts = {
      required: undefined,
      noExport: undefined,
      readOnly: undefined,
      align: undefined,
      multiline: undefined,
      password: undefined,
      noSpell: undefined,
    };
    doc.formText('flags', 20, 20, 50, 20, opts);

    expect(docData).toContainChunk(expectedDocData);
  });

  test("align left doesn't write the default Q value", () => {
    doc.initForm();
    const docData = logData(doc);

    doc.formText('left', 20, 20, 50, 20, { align: 'left' });

    expect(docData[1]).not.toContain('/Q');
  });

  test('font size', () => {
    const expected = [
      '11 0 obj',
      '<<\n' +
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
        '>>',
      'endobj',
    ];
    doc.registerFont('myfont1', 'tests/fonts/Roboto-Regular.ttf');
    doc.initForm();
    const docData = logData(doc);
    let opts = {
      fontSize: 16,
    };
    doc.font('myfont1').formText('text', 20, 20, 50, 20, opts);
    expect(docData.length).toBe(3);
    expect(docData).toContainChunk(expected);
  });

  test('field hierarchy', () => {
    const expected = [
      '13 0 obj',
      '<<\n/FT /Tx\n/T (leaf1)\n/Parent 11 0 R\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [10 742 210 782]\n/Border [0 0 0]\n/C [0 0 0]\n>>',
      'endobj',
      '14 0 obj',
      '<<\n/FT /Tx\n/T (leaf2)\n/Parent 11 0 R\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [10 692 210 732]\n/Border [0 0 0]\n/C [0 0 0]\n>>',
      'endobj',
      '15 0 obj',
      '<<\n/FT /Tx\n/T (leaf3)\n/Parent 12 0 R\n/Subtype /Widget\n/F 4\n/Type /Annot\n/Rect [10 642 210 682]\n/Border [0 0 0]\n/C [0 0 0]\n>>',
      'endobj',
    ];
    const expected2 = [
      '11 0 obj',
      '<<\n/T (child1Field)\n/Parent 10 0 R\n/Kids [13 0 R 14 0 R]\n>>',
      'endobj',
      '12 0 obj',
      '<<\n/T (child2Field)\n/Parent 10 0 R\n/Kids [15 0 R]\n>>',
      'endobj',
      '10 0 obj',
      '<<\n/T (rootField)\n/Kids [11 0 R 12 0 R]\n>>',
      'endobj',
      '9 0 obj',
      '<<\n/Fields [10 0 R]\n/NeedAppearances true\n/DA (/F1 0 Tf 0 g)\n/DR <<\n/Font <<\n/F1 8 0 R\n>>\n>>\n>>',
      'endobj',
    ];

    const docData = logData(doc);

    doc.font('Helvetica'); // establishes the default font
    doc.initForm();

    let rootField = doc.formField('rootField');
    let child1Field = doc.formField('child1Field', { parent: rootField });
    let child2Field = doc.formField('child2Field', { parent: rootField });
    doc.formText('leaf1', 10, 10, 200, 40, { parent: child1Field });
    doc.formText('leaf2', 10, 60, 200, 40, { parent: child1Field });
    doc.formText('leaf3', 10, 110, 200, 40, { parent: child2Field });

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

  test('without embedFonts the form reuses the content-stream font', () => {
    const docData = logData(doc);

    doc.font('tests/fonts/Roboto-Regular.ttf');
    doc.initForm();
    doc.formText('field1', 10, 10, 200, 20, { value: 'Hello' });
    doc.text('Hello', 10, 100);
    doc.end();

    const acroFormIdx = docData.findIndex(
      (item) => typeof item === 'string' && item.includes('/NeedAppearances'),
    );
    const drFontRef = docData[acroFormIdx].match(
      /\/DR\s*<<\s*\/Font\s*<<\s*\/\S+\s+(\d+)\s+0\s+R/,
    );
    expect(drFontRef).not.toBeNull();

    // The same object the page content references, and no second copy of the
    // font program: the default stays exactly as it was before the option.
    const pageFontRefIdx = docData.findIndex(
      (item) =>
        typeof item === 'string' &&
        item.includes('/ProcSet') &&
        item.includes('/Font'),
    );
    const pageFontRef = docData[pageFontRefIdx].match(/\/F\d+ (\d+) 0 R/);
    expect(drFontRef[1]).toBe(pageFontRef[1]);
    expect(objectBody(docData, drFontRef[1])).toContain(
      '/Encoding /Identity-H',
    );
  });

  // Regression test for https://github.com/foliojs/pdfkit/issues/1096:
  // a custom embedded font applied to a form field rendered with the wrong
  // font in readers (e.g. Adobe Acrobat/Reader) that regenerate the field's
  // appearance from its value, even though the same font renders correctly
  // for ordinary page text.
  test('embedFonts gives the form a font readers resolve field text against', () => {
    const docData = logData(doc);

    doc.font('tests/fonts/Roboto-Regular.ttf');
    doc.initForm({ embedFonts: true });
    doc.formText('field1', 10, 10, 200, 20, { value: 'Hello' });
    // Also draw with the same font in the page content, so the test proves
    // the two usages embed independently rather than sharing one font object.
    doc.text('Hello', 10, 100);
    doc.end();

    // Locate the AcroForm dict, and the font object its /DR references.
    const acroFormIdx = docData.findIndex(
      (item) => typeof item === 'string' && item.includes('/NeedAppearances'),
    );
    expect(acroFormIdx).toBeGreaterThan(-1);
    const drFontRef = docData[acroFormIdx].match(
      /\/DR\s*<<\s*\/Font\s*<<\s*\/\S+\s+(\d+)\s+0\s+R/,
    );
    expect(drFontRef).not.toBeNull();
    const acroFormFontBody = objectBody(docData, drFontRef[1]);

    // The AcroForm font is a composite font, like the one pdfkit uses in
    // content streams, but addressed through a custom CMap instead of
    // `/Identity-H`: Identity-H has no character encoding a reader could
    // resolve on its own, since it only works when the content stream
    // author (pdfkit itself) already knows which glyph id corresponds to
    // each character.
    expect(acroFormFontBody).toContain('/Subtype /Type0');
    expect(acroFormFontBody).not.toContain('/Encoding /Identity-H');

    // The font actually used to draw page text is a different object,
    // untouched: still the subsetted Type0/Identity-H composite font.
    const pageFontRefIdx = docData.findIndex(
      (item) =>
        typeof item === 'string' &&
        item.includes('/ProcSet') &&
        item.includes('/Font'),
    );
    expect(pageFontRefIdx).toBeGreaterThan(-1);
    const pageFontRef = docData[pageFontRefIdx].match(/\/F\d+ (\d+) 0 R/);
    expect(pageFontRef[1]).not.toBe(drFontRef[1]);
    const contentFontBody = objectBody(docData, pageFontRef[1]);
    expect(contentFontBody).toContain('/Subtype /Type0');
    expect(contentFontBody).toContain('/Encoding /Identity-H');

    // The whole point: the AcroForm font's /Encoding must be a custom CMap a
    // reader can use to resolve arbitrary WinAnsiEncoding field text to a
    // glyph on its own -- built from `this.font`'s own character coverage,
    // not from whatever `this.subset` (the font used for the page text
    // above) happens to already include.
    const encodingRef = acroFormFontBody.match(/\/Encoding (\d+) 0 R/);
    expect(encodingRef).not.toBeNull();
    const cmapObjectBody = objectBody(docData, encodingRef[1]);
    expect(cmapObjectBody).toContain('/Type /CMap');
    const cmapStreamMatch = cmapObjectBody.match(
      /stream\r?\n([\s\S]*?)\r?\nendstream/,
    );
    const cmapBody = zlib
      .inflateSync(Buffer.from(cmapStreamMatch[1], 'binary'))
      .toString('latin1');
    expect(cmapBody).toContain('begincidchar');
    // 'H' (0x48) is in "Hello", drawn as page content above, but WinAnsi code
    // 0x21 ('!') never appears anywhere in this test -- the CMap must cover
    // it anyway, since it isn't built from the glyphs used so far.
    expect(cmapBody).toMatch(/<48> \d+/);
    expect(cmapBody).toMatch(/<21> \d+/);
  });

  // Same regression as above, but for a CFF-flavored font (OpenType/CFF
  // rather than TrueType). fontkit's CFF subsetter always emits CID-keyed,
  // nameless output, and a naive "subset then embed" approach still leaves
  // the AcroForm font unreadable by a viewer -- the composite font with a
  // custom WinAnsi CMap must work for this font format too, embedded as
  // `/FontFile3 /Subtype /CIDFontType0C` rather than `/FontFile2`.
  test('embedFonts resolves field text for a CFF-flavored font too', () => {
    const docData = logData(doc);

    doc.font('tests/fonts/Montserrat-Bold.otf');
    doc.initForm({ embedFonts: true });
    doc.formText('field1', 10, 10, 200, 20, { value: 'Hello' });
    doc.text('Hello', 10, 100);
    doc.end();

    const acroFormIdx = docData.findIndex(
      (item) => typeof item === 'string' && item.includes('/NeedAppearances'),
    );
    expect(acroFormIdx).toBeGreaterThan(-1);
    const drFontRef = docData[acroFormIdx].match(
      /\/DR\s*<<\s*\/Font\s*<<\s*\/\S+\s+(\d+)\s+0\s+R/,
    );
    expect(drFontRef).not.toBeNull();
    const acroFormFontBody = objectBody(docData, drFontRef[1]);

    expect(acroFormFontBody).toContain('/Subtype /Type0');
    expect(acroFormFontBody).not.toContain('/Encoding /Identity-H');

    // Descendant font must be CIDFontType0/CIDFontType0C, not the
    // TrueType-only CIDFontType2/FontFile2 path.
    const descendantRef = acroFormFontBody.match(
      /\/DescendantFonts\s*\[\s*(\d+)\s+0\s+R/,
    );
    expect(descendantRef).not.toBeNull();
    const descendantBody = objectBody(docData, descendantRef[1]);
    expect(descendantBody).toContain('/Subtype /CIDFontType0');
    expect(descendantBody).not.toContain('/CIDToGIDMap');

    const descriptorRef = descendantBody.match(/\/FontDescriptor (\d+) 0 R/);
    expect(descriptorRef).not.toBeNull();
    const descriptorBody = objectBody(docData, descriptorRef[1]);
    const fontFileRef = descriptorBody.match(/\/FontFile3 (\d+) 0 R/);
    expect(fontFileRef).not.toBeNull();
    const fontFileBody = objectBody(docData, fontFileRef[1]);
    expect(fontFileBody).toContain('/Subtype /CIDFontType0C');

    const encodingRef = acroFormFontBody.match(/\/Encoding (\d+) 0 R/);
    expect(encodingRef).not.toBeNull();
    const cmapObjectBody = objectBody(docData, encodingRef[1]);
    expect(cmapObjectBody).toContain('/Type /CMap');
    const cmapStreamMatch = cmapObjectBody.match(
      /stream\r?\n([\s\S]*?)\r?\nendstream/,
    );
    const cmapBody = zlib
      .inflateSync(Buffer.from(cmapStreamMatch[1], 'binary'))
      .toString('latin1');
    expect(cmapBody).toContain('begincidchar');
    expect(cmapBody).toMatch(/<48> \d+/);
    expect(cmapBody).toMatch(/<21> \d+/);
  });
});
