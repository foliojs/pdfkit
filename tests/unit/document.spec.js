import PDFDocument from '../../lib/document';
import fs from 'fs';
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

  describe('FontsMixin', () => {
    let roboto;

    beforeAll(() => {
      roboto = fs.readFileSync('tests/fonts/Roboto-Regular.ttf');
    });

    describe('font', () => {
      test('saves a default font to _fontFamilies and reuses the same font object', () => {
        const doc = new PDFDocument();

        doc.font('Times-Italic');
        const fontObj1 = doc._fontFamilies['Times-Italic'];

        doc.font('Times-Italic');
        const fontObj2 = doc._fontFamilies['Times-Italic'];

        expect(Object.keys(doc._fontFamilies)).toEqual([
          'Helvetica',
          'Times-Italic'
        ]);
        expect(fontObj1).toBe(fontObj2);
      });

      test('saves a registered font to _fontFamilies and reuses the same font object', () => {
        const doc = new PDFDocument();

        doc.registerFont('My Roboto', roboto);
        doc.font('My Roboto');
        const fontObj1 = doc._fontFamilies['My Roboto'];

        doc.font('My Roboto');
        const fontObj2 = doc._fontFamilies['My Roboto'];

        expect(Object.keys(doc._fontFamilies)).toEqual([
          'Helvetica',
          'My Roboto'
        ]);
        expect(fontObj1).toBe(fontObj2);
      });

      test('saves a font passed as a buffer to _fontFamilies and reuses the same font object', () => {
        const doc = new PDFDocument();

        doc.font(roboto);
        const fontObj1 = doc._fontFamilies['Roboto-Regular'];

        doc.font(roboto);
        const fontObj2 = doc._fontFamilies['Roboto-Regular'];

        expect(Object.keys(doc._fontFamilies)).toEqual([
          'Helvetica',
          'Roboto-Regular'
        ]);
        expect(fontObj1).toBe(fontObj2);
      });
    });
  });
});
