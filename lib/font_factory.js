import fs from 'fs';
import * as fontkit from 'fontkit';
import StandardFont from './font/standard';
import EmbeddedFont from './font/embedded';

class PDFFontFactory {
  static open(document, src, family, id) {
    let font;
    if (typeof src === 'string') {
      if (StandardFont.isStandardFont(src)) {
        return new StandardFont(document, src, id);
      }

      src = fs.readFileSync(src);
    }
    if (src instanceof Uint8Array) {
      font = fontkit.create(src, family);
    } else if (src instanceof ArrayBuffer) {
      font = fontkit.create(new Uint8Array(src), family);
    }

    if (font == null) {
      throw new Error('Not a supported font format or standard PDF font.');
    }

    return new EmbeddedFont(document, font, id);
  }

  /**
   * Open an emoji font (SBIX/COLR) for bitmap or vector emoji rendering.
   * Returns the raw fontkit font object — not an EmbeddedFont, since emoji
   * glyphs are rendered as image XObjects rather than CIDFont text.
   *
   * @param {string|Uint8Array|ArrayBuffer} src - Path or buffer
   * @param {string} [family] - Font name within a TTC collection
   * @returns {object} fontkit font object
   */
  static openEmoji(src, family) {
    if (typeof src === 'string') {
      src = fs.readFileSync(src);
    }
    let font;
    // Do NOT pass family to fontkit.create — for TTCs it calls getVariation()
    // which fails on emoji fonts that lack fvar/gvar tables.
    if (src instanceof Uint8Array) {
      font = fontkit.create(src);
    } else if (src instanceof ArrayBuffer) {
      font = fontkit.create(new Uint8Array(src));
    }

    if (font == null) {
      throw new Error('Not a supported emoji font format.');
    }

    // If fontkit returned a TrueTypeCollection, find the right font
    if (typeof font.fonts !== 'undefined' && Array.isArray(font.fonts)) {
      if (!family) {
        font = font.fonts[0];
      } else {
        // Match by postscriptName or familyName
        const match = font.fonts.find(
          (f) => f.postscriptName === family || f.familyName === family,
        );
        font = match || font.fonts[0];
      }
    }

    if (font == null) {
      throw new Error(
        `Could not find font "${family}" in the emoji font collection.`,
      );
    }

    return font;
  }
}

export default PDFFontFactory;
