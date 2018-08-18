/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import fs from 'fs';

var JPEG = (function() {
  let MARKERS = undefined;
  JPEG = class JPEG {
    static initClass() {
      MARKERS = [0xFFC0, 0xFFC1, 0xFFC2, 0xFFC3, 0xFFC5, 0xFFC6, 0xFFC7,
                 0xFFC8, 0xFFC9, 0xFFCA, 0xFFCB, 0xFFCC, 0xFFCD, 0xFFCE, 0xFFCF];
    }

    constructor(data, label) {
      let marker;
      this.data = data;
      this.label = label;
      if (this.data.readUInt16BE(0) !== 0xFFD8) {
        throw "SOI not found in JPEG";
      }
           
      let pos = 2;
      while (pos < this.data.length) {
        marker = this.data.readUInt16BE(pos);
        pos += 2;
        if (Array.from(MARKERS).includes(marker)) { break; }
        pos += this.data.readUInt16BE(pos);
      }

      if (!Array.from(MARKERS).includes(marker)) { throw "Invalid JPEG."; }
      pos += 2;

      this.bits = this.data[pos++];
      this.height = this.data.readUInt16BE(pos);
      pos += 2;

      this.width = this.data.readUInt16BE(pos);
      pos += 2;

      const channels = this.data[pos++];
      this.colorSpace = (() => { switch (channels) {
        case 1: return 'DeviceGray';
        case 3: return 'DeviceRGB';
        case 4: return 'DeviceCMYK';
      } })();
      
      this.obj = null;
    }
      
    embed(document) {
      if (this.obj) { return; }
    
      this.obj = document.ref({
        Type: 'XObject',
        Subtype: 'Image',
        BitsPerComponent: this.bits,
        Width: this.width,
        Height: this.height,
        ColorSpace: this.colorSpace,
        Filter: 'DCTDecode'
      });
      
      // add extra decode params for CMYK images. By swapping the
      // min and max values from the default, we invert the colors. See
      // section 4.8.4 of the spec.  
      if (this.colorSpace === 'DeviceCMYK') {
        this.obj.data['Decode'] = [1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0];
      }
      
      this.obj.end(this.data);
    
      // free memory
      return this.data = null;
    }
  };
  JPEG.initClass();
  return JPEG;
})();
    
export default JPEG;
