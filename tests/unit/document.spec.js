import PDFDocument from '../../lib/document';
import { logData } from './helpers';

describe('PDFDocument', () => {
  describe('font option', () => {
    let fontSpy;

    beforeEach(() => {
      fontSpy = jest.spyOn(PDFDocument.prototype, 'font').mockReturnThis();
    });

    afterEach(() => {
      fontSpy.mockRestore();
    });

    test('not defined', () => {
      new PDFDocument();

      expect(fontSpy).toBeCalledWith('Helvetica');
    });

    test('a string value', () => {
      new PDFDocument({ font: 'Roboto' });

      expect(fontSpy).toBeCalledWith('Roboto');
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
        new TypeError("Cannot read property 'toString' of undefined")
      );
    });

    test('accepts properties with value null', () => {
      expect(() => new PDFDocument({ info: { Title: null } })).not.toThrow(
        new TypeError("Cannot read property 'toString' of null")
      );
    });
  });

  test('metadata is present for PDF 1.4', () => {
    let doc = new PDFDocument({pdfVersion: '1.4'});
    const data = logData(doc);
    doc.end();

    let catalog = data[data.length-28];

    expect(catalog).toContain('/Metadata');
  });

  test('metadata is NOT present for PDF 1.3', () => {
    let doc = new PDFDocument({pdfVersion: '1.3'});
    const data = logData(doc);
    doc.end();

    let catalog = data[data.length-27];

    expect(catalog).not.toContain('/Metadata');
  });

});
