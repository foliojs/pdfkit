import PDFDocument from '../../lib/document';
import { logData, joinTokens } from './helpers';

describe('PDF/A-1', () => {
  test('metadata is present', () => {
    let options = {
      autoFirstPage: false,
      pdfVersion: '1.4',
      subset: 'PDF/A-1',
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
      pdfVersion: '1.4',
      subset: 'PDF/A-1',
    };
    let doc = new PDFDocument(options);
    const data = logData(doc);
    doc.end();
    expect(data).toContainChunk(expected);
  });

  test('metadata contains pdfaid part and conformance', () => {
    let options = {
      autoFirstPage: false,
      pdfVersion: '1.4',
      subset: 'PDF/A-1',
    };
    let doc = new PDFDocument(options);
    const data = logData(doc);
    doc.end();
    let metadata = Buffer.from(data[27]).toString();

    expect(metadata).toContain('pdfaid:part>1');
    expect(metadata).toContain('pdfaid:conformance');
  });

  test('metadata pdfaid conformance B', () => {
    let options = {
      autoFirstPage: false,
      pdfVersion: '1.4',
      subset: 'PDF/A-1b',
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
      pdfVersion: '1.4',
      subset: 'PDF/A-1a',
    };
    let doc = new PDFDocument(options);
    const data = logData(doc);
    doc.end();
    let metadata = Buffer.from(data[27]).toString();

    expect(metadata).toContain('pdfaid:conformance>A');
  });

  test('font data contains CIDSet', () => {
    let options = {
      autoFirstPage: false,
      pdfVersion: '1.4',
      subset: 'PDF/A-1a',
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

    expect(fontDescriptor).toContain('/CIDSet');
  });

  test('CIDSet correctly identifies all glyphs in the subset', () => {
    let options = {
      autoFirstPage: false,
      compress: false,
      pdfVersion: '1.4',
      subset: 'PDF/A-1a',
    };
    let doc = new PDFDocument(options);
    const data = logData(doc);
    doc.addPage();
    doc.registerFont('Roboto', 'tests/fonts/Roboto-Regular.ttf');
    doc.font('Roboto');
    doc.text('Text');
    const widths = doc._font.widths.slice();
    doc.end();

    const maxCID = widths.length - 1;
    const CIDSet = Buffer.alloc(Math.ceil((maxCID + 1) / 8), 0);
    for (let cid = 0; cid <= maxCID; cid++) {
      if (widths[cid] != null) {
        CIDSet[Math.floor(cid / 8)] |= 0x80 >> cid % 8;
      }
    }

    let found = false;
    for (let i = 0; i < data.length - 1; i++) {
      if (data[i] === 'stream' && data[i + 1] instanceof Buffer) {
        if (data[i + 1].equals(CIDSet)) {
          found = true;
          break;
        }
      }
    }

    expect(found).toBe(true);
  });
});
