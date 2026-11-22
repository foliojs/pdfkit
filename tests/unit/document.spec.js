import { vi } from 'vitest';
import PDFDocument from '../../lib/document';
import { logData } from './helpers';
import Helvetica from '../../lib/font/generated/Helvetica';

describe('PDFDocument', () => {
  describe('font option', () => {
    let fontSpy;

    beforeEach(() => {
      fontSpy = vi.spyOn(PDFDocument.prototype, 'font').mockReturnThis();
    });

    afterEach(() => {
      fontSpy.mockRestore();
    });

    test('not defined', () => {
      new PDFDocument();

      expect(fontSpy).toBeCalledWith('Helvetica', null);
    });

    test('a string value', () => {
      new PDFDocument({ font: 'Roboto' });

      expect(fontSpy).toBeCalledWith('Roboto', null);
    });

    test('a falsy value', () => {
      new PDFDocument({ font: null });
      new PDFDocument({ font: false });
      new PDFDocument({ font: '' });

      expect(fontSpy).not.toBeCalled();
    });
  });

  describe('document info', () => {
    test('accepts properties with value undefined', () => {
      expect(() => new PDFDocument({ info: { Title: undefined } })).not.toThrow(
        new TypeError("Cannot read property 'toString' of undefined"),
      );
    });

    test('accepts properties with value null', () => {
      expect(() => new PDFDocument({ info: { Title: null } })).not.toThrow(
        new TypeError("Cannot read property 'toString' of null"),
      );
    });
  });

  test('metadata is present for PDF 1.4', () => {
    let doc = new PDFDocument({ pdfVersion: '1.4' });
    const data = logData(doc);
    doc.end();

    let catalog = data[data.length - 28];

    expect(catalog).toContain('/Metadata');
  });

  test('metadata is NOT present for PDF 1.3', () => {
    let doc = new PDFDocument({ pdfVersion: '1.3' });
    const data = logData(doc);
    doc.end();

    let catalog = data[data.length - 27];

    expect(catalog).not.toContain('/Metadata');
  });

  describe('pageLayout', () => {
    test('sets PageLayout in catalog when provided', () => {
      const doc = new PDFDocument({ pageLayout: 'twoColumnLeft' });
      expect(doc._root.data.PageLayout).toBe('TwoColumnLeft');
    });

    test('does not set PageLayout when not provided', () => {
      const doc = new PDFDocument();
      expect(doc._root.data.PageLayout).toBeUndefined();
    });

    test.each([
      ['singlePage', 'SinglePage'],
      ['oneColumn', 'OneColumn'],
      ['twoColumnLeft', 'TwoColumnLeft'],
      ['twoColumnRight', 'TwoColumnRight'],
      ['twoPageLeft', 'TwoPageLeft'],
      ['twoPageRight', 'TwoPageRight'],
    ])('converts %s to %s', (input, expected) => {
      const doc = new PDFDocument({ pageLayout: input });
      expect(doc._root.data.PageLayout).toBe(expected);
    });
  });

  describe('onPageAdded option', () => {
    test.each([{}, { autoFirstPage: true }])(
      'runs once during construction and once per addPage, options %j',
      (options) => {
        let pageNumber = 0;
        const onPageAdded = vi.fn((d) => {
          pageNumber += 1;
          d.text(`page ${pageNumber} text`);
        });
        const doc = new PDFDocument({
          bufferPages: true,
          compress: false,
          ...options,
          onPageAdded,
        });
        const data = logData(doc);

        expect(onPageAdded).toHaveBeenCalledTimes(1);
        expect(onPageAdded).toHaveBeenLastCalledWith(doc);

        doc.addPage();
        expect(onPageAdded).toHaveBeenCalledTimes(2);
        expect(onPageAdded).toHaveBeenLastCalledWith(doc);

        doc.end();
        expect(data).toContainText({ text: 'page 1 text' });
        expect(data).toContainText({ text: 'page 2 text' });
      },
    );

    test('runs on the first manual addPage with autoFirstPage: false', () => {
      const onPageAdded = vi.fn();
      const doc = new PDFDocument({ autoFirstPage: false, onPageAdded });

      expect(onPageAdded).not.toHaveBeenCalled();

      doc.addPage();
      expect(onPageAdded).toHaveBeenCalledTimes(1);
      expect(onPageAdded).toHaveBeenLastCalledWith(doc);
      doc.end();
    });

    test('receives the document on the browser stream', async () => {
      vi.resetModules();
      vi.doMock('#stream', () => import('../../lib/stream/browser.js'));
      try {
        const standardFonts = await import('../../lib/font/standard_fonts');
        standardFonts.registerStdFonts(Helvetica);
        const { default: BrowserPDFDocument } =
          await import('../../lib/document');

        const onPageAdded = vi.fn((d) => d.text('browser first page'));
        const doc = new BrowserPDFDocument({ compress: false, onPageAdded });
        const data = logData(doc);

        expect(onPageAdded).toHaveBeenCalledTimes(1);
        expect(onPageAdded).toHaveBeenLastCalledWith(doc);

        doc.end();
        expect(data).toContainText({ text: 'browser first page' });
      } finally {
        vi.doUnmock('#stream');
        vi.resetModules();
      }
    });

    test('does not change listeners attached after construction', () => {
      const doc = new PDFDocument();
      const trace = [];
      doc.on('pageAdded', () => trace.push('on'));
      doc.once('pageAdded', () => trace.push('once'));

      expect(trace).toEqual([]);

      doc.addPage();
      expect(trace).toEqual(['on', 'once']);

      doc.addPage();
      expect(trace).toEqual(['on', 'once', 'on']);
      doc.end();
    });
  });
});
