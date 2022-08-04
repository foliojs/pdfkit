import PDFFontFactory from '../font_factory';

export default {
  initFonts(defaultFont = 'Helvetica') {
    // Lookup table for embedded fonts
    this._fontFamilies = {};
    this._fontCount = 0;

    // Font state
    this._fontSize = 12;
    this._font = null;

    this._registeredFonts = {};

    // Set the default font
    if (defaultFont) {
      this.font(defaultFont);
    }
  },

  font(src, family, size) {
    let name, font;
    if (typeof family === 'number') {
      size = family;
      family = null;
    }

    // check registered fonts if src is a string
    if (typeof src === 'string' && this._registeredFonts[src]) {
      name = src;
      ({ src, family } = this._registeredFonts[src]);
    } else {
      name = family || src;
      if (typeof name !== 'string') {
        name = null;
      }
    }

    if (size != null) {
      this.fontSize(size);
    }

    // fast path: check if the font is already in the PDF
    if ((font = this._fontFamilies[name])) {
      this._font = font;
      return this;
    }

    // load the font
    const id = `F${++this._fontCount}`;
    this._font = PDFFontFactory.open(this, src, family, id);

    // get the font name from the loaded font object (usually TTF metadata)
    // useful if the font was passed as a buffer
    if (!name) {
      name = this._font.name || id;
    }

    // check for existing font familes with the same name already in the PDF
    // useful if the font was passed as a buffer
    if ((font = this._fontFamilies[name])) {
      this._font = font;
      return this;
    }

    // save the font for reuse later and for finalization in doc.end()
    this._fontFamilies[name] = this._font;

    return this;
  },

  fontSize(_fontSize) {
    this._fontSize = _fontSize;
    return this;
  },

  currentLineHeight(includeGap) {
    if (includeGap == null) {
      includeGap = false;
    }
    return this._font.lineHeight(this._fontSize, includeGap);
  },

  registerFont(name, src, family) {
    this._registeredFonts[name] = {
      src,
      family
    };

    return this;
  }
};
