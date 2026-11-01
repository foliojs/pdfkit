import PDFDocument from '../../lib/document';
import { vi } from 'vitest';
import fs from 'fs';
import JPEG from '../../lib/image/jpeg';
import PDFImage from '../../lib/image';
import dataURIs from '../images/bee';

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

  test('parse JPEG with null byte padding in EXIF (issue #1175)', () => {
    const data = fs.readFileSync('./tests/images/issue-1175.jpeg');
    const jpeg = new JPEG(data, 'test');
    expect(jpeg.width).toBe(375);
    expect(jpeg.height).toBe(500);
    expect(jpeg.orientation).toBe(1);
  });

  test.each(['png', 'jpeg'])('%s base64 data URI is decoded', (format) => {
    const image = PDFImage.open(dataURIs[format], 'test');
    expect(image.width).toBe(409);
    expect(image.height).toBe(400);
  });

  test('RGB JPEG is parsed with DeviceRGB color space (regression)', () => {
    const data = fs.readFileSync('./tests/images/bee.jpg');
    const jpeg = new JPEG(data, 'test');
    expect(jpeg.colorSpace).toBe('DeviceRGB');
  });

  describe('flipH and flipV - #1309', function () {
    const transforms = (options) => {
      const transform = vi.spyOn(document, 'transform');
      document.image('./tests/images/bee.png', 10, 20, {
        width: 409,
        height: 400,
        ...options,
      });
      return transform.mock.calls;
    };
    const place = [409, 0, 0, -400, 10, 420];

    test('places the image without a flip by default', function () {
      expect(transforms({})).toEqual([place]);
    });

    test('flipH mirrors around the middle of the image', function () {
      expect(transforms({ flipH: true })).toEqual([
        [-1, 0, 0, 1, 2 * 10 + 409, 0],
        place,
      ]);
    });

    test('flipV mirrors around the middle of the image', function () {
      expect(transforms({ flipV: true })).toEqual([
        [1, 0, 0, -1, 0, 2 * 20 + 400],
        place,
      ]);
    });

    test('flipH and flipV can be combined', function () {
      expect(transforms({ flipH: true, flipV: true })).toEqual([
        [-1, 0, 0, 1, 2 * 10 + 409, 0],
        [1, 0, 0, -1, 0, 2 * 20 + 400],
        place,
      ]);
    });

    test('does not move the document flow', function () {
      const originalY = document.y;
      document.image('./tests/images/bee.png', { flipV: true });
      expect(document.y).toBe(originalY + 400);
    });
  });

  describe('scaleDown - #1347', function () {
    const drawnSize = (options) => {
      const transform = vi.spyOn(document, 'transform');
      document.image('./tests/images/bee.png', 10, 20, options);
      const [w, , , h, x, y] = transform.mock.calls[0];
      return { w, h: -h, x, y: y + h };
    };

    test('fit enlarges the same smaller image', function () {
      const { w, h } = drawnSize({ fit: [818, 800] });
      expect(w).toBeCloseTo(818);
      expect(h).toBeCloseTo(800);
    });

    test('keeps a smaller image at its own size', function () {
      expect(drawnSize({ scaleDown: [818, 800] })).toEqual({
        w: 409,
        h: 400,
        x: 10,
        y: 20,
      });
    });

    test('still scales down an image larger than the rectangle', function () {
      const { w, h } = drawnSize({ scaleDown: [100, 1000] });
      expect(w).toBeCloseTo(100);
      expect(h).toBeCloseTo((100 * 400) / 409);
    });

    test('aligns the unscaled image within the rectangle', function () {
      const { x, y } = drawnSize({
        scaleDown: [809, 800],
        align: 'center',
        valign: 'bottom',
      });
      expect(x).toBeCloseTo(10 + (809 - 409) / 2);
      expect(y).toBeCloseTo(20 + 800 - 400);
    });

    test('fit wins when both are passed', function () {
      const { w, h } = drawnSize({ fit: [818, 800], scaleDown: [818, 800] });
      expect(w).toBeCloseTo(818);
      expect(h).toBeCloseTo(800);
    });
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
