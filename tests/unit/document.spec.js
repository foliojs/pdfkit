import PDFDocument from '../../lib/document';

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
});
