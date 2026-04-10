import PDFObject from '../../lib/object';

describe('PDFObject', () => {
  describe('convert', () => {
    test('string literal', () => {
      expect(PDFObject.convert('test')).toEqual('/test');
    });

    test('string literal with unicode', () => {
      expect(PDFObject.convert('αβγδ')).toEqual('/αβγδ');
    });

    test('string literal with spaces should escape', () => {
      expect(PDFObject.convert('PANTONE 295 C')).toEqual('/PANTONE#20295#20C');
    });

    test('String object', () => {
      expect(PDFObject.convert(new String('test'))).toEqual('(test)');
    });

    test('String object with spaces should not escape', () => {
      // Objects are not used to represent PDF object names directly, so they should not be escaped
      expect(PDFObject.convert(new String('test with spaces'))).toEqual(
        '(test with spaces)',
      );
    });

    test('String object with unicode', () => {
      const result = PDFObject.convert(new String('αβγδ'));
      expect(result.length).toEqual(12);
      expect(result).toMatchInlineSnapshot(`"(þÿ±²³´)"`);
    });
  });
});
