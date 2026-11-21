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

  describe('pageAdded event', () => {
    test('feature detection falls back to on() when the base stream has no addListener (browser build)', async () => {
      vi.resetModules();
      vi.doMock('#stream', () => import('../../lib/stream/browser.js'));
      try {
        const standardFonts = await import('../../lib/font/standard_fonts');
        standardFonts.registerStdFonts(Helvetica);
        const { default: BrowserPDFDocument } =
          await import('../../lib/document');
        const doc = new BrowserPDFDocument();
        expect(doc.addListener).toBeUndefined();

        let count = 0;
        const listener = () => {
          count++;
        };
        if (typeof doc.addListener === 'function')
          doc.addListener('pageAdded', listener);
        else doc.on('pageAdded', listener);
        expect(count).toBe(1);

        doc.addPage();
        expect(count).toBe(2);
        doc.end();
      } finally {
        vi.doUnmock('#stream');
        vi.resetModules();
      }
    });

    test('fires synchronously for the first page when a listener is attached after construction', () => {
      const doc = new PDFDocument();
      const firstPage = doc.page;
      let pageAtCall;
      doc.on('pageAdded', () => {
        pageAtCall = doc.page;
      });

      expect(pageAtCall).toBe(firstPage);
      doc.end();
    });

    test('emits pageAdded for each page in order before end() returns', () => {
      const doc = new PDFDocument();
      const firstPage = doc.page;
      const order = [];
      doc.on('pageAdded', () => order.push(doc.page));
      doc.addPage();
      const secondPage = doc.page;
      doc.addPage();
      const thirdPage = doc.page;
      doc.end();
      order.push('end');

      expect(order).toEqual([firstPage, secondPage, thirdPage, 'end']);
    });

    test('does not fire the first-page event for a listener attached after a second addPage', () => {
      const doc = new PDFDocument();
      doc.addPage();
      const listener = vi.fn();
      doc.on('pageAdded', listener);

      expect(listener).not.toHaveBeenCalled();

      doc.addPage();
      expect(listener).toHaveBeenCalledTimes(1);
      doc.end();
    });

    test('does not fire an extra event with autoFirstPage: false', () => {
      const doc = new PDFDocument({ autoFirstPage: false });
      const listener = vi.fn();
      doc.on('pageAdded', listener);

      expect(listener).not.toHaveBeenCalled();

      doc.addPage();
      expect(listener).toHaveBeenCalledTimes(1);
      doc.end();
    });

    test('once() fires the first-page event exactly once', () => {
      const doc = new PDFDocument();
      const listener = vi.fn();
      doc.once('pageAdded', listener);

      expect(listener).toHaveBeenCalledTimes(1);

      doc.addPage();
      expect(listener).toHaveBeenCalledTimes(1);
      doc.end();
    });

    test('does not re-fire the first-page event for a second listener', () => {
      const doc = new PDFDocument();
      const first = vi.fn();
      const second = vi.fn();
      doc.on('pageAdded', first);
      doc.on('pageAdded', second);

      expect(first).toHaveBeenCalledTimes(1);
      expect(second).not.toHaveBeenCalled();

      doc.addPage();
      expect(first).toHaveBeenCalledTimes(2);
      expect(second).toHaveBeenCalledTimes(1);
      doc.end();
    });
  });
});
