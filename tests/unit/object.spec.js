import PDFObject, { escapeName } from '../../lib/object';

describe('PDFObject', () => {
  describe('convert', () => {
    test('string literal', () => {
      expect(PDFObject.convert('test')).toEqual('/test');
    });

    test('string literal with unicode', () => {
      expect(PDFObject.convert('αβγδ')).toEqual('/αβγδ');
    });

    test('String object', () => {
      expect(PDFObject.convert(new String('test'))).toEqual('(test)');
    });

    test('String object with unicode', () => {
      const result = PDFObject.convert(new String('αβγδ'));
      expect(result.length).toEqual(12);
      expect(result).toMatchInlineSnapshot(`"(þÿ±²³´)"`);
    });

    test('dictionary omits keys whose value is undefined', () => {
      expect(PDFObject.convert({ a: 1, b: undefined, c: 2 })).toEqual(
        '<<\n/a 1\n/c 2\n>>',
      );
    });

    test('dictionary keeps an explicit null', () => {
      expect(PDFObject.convert({ a: null })).toEqual('<<\n/a null\n>>');
    });

    test('array converts an undefined entry to null to keep positions', () => {
      expect(PDFObject.convert([1, undefined, 2])).toEqual('[1 null 2]');
    });
  });

  describe('escapeName', () => {
    test('should escape unsafe characters', () => {
      expect(escapeName('PANTONE 295 C')).toEqual('PANTONE#20295#20C');
    });

    test('should not escape safe characters', () => {
      expect(escapeName('PANTONE-295_C')).toEqual('PANTONE-295_C');
    });
  });
});
