import PDFDocument from '../../lib/document';
import fs from 'fs';
import JPEG from '../../lib/image/jpeg';

describe('Image', function () {
  /**
   * @type {PDFDocument}
   */
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      info: { CreationDate: new Date(Date.UTC(2018, 1, 1)) },
    });
  });

  test('y position should be updated', () => {
    const originalY = document.y;
    const imageHeight = 400;
    document.image('./tests/images/bee.png');
    expect(document.y).toBe(originalY + imageHeight);
  });

  test('accepts a Uint8Array as image source (issue #1446)', () => {
    const bytes = new Uint8Array(fs.readFileSync('./tests/images/bee.png'));
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(Buffer.isBuffer(bytes)).toBe(false);
    expect(() => document.image(bytes, 0, 0, { width: 50 })).not.toThrow();
  });

  test('accepts a Uint8Array view with a byteOffset as image source (issue #1446)', () => {
    const file = fs.readFileSync('./tests/images/bee.png');
    // Place the PNG bytes inside a larger buffer so the view has a non-zero offset.
    const backing = new Uint8Array(file.length + 8);
    backing.set(file, 8);
    const view = backing.subarray(8);
    expect(view.byteOffset).toBe(8);
    expect(() => document.image(view, 0, 0, { width: 50 })).not.toThrow();
  });

  test('parse JPEG with null byte padding in EXIF (issue #1175)', () => {
    const data = fs.readFileSync('./tests/images/issue-1175.jpeg');
    const jpeg = new JPEG(data, 'test');
    expect(jpeg.width).toBe(375);
    expect(jpeg.height).toBe(500);
    expect(jpeg.orientation).toBe(1);
  });

  test('RGB JPEG is parsed with DeviceRGB color space (regression)', () => {
    const data = fs.readFileSync('./tests/images/bee.jpg');
    const jpeg = new JPEG(data, 'test');
    expect(jpeg.colorSpace).toBe('DeviceRGB');
  });

  describe('opacity', function () {
    test('adds an ExtGState with the correct ca value', () => {
      document.image('./tests/images/bee.png', 0, 0, { opacity: 0.5 });

      const gstates = document.page.ext_gstates;
      const entry = Object.values(gstates)[0];
      expect(entry.data.ca).toBe(0.5);
    });

    test('registers the ExtGState on the page resources', () => {
      document.image('./tests/images/bee.png', 0, 0, { opacity: 0.5 });

      expect(Object.keys(document.page.ext_gstates).length).toBe(1);
    });

    test('clamps opacity below 0 to 0', () => {
      document.image('./tests/images/bee.png', 0, 0, { opacity: -0.5 });

      const entry = Object.values(document.page.ext_gstates)[0];
      expect(entry.data.ca).toBe(0);
    });

    test('clamps opacity above 1 to 1', () => {
      document.image('./tests/images/bee.png', 0, 0, { opacity: 1.5 });

      const entry = Object.values(document.page.ext_gstates)[0];
      expect(entry.data.ca).toBe(1);
    });

    test('reuses the same ExtGState for the same opacity value', () => {
      document.image('./tests/images/bee.png', 0, 0, { opacity: 0.5 });
      document.image('./tests/images/bee.png', 100, 0, { opacity: 0.5 });

      // both calls share one entry, not two
      expect(Object.keys(document.page.ext_gstates).length).toBe(1);
    });

    test('does not add an ExtGState when no opacity is specified', () => {
      document.image('./tests/images/bee.png', 0, 0);

      expect(Object.keys(document.page.ext_gstates).length).toBe(0);
    });

    test('links the ExtGState into the page resources', () => {
      document.image('./tests/images/bee.png', 0, 0, { opacity: 0.5 });
      document.end();

      const gstates = document.page.ext_gstates;
      const [name, ref] = Object.entries(gstates)[0];
      expect(name).toMatch(/^Gs\d+$/);
      expect(ref.data.ca).toBe(0.5);
    });
  });
});
