// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import fontkit from 'fontkit';
import StandardFont from './font/standard';
import EmbeddedFont from './font/embedded';

class PDFFontFactory {
  static open(document, src, family, id) {
    let font;
    if (typeof src === 'string') {
      if (StandardFont.isStandardFont(src)) {
        return new StandardFont(document, src, id);
      }
        
      font = fontkit.openSync(src, family);
                
    } else if (Buffer.isBuffer(src)) {
      font = fontkit.create(src, family);
      
    } else if (src instanceof Uint8Array) {
      font = fontkit.create(new Buffer(src), family);
      
    } else if (src instanceof ArrayBuffer) {
      font = fontkit.create(new Buffer(new Uint8Array(src)), family);
    }
      
    if ((font == null)) {
      throw new Error('Not a supported font format or standard PDF font.');
    }
      
    return new EmbeddedFont(document, font, id);
  }
}

      
export default PDFFontFactory;