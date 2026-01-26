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

  test('parse JPEG with null byte padding in EXIF (issue #1175)', () => {
    const data = fs.readFileSync('./tests/images/issue-1175.jpeg');
    const jpeg = new JPEG(data, 'test');
    expect(jpeg.width).toBe(375);
    expect(jpeg.height).toBe(500);
    expect(jpeg.orientation).toBe(1);
  });
});
