/*
PDFImage - embeds images in PDF documents
By Devon Govett
*/

import fs from 'fs';
import JPEG from './image/jpeg';
import PNG from './image/png';

class PDFImage {
  static open(src, label) {
    let data;
    if (Buffer.isBuffer(src)) {
      data = src;
    } else if (src instanceof ArrayBuffer) {
      data = Buffer.from(new Uint8Array(src));
    } else {
      const split = src.split(',');
      if (split[0].startsWith('data:') && split[0].endsWith(';base64,')) {
        if (split.length === 1) {
          throw Error('Empty base64');
        }
        data = Buffer.from(split[1], 'base64');
      } else {
        data = fs.readFileSync(src);
        if (!data) {
          return;
        }
      }
    }

    if (data[0] === 0xff && data[1] === 0xd8) {
      return new JPEG(data, label);
    } else if (data[0] === 0x89 && data.toString('ascii', 1, 4) === 'PNG') {
      return new PNG(data, label);
    } else {
      throw new Error('Unknown image format.');
    }
  }
}

export default PDFImage;
