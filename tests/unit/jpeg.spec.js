import fs from 'fs';
import JPEG from '../../lib/image/jpeg';

describe('JPEG', () => {
  describe('parsing', () => {
    test('parses basic JPEG properties', () => {
      const data = fs.readFileSync('tests/images/bee.jpg');
      const jpeg = new JPEG(data, 'bee');

      expect(jpeg.width).toBeGreaterThan(0);
      expect(jpeg.height).toBeGreaterThan(0);
      expect(jpeg.bits).toBe(8);
      expect(jpeg.colorSpace).toBe('DeviceRGB');
    });

    test('parses EXIF orientation', () => {
      const data1 = fs.readFileSync('tests/images/orientation-3.jpeg');
      const jpeg1 = new JPEG(data1, 'ori3');
      expect(jpeg1.orientation).toBe(3);

      const data6 = fs.readFileSync('tests/images/orientation-6.jpeg');
      const jpeg6 = new JPEG(data6, 'ori-6');
      expect(jpeg6.orientation).toBe(6);
    });

    test('defaults orientation to 1 when EXIF not present', () => {
      const data = fs.readFileSync('tests/images/bee.jpg');
      const jpeg = new JPEG(data, 'bee');
      expect(jpeg.orientation).toBe(1);
    });

    test('throws on invalid JPEG (missing SOI marker)', () => {
      const invalidData = Buffer.from([0x00, 0x00, 0x00, 0x00]);
      expect(() => new JPEG(invalidData, 'invalid')).toThrow(
        'SOI not found in JPEG',
      );
    });
  });
});
