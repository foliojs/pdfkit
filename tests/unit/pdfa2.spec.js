import PDFDocument from '../../lib/document';
import { logData, joinTokens } from './helpers';

describe('PDF/A-2', () => {
  test('metadata is present', () => {
    let options = {
      autoFirstPage: false,
      pdfVersion: '1.7',
      subset: 'PDF/A-2',
    };
    let doc = new PDFDocument(options);
    const data = logData(doc);
    doc.end();
    expect(data).toContainChunk([
      `11 0 obj`,
      `<<\n/length 892\n/Type /Metadata\n/Subtype /XML\n/Length 894\n>>`,
    ]);
  });

  test('color profile is present', () => {
    const expected = [
      `10 0 obj`,
      joinTokens(
        '<<',
        '/Type /OutputIntent',
        '/S /GTS_PDFA1',
        '/Info (sRGB IEC61966-2.1)',
        '/OutputConditionIdentifier (sRGB IEC61966-2.1)',
        '/DestOutputProfile 9 0 R',
        '>>',
      ),
    ];
    let options = {
      autoFirstPage: false,
      pdfVersion: '1.7',
      subset: 'PDF/A-2',
    };
    let doc = new PDFDocument(options);
    const data = logData(doc);
    doc.end();
    expect(data).toContainChunk(expected);
  });

  test('metadata contains pdfaid part and conformance', () => {
    let options = {
      autoFirstPage: false,
      pdfVersion: '1.7',
      subset: 'PDF/A-2',
    };
    let doc = new PDFDocument(options);
    const data = logData(doc);
    doc.end();
    let metadata = Buffer.from(data[27]).toString();

    expect(metadata).toContain('pdfaid:part>2');
    expect(metadata).toContain('pdfaid:conformance');
  });

  test('metadata pdfaid conformance B', () => {
    let options = {
      autoFirstPage: false,
      pdfVersion: '1.7',
      subset: 'PDF/A-2b',
    };
    let doc = new PDFDocument(options);
    const data = logData(doc);
    doc.end();
    let metadata = Buffer.from(data[27]).toString();

    expect(metadata).toContain('pdfaid:conformance>B');
  });

  test('metadata pdfaid conformance A', () => {
    let options = {
      autoFirstPage: false,
      pdfVersion: '1.7',
      subset: 'PDF/A-2a',
    };
    let doc = new PDFDocument(options);
    const data = logData(doc);
    doc.end();
    let metadata = Buffer.from(data[27]).toString();

    expect(metadata).toContain('pdfaid:conformance>A');
  });

  test('font data NOT contains CIDSet', () => {
    let options = {
      autoFirstPage: false,
      pdfVersion: '1.4',
      subset: 'PDF/A-2a',
    };
    let doc = new PDFDocument(options);
    const data = logData(doc);
    doc.addPage();
    doc.registerFont('Roboto', 'tests/fonts/Roboto-Regular.ttf');
    doc.font('Roboto');
    doc.text('Text');
    doc.end();

    let fontDescriptor = data.find((v) => {
      return v.includes('/Type /FontDescriptor');
    });

    expect(fontDescriptor).not.toBeUndefined();

    expect(fontDescriptor).not.toContain('/CIDSet');
  });
});
