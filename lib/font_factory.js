import fs from '#fs';
import { create } from 'fontkit';
import StandardFont from './font/standard';
import EmbeddedFont from './font/embedded';
import { getStandardFont, isStandardFont } from './font/standard_fonts';

class PDFFontFactory {
  static open(document, src, family, id) {
    let font;
    if (typeof src === 'string') {
      if (isStandardFont(src)) {
        return new StandardFont(document, getStandardFont(src), id);
      }

      src = fs.readFileSync(src);
    }
    if (src instanceof Uint8Array) {
      font = create(src, family);
    } else if (src instanceof ArrayBuffer) {
      font = create(new Uint8Array(src), family);
    }

    if (font == null) {
      throw new Error('Not a supported font format or standard PDF font.');
    }

    return new EmbeddedFont(document, font, id);
  }
}

export default PDFFontFactory;
