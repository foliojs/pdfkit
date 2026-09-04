import PDFDocument from '../../lib/document';
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

  test('a PNG with a corrupted IDAT chunk throws synchronously instead of crashing later (issue #1747)', () => {
    const chunk = (type, data) => {
      const len = Buffer.alloc(4);
      len.writeUInt32BE(data.length);
      const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
      const crc = Buffer.alloc(4);
      return Buffer.concat([len, body, crc]);
    };

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(1, 0); // width
    ihdr.writeUInt32BE(1, 4); // height
    ihdr[8] = 8; // bit depth
    ihdr[9] = 6; // color type: RGBA, forces the decodePixels path

    const corruptPng = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk('IHDR', ihdr),
      chunk('IDAT', Buffer.from([0xde, 0xad, 0xbe, 0xef])), // not valid deflate data
      chunk('IEND', Buffer.alloc(0)),
    ]);

    // The bug: embed() used to hand this straight to png-js's async
    // decodePixels, which rethrows inflate errors from inside a zlib
    // callback on a later tick, so this document.image() call would crash
    // the process instead of throwing something this test could catch.
    expect(() => document.image(corruptPng, 0, 0)).toThrow();
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
