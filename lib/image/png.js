import zlib from '#zlib';
import PNG from 'png-js';

function paeth(left, up, upLeft) {
  const p = left + up - upLeft;
  const pLeft = Math.abs(p - left);
  const pUp = Math.abs(p - up);
  const pUpLeft = Math.abs(p - upLeft);
  if (pLeft <= pUp && pLeft <= pUpLeft) {
    return left;
  }
  return pUp <= pUpLeft ? up : upLeft;
}

class PNGImage {
  constructor(data, label) {
    this.label = label;
    this.image = new PNG(data);
    this.width = this.image.width;
    this.height = this.image.height;
    this.imgData = this.image.imgData;
    this.obj = null;
  }

  embed(document) {
    let dataDecoded = false;

    this.document = document;
    if (this.obj) {
      return;
    }

    const { image, height, width } = this;

    const hasAlphaChannel = image.hasAlphaChannel;
    const isInterlaced = image.interlaceMethod === 1;

    const obj = (this.obj = document.ref({
      Type: 'XObject',
      Subtype: 'Image',
      BitsPerComponent: hasAlphaChannel ? 8 : image.bits,
      Width: width,
      Height: height,
      Filter: 'FlateDecode',
    }));

    if (!hasAlphaChannel) {
      const params = document.ref({
        Predictor: isInterlaced ? 1 : 15,
        Colors: image.colors,
        BitsPerComponent: image.bits,
        Columns: width,
      });

      obj.data['DecodeParms'] = params;
      params.end();
    }

    if (image.palette.length === 0) {
      obj.data['ColorSpace'] = image.colorSpace;
    } else {
      // embed the color palette in the PDF as an object stream
      const palette = document.ref();
      palette.end(new Uint8Array(image.palette));

      // build the color space array for the image
      obj.data['ColorSpace'] = [
        'Indexed',
        'DeviceRGB',
        image.palette.length / 3 - 1,
        palette,
      ];
    }

    // For PNG color types 0, 2 and 3, the transparency data is stored in
    // a dedicated PNG chunk.
    if (image.transparency.grayscale != null) {
      // Use Color Key Masking (spec section 4.8.5)
      // An array with N elements, where N is two times the number of color components.
      const val = image.transparency.grayscale;
      obj.data['Mask'] = [val, val];
    } else if (image.transparency.rgb) {
      // Use Color Key Masking (spec section 4.8.5)
      // An array with N elements, where N is two times the number of color components.
      const { rgb } = image.transparency;
      const mask = [];
      for (let x of rgb) {
        mask.push(x, x);
      }

      obj.data['Mask'] = mask;
    } else if (image.transparency.indexed) {
      // Create a transparency SMask for the image based on the data
      // in the PLTE and tRNS sections. See below for details on SMasks.
      return this.loadIndexedAlphaChannel();
    } else if (hasAlphaChannel) {
      // For PNG color types 4 and 6, the transparency data is stored as a alpha
      // channel mixed in with the main image data. Separate this data out into an
      // SMask object and store it separately in the PDF.
      return this.splitAlphaChannel();
    }

    if (isInterlaced && !dataDecoded) {
      return this.decodeData();
    }

    this.finalize();
  }

  finalize() {
    if (this.alphaChannel) {
      const sMask = this.document.ref({
        Type: 'XObject',
        Subtype: 'Image',
        Height: this.height,
        Width: this.width,
        BitsPerComponent: 8,
        Filter: 'FlateDecode',
        ColorSpace: 'DeviceGray',
        Decode: [0, 1],
      });

      sMask.end(this.alphaChannel);
      this.obj.data['SMask'] = sMask;
    }

    // add the actual image data
    this.obj.end(this.imgData);

    // free memory
    this.image = null;
    return (this.imgData = null);
  }

  splitAlphaChannel() {
    return this.image.decodePixels((pixels) => {
      let a, p;
      const colorCount = this.image.colors;
      const pixelCount = this.width * this.height;
      const imgData = new Uint8Array(pixelCount * colorCount);
      const alphaChannel = new Uint8Array(pixelCount);

      let i = (p = a = 0);
      const len = pixels.length;
      // For 16bit images copy only most significant byte (MSB) - PNG data is always stored in network byte order (MSB first)
      const skipByteCount = this.image.bits === 16 ? 1 : 0;
      while (i < len) {
        for (let colorIndex = 0; colorIndex < colorCount; colorIndex++) {
          imgData[p++] = pixels[i++];
          i += skipByteCount;
        }
        alphaChannel[a++] = pixels[i++];
        i += skipByteCount;
      }

      this.imgData = zlib.deflateSync(imgData);
      this.alphaChannel = zlib.deflateSync(alphaChannel);
      return this.finalize();
    });
  }

  loadIndexedAlphaChannel() {
    const transparency = this.image.transparency.indexed;
    const isInterlaced = this.image.interlaceMethod === 1;
    if (this.image.bits < 8 && !isInterlaced) {
      const indices = this.decodePackedIndices();
      const alphaChannel = new Uint8Array(indices.length);
      for (let i = 0; i < indices.length; i++) {
        alphaChannel[i] = transparency[indices[i]];
      }
      this.alphaChannel = zlib.deflateSync(alphaChannel);
      return this.finalize();
    }
    return this.image.decodePixels((pixels) => {
      const alphaChannel = new Uint8Array(this.width * this.height);

      let i = 0;
      for (let j = 0, end = pixels.length; j < end; j++) {
        alphaChannel[i++] = transparency[pixels[j]];
      }

      // For interlaced images, re-encode the decoded pixel data
      if (isInterlaced) {
        this.imgData = zlib.deflateSync(pixels);
      }

      this.alphaChannel = zlib.deflateSync(alphaChannel);
      return this.finalize();
    });
  }

  // Palette indices of fewer than 8 bits are packed into bytes, which png-js
  // leaves as they are, and it unfilters their rows in steps of less than a
  // byte. PNG filters such rows a byte at a time, so unfilter and unpack the
  // indices here.
  decodePackedIndices() {
    const { width, height } = this;
    const { bits } = this.image;
    const rowLength = Math.ceil((width * bits) / 8);
    const data = zlib.inflateSync(new Uint8Array(this.imgData));
    const indices = new Uint8Array(width * height);
    let previous = new Uint8Array(rowLength);
    let row = new Uint8Array(rowLength);
    let pos = 0;
    for (let y = 0; y < height; y++) {
      const filter = data[pos++];
      for (let x = 0; x < rowLength; x++) {
        const left = x > 0 ? row[x - 1] : 0;
        const up = previous[x];
        const upLeft = x > 0 ? previous[x - 1] : 0;
        let predictor = 0;
        if (filter === 1) {
          predictor = left;
        } else if (filter === 2) {
          predictor = up;
        } else if (filter === 3) {
          predictor = (left + up) >> 1;
        } else if (filter === 4) {
          predictor = paeth(left, up, upLeft);
        }
        row[x] = (data[pos++] + predictor) & 0xff;
      }
      for (let x = 0; x < width; x++) {
        const bit = x * bits;
        indices[y * width + x] =
          (row[bit >> 3] >> (8 - bits - (bit & 7))) & ((1 << bits) - 1);
      }
      [previous, row] = [row, previous];
    }
    return indices;
  }

  decodeData() {
    this.image.decodePixels((pixels) => {
      this.imgData = zlib.deflateSync(pixels);
      this.finalize();
    });
  }
}

export default PNGImage;
