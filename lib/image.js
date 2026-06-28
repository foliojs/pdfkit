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
    } else if (ArrayBuffer.isView(src)) {
      // Typed arrays (e.g. Uint8Array) and DataView. Buffer is handled above,
      // so this covers views that are not Node Buffers, preserving byteOffset/length.
      data = Buffer.from(src.buffer, src.byteOffset, src.byteLength);
    } else {
      const match = /^data:.+?;base64,(.*)$/.exec(src);
      if (match) {
        data = Buffer.from(match[1], 'base64');
      } else {
        data = fs.readFileSync(src);
        if (!data) {
          return;
        }
      }
    }

    if (data[0] === 0xff && data[1] === 0xd8) {
      return new JPEG(data, label);
    } else if (
      data[0] === 0x89 &&
      data[1] === 0x50 &&
      data[2] === 0x4e &&
      data[3] === 0x47
    ) {
      return new PNG(data, label);
    } else {
      throw new Error('Unknown image format.');
    }
  }
}

export default PDFImage;
