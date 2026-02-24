import LineWrapper from '../line_wrapper';
import PDFObject from '../object';
import PDFImage from '../image';
import { cosine, sine } from '../utils';

const { number } = PDFObject;

/**
 * Format a list label based on the list type
 * @param {number} n
 * @param {'numbered' | 'lettered'} listType
 * @returns {string}
 */
function formatListLabel(n, listType) {
  if (listType === 'numbered') {
    return `${n}.`;
  }

  // lettered
  var letter = String.fromCharCode(((n - 1) % 26) + 65);
  var times = Math.floor((n - 1) / 26 + 1);
  var text = Array(times + 1).join(letter);
  return `${text}.`;
}

export default {
  initText() {
    this._line = this._line.bind(this);
    // Current coordinates
    this.x = 0;
    this.y = 0;
    this._lineGap = 0;
  },

  lineGap(_lineGap) {
    this._lineGap = _lineGap;
    return this;
  },

  moveDown(lines) {
    if (lines == null) {
      lines = 1;
    }
    this.y += this.currentLineHeight(true) * lines + this._lineGap;
    return this;
  },

  moveUp(lines) {
    if (lines == null) {
      lines = 1;
    }
    this.y -= this.currentLineHeight(true) * lines + this._lineGap;
    return this;
  },

  _text(text, x, y, options, lineCallback) {
    options = this._initOptions(x, y, options);

    // Convert text to a string
    text = text == null ? '' : `${text}`;

    // if the wordSpacing option is specified, remove multiple consecutive spaces
    if (options.wordSpacing) {
      text = text.replace(/\s{2,}/g, ' ');
    }

    const addStructure = () => {
      if (options.structParent) {
        options.structParent.add(
          this.struct(options.structType || 'P', [
            this.markStructureContent(options.structType || 'P'),
          ]),
        );
      }
    };

    // We can save some bytes if there is no rotation
    if (options.rotation !== 0) {
      this.save();
      this.rotate(-options.rotation, { origin: [this.x, this.y] });
    }

    // word wrapping
    if (options.width) {
      let wrapper = this._wrapper;
      if (!wrapper) {
        wrapper = new LineWrapper(this, options);
        wrapper.on('line', lineCallback);
        wrapper.on('firstLine', addStructure);
      }

      this._wrapper = options.continued ? wrapper : null;
      this._textOptions = options.continued ? options : null;
      wrapper.wrap(text, options);

      // render paragraphs as single lines
    } else {
      for (let line of text.split('\n')) {
        addStructure();
        lineCallback(line, options);
      }
    }

    // Cleanup if there was a rotation
    if (options.rotation !== 0) this.restore();

    return this;
  },

  text(text, x, y, options) {
    return this._text(text, x, y, options, this._line);
  },

  widthOfString(string, options = {}) {
    const horizontalScaling = options.horizontalScaling || 100;

    // If we have an emoji font, check for emoji segments
    const segments = this._segmentEmojiText(string);
    if (segments) {
      let totalWidth = 0;
      for (const seg of segments) {
        if (seg.type === 'emoji') {
          totalWidth += this._emojiWidthOfString(seg.text, this._fontSize);
        } else {
          totalWidth +=
            this._font.widthOfString(seg.text, this._fontSize, options.features) +
            (options.characterSpacing || 0) * (seg.text.length - 1);
        }
      }
      return (totalWidth * horizontalScaling) / 100;
    }

    return (
      ((this._font.widthOfString(string, this._fontSize, options.features) +
        (options.characterSpacing || 0) * (string.length - 1)) *
        horizontalScaling) /
      100
    );
  },

  /**
   * Compute the bounding box of a string
   * based on what will actually be rendered by `doc.text()`
   *
   * @param string - The string
   * @param x - X position of text (defaults to this.x)
   * @param y - Y position of text (defaults to this.y)
   * @param options - Any text options (The same you would apply to `doc.text()`)
   * @returns {{x: number, y: number, width: number, height: number}}
   */
  boundsOfString(string, x, y, options) {
    options = this._initOptions(x, y, options);
    ({ x, y } = this);
    const lineGap = options.lineGap ?? this._lineGap ?? 0;
    const lineHeight = this.currentLineHeight(true) + lineGap;
    let contentWidth = 0;
    // Convert text to a string
    string = String(string ?? '');

    // if the wordSpacing option is specified, remove multiple consecutive spaces
    if (options.wordSpacing) {
      string = string.replace(/\s{2,}/g, ' ');
    }

    // word wrapping
    if (options.width) {
      let wrapper = new LineWrapper(this, options);
      wrapper.on('line', (text, options) => {
        this.y += lineHeight;
        text = text.replace(/\n/g, '');

        if (text.length) {
          // handle options
          let wordSpacing = options.wordSpacing ?? 0;
          const characterSpacing = options.characterSpacing ?? 0;

          // justify alignments
          if (options.width && options.align === 'justify') {
            // calculate the word spacing value
            const words = text.trim().split(/\s+/);
            const textWidth = this.widthOfString(
              text.replace(/\s+/g, ''),
              options,
            );
            const spaceWidth = this.widthOfString(' ') + characterSpacing;
            wordSpacing = Math.max(
              0,
              (options.lineWidth - textWidth) / Math.max(1, words.length - 1) -
                spaceWidth,
            );
          }

          // calculate the actual rendered width of the string after word and character spacing
          contentWidth = Math.max(
            contentWidth,
            options.textWidth +
              wordSpacing * (options.wordCount - 1) +
              characterSpacing * (text.length - 1),
          );
        }
      });
      wrapper.wrap(string, options);
    } else {
      // render paragraphs as single lines
      for (let line of string.split('\n')) {
        const lineWidth = this.widthOfString(line, options);
        this.y += lineHeight;
        contentWidth = Math.max(contentWidth, lineWidth);
      }
    }

    let contentHeight = this.y - y;
    // Clamp height to max height
    if (options.height) contentHeight = Math.min(contentHeight, options.height);

    this.x = x;
    this.y = y;

    /**
     * Rotates around top left corner
     * [x1,y1]  >  [x2,y2]
     *    ⌃           ⌄
     * [x4,y4]  <  [x3,y3]
     */
    if (options.rotation === 0) {
      // No rotation so we can use the existing values
      return { x, y, width: contentWidth, height: contentHeight };
      // Use fast computation without explicit trig
    } else if (options.rotation === 90) {
      return {
        x: x,
        y: y - contentWidth,
        width: contentHeight,
        height: contentWidth,
      };
    } else if (options.rotation === 180) {
      return {
        x: x - contentWidth,
        y: y - contentHeight,
        width: contentWidth,
        height: contentHeight,
      };
    } else if (options.rotation === 270) {
      return {
        x: x - contentHeight,
        y: y,
        width: contentHeight,
        height: contentWidth,
      };
    }

    // Non-trivial values so time for trig
    const cos = cosine(options.rotation);
    const sin = sine(options.rotation);

    const x1 = x;
    const y1 = y;
    const x2 = x + contentWidth * cos;
    const y2 = y - contentWidth * sin;
    const x3 = x + contentWidth * cos + contentHeight * sin;
    const y3 = y - contentWidth * sin + contentHeight * cos;
    const x4 = x + contentHeight * sin;
    const y4 = y + contentHeight * cos;

    const xMin = Math.min(x1, x2, x3, x4);
    const xMax = Math.max(x1, x2, x3, x4);
    const yMin = Math.min(y1, y2, y3, y4);
    const yMax = Math.max(y1, y2, y3, y4);

    return { x: xMin, y: yMin, width: xMax - xMin, height: yMax - yMin };
  },

  heightOfString(text, options) {
    const { x, y } = this;

    options = this._initOptions(options);
    options.height = Infinity; // don't break pages

    const lineGap = options.lineGap || this._lineGap || 0;
    this._text(text, this.x, this.y, options, () => {
      this.y += this.currentLineHeight(true) + lineGap;
    });

    const height = this.y - y;
    this.x = x;
    this.y = y;

    return height;
  },

  list(list, x, y, options) {
    options = this._initOptions(x, y, options);

    const listType = options.listType || 'bullet';
    const unit = Math.round((this._font.ascender / 1000) * this._fontSize);
    const midLine = unit / 2;
    const r = options.bulletRadius || unit / 3;
    const indent =
      options.textIndent || (listType === 'bullet' ? r * 5 : unit * 2);
    const itemIndent =
      options.bulletIndent || (listType === 'bullet' ? r * 8 : unit * 2);

    let level = 1;
    const items = [];
    const levels = [];
    const numbers = [];

    var flatten = function (list) {
      let n = 1;
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (Array.isArray(item)) {
          level++;
          flatten(item);
          level--;
        } else {
          items.push(item);
          levels.push(level);
          if (listType !== 'bullet') {
            numbers.push(n++);
          }
        }
      }
    };

    flatten(list);

    const drawListItem = function (listItem, i) {
      const wrapper = new LineWrapper(this, options);
      wrapper.on('line', this._line);

      level = 1;
      wrapper.once('firstLine', () => {
        let item, itemType, labelType, bodyType;
        if (options.structParent) {
          if (options.structTypes) {
            [itemType, labelType, bodyType] = options.structTypes;
          } else {
            [itemType, labelType, bodyType] = ['LI', 'Lbl', 'LBody'];
          }
        }

        if (itemType) {
          item = this.struct(itemType);
          options.structParent.add(item);
        } else if (options.structParent) {
          item = options.structParent;
        }

        let l;
        if ((l = levels[i++]) !== level) {
          const diff = itemIndent * (l - level);
          this.x += diff;
          wrapper.lineWidth -= diff;
          level = l;
        }

        if (item && (labelType || bodyType)) {
          item.add(
            this.struct(labelType || bodyType, [
              this.markStructureContent(labelType || bodyType),
            ]),
          );
        }
        switch (listType) {
          case 'bullet':
            this.circle(this.x - indent + r, this.y + midLine, r);
            this.fill();
            break;
          case 'numbered':
          case 'lettered':
            var text = formatListLabel(numbers[i - 1], listType);
            this._fragment(text, this.x - indent, this.y, options);
            break;
        }

        if (item && labelType && bodyType) {
          item.add(
            this.struct(bodyType, [this.markStructureContent(bodyType)]),
          );
        }
        if (item && item !== options.structParent) {
          item.end();
        }
      });

      wrapper.on('sectionStart', () => {
        const pos = indent + itemIndent * (level - 1);
        this.x += pos;
        wrapper.lineWidth -= pos;
      });

      wrapper.on('sectionEnd', () => {
        const pos = indent + itemIndent * (level - 1);
        this.x -= pos;
        wrapper.lineWidth += pos;
      });

      wrapper.wrap(listItem, options);
    };

    for (let i = 0; i < items.length; i++) {
      drawListItem.call(this, items[i], i);
    }

    return this;
  },

  _initOptions(x = {}, y, options = {}) {
    if (typeof x === 'object') {
      options = x;
      x = null;
    }

    // clone options object
    const result = Object.assign({}, options);

    // extend options with previous values for continued text
    if (this._textOptions) {
      for (let key in this._textOptions) {
        const val = this._textOptions[key];
        if (key !== 'continued') {
          if (result[key] === undefined) {
            result[key] = val;
          }
        }
      }
    }

    // Update the current position
    if (x != null) {
      this.x = x;
    }
    if (y != null) {
      this.y = y;
    }

    // wrap to margins if no x or y position passed
    if (result.lineBreak !== false) {
      if (result.width == null) {
        result.width = this.page.width - this.x - this.page.margins.right;
      }
      result.width = Math.max(result.width, 0);
    }

    if (!result.columns) {
      result.columns = 0;
    }
    if (result.columnGap == null) {
      result.columnGap = 18;
    } // 1/4 inch

    // Normalize rotation to between 0 - 360
    result.rotation = Number(options.rotation ?? 0) % 360;
    if (result.rotation < 0) result.rotation += 360;

    return result;
  },

  _line(text, options = {}, wrapper) {
    const segments = this._segmentEmojiText(text);

    if (segments) {
      // Mixed text/emoji line — render each segment sequentially
      let curX = this.x;
      const curY = this.y;

      for (const seg of segments) {
        if (seg.type === 'emoji') {
          this._emojiFragment(seg.text, curX, curY, options);
          curX += this._emojiWidthOfString(seg.text, this._fontSize);
        } else {
          // Build sub-options with correct textWidth/wordCount for this sub-fragment
          const subOpts = Object.assign({}, options, {
            textWidth: this._font.widthOfString(
              seg.text,
              this._fontSize,
              options.features,
            ),
            wordCount: seg.text.trim().split(/\s+/).length,
            // Disable alignment for sub-fragments — alignment was already
            // applied at the line level by the LineWrapper
            width: undefined,
          });
          this._fragment(seg.text, curX, curY, subOpts);
          curX += this.widthOfString(seg.text, options);
        }
      }

      if (wrapper) {
        const lineGap = options.lineGap || this._lineGap || 0;
        this.y += this.currentLineHeight(true) + lineGap;
      } else {
        this.x = curX;
      }
    } else {
      // No emoji — original path
      this._fragment(text, this.x, this.y, options);

      if (wrapper) {
        const lineGap = options.lineGap || this._lineGap || 0;
        this.y += this.currentLineHeight(true) + lineGap;
      } else {
        this.x += this.widthOfString(text, options);
      }
    }
  },

  _fragment(text, x, y, options) {
    let dy, encoded, i, positions, textWidth, words;
    text = `${text}`.replace(/\n/g, '');
    if (text.length === 0) {
      return;
    }

    // handle options
    const align = options.align || 'left';
    let wordSpacing = options.wordSpacing || 0;
    const characterSpacing = options.characterSpacing || 0;
    const horizontalScaling = options.horizontalScaling || 100;

    // text alignments
    if (options.width) {
      switch (align) {
        case 'right':
          textWidth = this.widthOfString(text.replace(/\s+$/, ''), options);
          x += options.lineWidth - textWidth;
          break;

        case 'center':
          x += options.lineWidth / 2 - options.textWidth / 2;
          break;

        case 'justify':
          // calculate the word spacing value
          words = text.trim().split(/\s+/);
          textWidth = this.widthOfString(text.replace(/\s+/g, ''), options);
          var spaceWidth = this.widthOfString(' ') + characterSpacing;
          wordSpacing = Math.max(
            0,
            (options.lineWidth - textWidth) / Math.max(1, words.length - 1) -
              spaceWidth,
          );
          break;
      }
    }

    // text baseline alignments based on http://wiki.apache.org/xmlgraphics-fop/LineLayout/AlignmentHandling
    if (typeof options.baseline === 'number') {
      dy = -options.baseline;
    } else {
      switch (options.baseline) {
        case 'svg-middle':
          dy = 0.5 * this._font.xHeight;
          break;
        case 'middle':
        case 'svg-central':
          dy = 0.5 * (this._font.descender + this._font.ascender);
          break;
        case 'bottom':
        case 'ideographic':
          dy = this._font.descender;
          break;
        case 'alphabetic':
          dy = 0;
          break;
        case 'mathematical':
          dy = 0.5 * this._font.ascender;
          break;
        case 'hanging':
          dy = 0.8 * this._font.ascender;
          break;
        case 'top':
          dy = this._font.ascender;
          break;
        default:
          dy = this._font.ascender;
      }
      dy = (dy / 1000) * this._fontSize;
    }

    // calculate the actual rendered width of the string after word and character spacing
    const renderedWidth =
      options.textWidth +
      wordSpacing * (options.wordCount - 1) +
      characterSpacing * (text.length - 1);

    // create link annotations if the link option is given
    if (options.link != null) {
      const linkOptions = {};
      if (
        this._currentStructureElement &&
        this._currentStructureElement.dictionary.data.S === 'Link'
      ) {
        linkOptions.structParent = this._currentStructureElement;
      }
      this.link(
        x,
        y,
        renderedWidth,
        this.currentLineHeight(),
        options.link,
        linkOptions,
      );
    }
    if (options.goTo != null) {
      this.goTo(x, y, renderedWidth, this.currentLineHeight(), options.goTo);
    }
    if (options.destination != null) {
      this.addNamedDestination(options.destination, 'XYZ', x, y, null);
    }

    // create underline
    if (options.underline) {
      this.save();
      if (!options.stroke) {
        this.strokeColor(...(this._fillColor || []));
      }

      const lineWidth =
        this._fontSize < 10 ? 0.5 : Math.floor(this._fontSize / 10);
      this.lineWidth(lineWidth);

      let lineY = y + this.currentLineHeight() - lineWidth;
      this.moveTo(x, lineY);
      this.lineTo(x + renderedWidth, lineY);
      this.stroke();
      this.restore();
    }

    // create strikethrough line
    if (options.strike) {
      this.save();
      if (!options.stroke) {
        this.strokeColor(...(this._fillColor || []));
      }

      const lineWidth =
        this._fontSize < 10 ? 0.5 : Math.floor(this._fontSize / 10);
      this.lineWidth(lineWidth);

      let lineY = y + this.currentLineHeight() / 2;
      this.moveTo(x, lineY);
      this.lineTo(x + renderedWidth, lineY);
      this.stroke();
      this.restore();
    }

    this.save();

    // oblique (angle in degrees or boolean)
    if (options.oblique) {
      let skew;
      if (typeof options.oblique === 'number') {
        skew = -Math.tan((options.oblique * Math.PI) / 180);
      } else {
        skew = -0.25;
      }
      this.transform(1, 0, 0, 1, x, y);
      this.transform(1, 0, skew, 1, -skew * dy, 0);
      this.transform(1, 0, 0, 1, -x, -y);
    }

    // flip coordinate system
    this.transform(1, 0, 0, -1, 0, this.page.height);
    y = this.page.height - y - dy;

    // add current font to page if necessary
    if (this.page.fonts[this._font.id] == null) {
      this.page.fonts[this._font.id] = this._font.ref();
    }

    // begin the text object
    this.addContent('BT');

    // text position
    this.addContent(`1 0 0 1 ${number(x)} ${number(y)} Tm`);

    // font and font size
    this.addContent(`/${this._font.id} ${number(this._fontSize)} Tf`);

    // rendering mode
    const mode = options.fill && options.stroke ? 2 : options.stroke ? 1 : 0;
    if (mode) {
      this.addContent(`${mode} Tr`);
    }

    // Character spacing
    if (characterSpacing) {
      this.addContent(`${number(characterSpacing)} Tc`);
    }

    // Horizontal scaling
    if (horizontalScaling !== 100) {
      this.addContent(`${horizontalScaling} Tz`);
    }

    // Add the actual text
    // If we have a word spacing value, we need to encode each word separately
    // since the normal Tw operator only works on character code 32, which isn't
    // used for embedded fonts.
    if (wordSpacing) {
      words = text.trim().split(/\s+/);
      wordSpacing += this.widthOfString(' ') + characterSpacing;
      wordSpacing *= 1000 / this._fontSize;

      encoded = [];
      positions = [];
      for (let word of words) {
        const [encodedWord, positionsWord] = this._font.encode(
          word,
          options.features,
        );
        encoded = encoded.concat(encodedWord);
        positions = positions.concat(positionsWord);

        // add the word spacing to the end of the word
        // clone object because of cache
        const space = {};
        const object = positions[positions.length - 1];
        for (let key in object) {
          const val = object[key];
          space[key] = val;
        }
        space.xAdvance += wordSpacing;
        positions[positions.length - 1] = space;
      }
    } else {
      [encoded, positions] = this._font.encode(text, options.features);
    }

    const scale = this._fontSize / 1000;
    const commands = [];
    let last = 0;
    let hadOffset = false;

    // Adds a segment of text to the TJ command buffer
    const addSegment = (cur) => {
      if (last < cur) {
        const hex = encoded.slice(last, cur).join('');
        const advance =
          positions[cur - 1].xAdvance - positions[cur - 1].advanceWidth;
        commands.push(`<${hex}> ${number(-advance)}`);
      }

      last = cur;
    };

    // Flushes the current TJ commands to the output stream
    const flush = (i) => {
      addSegment(i);

      if (commands.length > 0) {
        this.addContent(`[${commands.join(' ')}] TJ`);
        commands.length = 0;
      }
    };

    for (i = 0; i < positions.length; i++) {
      // If we have an x or y offset, we have to break out of the current TJ command
      // so we can move the text position.
      const pos = positions[i];
      if (pos.xOffset || pos.yOffset) {
        // Flush the current buffer
        flush(i);

        // Move the text position and flush just the current character
        this.addContent(
          `1 0 0 1 ${number(x + pos.xOffset * scale)} ${number(
            y + pos.yOffset * scale,
          )} Tm`,
        );
        flush(i + 1);

        hadOffset = true;
      } else {
        // If the last character had an offset, reset the text position
        if (hadOffset) {
          this.addContent(`1 0 0 1 ${number(x)} ${number(y)} Tm`);
          hadOffset = false;
        }

        // Group segments that don't have any advance adjustments
        if (pos.xAdvance - pos.advanceWidth !== 0) {
          addSegment(i + 1);
        }
      }

      x += pos.xAdvance * scale;
    }

    // Flush any remaining commands
    flush(i);

    // end the text object
    this.addContent('ET');

    // restore flipped coordinate system
    this.restore();
  },

  /**
   * Render an emoji sequence using the appropriate renderer based on glyph type.
   * Supports SBIX (bitmap), COLR/CPAL (vector), and CBDT/CBLC (bitmap) formats.
   * Uses the emoji font's shaping to get the correct glyph for
   * ZWJ sequences, then dispatches to the appropriate renderer.
   *
   * @param {string} text - The emoji text (single emoji sequence)
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  _emojiFragment(text, x, y) {
    if (!this._emojiFont) return;

    const font = this._emojiFont;
    const fontSize = this._fontSize;

    // Use font shaping to resolve ZWJ sequences, flags, etc.
    const run = font.layout(text);

    let curX = x;
    for (let i = 0; i < run.glyphs.length; i++) {
      const glyph = run.glyphs[i];
      const position = run.positions[i];
      const advancePt = (position.xAdvance / font.unitsPerEm) * fontSize;
      const glyphX = curX + (position.xOffset / font.unitsPerEm) * fontSize;

      if (glyph.type === 'COLR') {
        // COLR/CPAL vector emoji — render colored layers as PDF paths
        this._renderCOLREmoji(glyph, glyphX, y, fontSize, font);
      } else {
        // SBIX bitmap or CBDT bitmap — render as image XObject
        const img = this._getEmojiImage(glyph, fontSize, font);
        if (img) {
          const imgW = advancePt;
          const imgH = fontSize;
          this._placeEmojiImage(img, glyphX, y, imgW, imgH);
        }
      }
      // If no image/path (e.g. unsupported sequence), silently skip

      curX += advancePt;
    }
  },

  /**
   * Render a COLR/CPAL vector emoji by iterating its colored layers and
   * converting each layer's path to PDF content stream operators.
   *
   * @param {object} glyph - fontkit COLRGlyph object
   * @param {number} x - X position (PDFKit coordinates)
   * @param {number} y - Y position (top of text line, PDFKit coordinates)
   * @param {number} fontSize - Font size in points
   * @param {object} font - fontkit font object
   */
  _renderCOLREmoji(glyph, x, y, fontSize, font) {
    const scale = fontSize / font.unitsPerEm;
    const ascent = font.ascent;

    // Save the current fill color so we can restore it after rendering
    const savedFillColor = this._fillColor;

    for (const layer of glyph.layers) {
      const { glyph: layerGlyph, color } = layer;
      const path = layerGlyph.path;

      if (!path || !path.commands || path.commands.length === 0) continue;

      this.save();

      // Set fill color from CPAL palette (0-255 values)
      this.fillColor([color.red, color.green, color.blue]);
      if (color.alpha < 255) {
        this.fillOpacity(color.alpha / 255);
      }

      // Track current point for quadratic→cubic conversion
      let cx = 0;
      let cy = 0;

      for (const cmd of path.commands) {
        switch (cmd.command) {
          case 'moveTo': {
            const [fx, fy] = cmd.args;
            this.moveTo(x + fx * scale, y + (ascent - fy) * scale);
            cx = fx;
            cy = fy;
            break;
          }
          case 'lineTo': {
            const [fx, fy] = cmd.args;
            this.lineTo(x + fx * scale, y + (ascent - fy) * scale);
            cx = fx;
            cy = fy;
            break;
          }
          case 'quadraticCurveTo': {
            // Convert quadratic bezier to cubic for PDF
            // Q(p0, cp, p2) → C(p0, cp1, cp2, p2)
            // cp1 = p0 + 2/3*(cp-p0), cp2 = p2 + 2/3*(cp-p2)
            const [qpx, qpy, fx, fy] = cmd.args;
            const cp1x = cx + (2 / 3) * (qpx - cx);
            const cp1y = cy + (2 / 3) * (qpy - cy);
            const cp2x = fx + (2 / 3) * (qpx - fx);
            const cp2y = fy + (2 / 3) * (qpy - fy);
            this.bezierCurveTo(
              x + cp1x * scale,
              y + (ascent - cp1y) * scale,
              x + cp2x * scale,
              y + (ascent - cp2y) * scale,
              x + fx * scale,
              y + (ascent - fy) * scale,
            );
            cx = fx;
            cy = fy;
            break;
          }
          case 'bezierCurveTo': {
            const [c1x, c1y, c2x, c2y, fx, fy] = cmd.args;
            this.bezierCurveTo(
              x + c1x * scale,
              y + (ascent - c1y) * scale,
              x + c2x * scale,
              y + (ascent - c2y) * scale,
              x + fx * scale,
              y + (ascent - fy) * scale,
            );
            cx = fx;
            cy = fy;
            break;
          }
          case 'closePath':
            this.closePath();
            break;
        }
      }

      // Fill the path (no arguments — color already set)
      this.addContent('f');

      this.restore();
    }

    // Restore the document's fill color
    if (savedFillColor) {
      this.fillColor(...savedFillColor);
    }
  },

  /**
   * Get or create a cached PDFImage for an emoji glyph at a given size.
   * Supports SBIX glyphs (via getImageForSize) and CBDT glyphs (via manual
   * table extraction). COLR glyphs should be handled by _renderCOLREmoji instead.
   *
   * @param {object} glyph - fontkit glyph object (SBIXGlyph or TTFGlyph for CBDT)
   * @param {number} fontSize - Target font size in points
   * @param {object} font - fontkit font object (needed for CBDT extraction)
   * @returns {object|null} PDFImage object or null if no bitmap available
   */
  _getEmojiImage(glyph, fontSize, font) {
    const ppem = Math.round(fontSize);

    const cacheKey = `${glyph.id}:${ppem}`;
    if (this._emojiImageCache.has(cacheKey)) {
      return this._emojiImageCache.get(cacheKey);
    }

    // Try SBIX first (glyph.getImageForSize)
    let imgData;
    if (typeof glyph.getImageForSize === 'function') {
      try {
        imgData = glyph.getImageForSize(ppem);
      } catch (e) {
        // Not an SBIX glyph or no image available
        console.warn(`Error getting SBIX image for glyph ${glyph.id}: ${e.message}`);
      }
    }

    // Fallback: try CBDT/CBLC extraction if SBIX didn't work
    if ((!imgData || !imgData.data || imgData.data.length === 0) && font) {
      const cbdtData = this._extractCBDTBitmap(font, glyph.id, ppem);
      if (cbdtData) {
        imgData = { type: 'png', data: cbdtData };
      }
    }

    if (!imgData?.data?.length) {
      this._emojiImageCache.set(cacheKey, null);
      return null;
    }

    // The imgType has a trailing space (e.g. "png ") — trim it
    const imgType = (imgData.type || '').trim().toLowerCase();
    if (imgType !== 'png' && imgType !== 'jpg' && imgType !== 'jpeg') {
      this._emojiImageCache.set(cacheKey, null);
      return null;
    }

    // Create a PDFImage from the raw bitmap buffer
    const label = `EI${++this._imageCount}`;
    let image;
    try {
      image = PDFImage.open(imgData.data, label);
    } catch (e) {
      console.warn(`Error creating PDFImage for glyph ${glyph.id}: ${e.message}`);
      this._emojiImageCache.set(cacheKey, null);
      return null;
    }

    this._emojiImageCache.set(cacheKey, image);
    return image;
  },

  /**
   * Extract bitmap data from a CBDT/CBLC font for a specific glyph.
   * fontkit does not have a CBDTGlyph class, so we manually navigate
   * the CBLC index tables and read raw PNG data from the CBDT table.
   *
   * @param {object} font - fontkit font object
   * @param {number} glyphId - Glyph ID to extract
   * @param {number} ppem - Target pixels-per-em
   * @returns {Buffer|null} PNG image data buffer, or null
   */
  _extractCBDTBitmap(font, glyphId, ppem) {
    if (!font.directory?.tables?.CBDT || !font.directory?.tables?.CBLC) {
      return null;
    }

    let cblc;
    try {
      cblc = font.CBLC;
    } catch (e) {
      console.warn(`Error parsing CBLC table: ${e?.message}`);
      return null;
    }
    if (!cblc?.sizes?.length) return null;

    // Find the best strike for the target ppem that contains this glyph
    let bestStrike = null;
    let bestStrikeIdx = -1;
    let bestDiff = Infinity;
    for (let i = 0; i < cblc.sizes.length; i++) {
      const size = cblc.sizes[i];
      if (glyphId < size.startGlyphIndex || glyphId > size.endGlyphIndex) continue;
      const diff = Math.abs(size.ppemX - ppem);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestStrike = size;
        bestStrikeIdx = i;
      }
    }
    if (!bestStrike) return null;

    // Try fontkit's parsed IndexSubtableArray entries first
    // (fontkit only parses the first entry per BitmapSizeTable)
    let imageFormat = null;
    let glyphBitmapOffset = null; // offset from CBDT table start

    if (bestStrike.indexSubTableArray) {
      for (const entry of bestStrike.indexSubTableArray) {
        if (
          glyphId >= entry.firstGlyphIndex &&
          glyphId <= entry.lastGlyphIndex &&
          entry.subtable
        ) {
          const sub = entry.subtable;
          const off = this._calcGlyphOffsetInCBDT(
            sub,
            entry.firstGlyphIndex,
            glyphId,
          );
          if (off !== null) {
            glyphBitmapOffset = sub.imageDataOffset + off;
            imageFormat = sub.imageFormat;
          }
          break;
        }
      }
    }

    // If not found and there are more index subtables, manually parse from raw buffer
    if (
      glyphBitmapOffset === null &&
      bestStrike.numberOfIndexSubTables >
        (bestStrike.indexSubTableArray?.length || 0)
    ) {
      const result = this._manualCBLCLookup(
        font,
        bestStrikeIdx,
        bestStrike.numberOfIndexSubTables,
        glyphId,
      );
      if (result) {
        glyphBitmapOffset = result.offset;
        imageFormat = result.imageFormat;
      }
    }

    if (glyphBitmapOffset === null) return null;

    // Read bitmap data from CBDT table
    const cbdtStart = font.directory.tables.CBDT.offset;
    const buf = font.stream.buffer;
    const pos = cbdtStart + glyphBitmapOffset;

    try {
      switch (imageFormat) {
        case 17: {
          // SmallMetrics (5 bytes) + uint32 dataLen + PNG data
          const dataLen = buf.readUInt32BE(pos + 5);
          return buf.slice(pos + 9, pos + 9 + dataLen);
        }
        case 18: {
          // BigMetrics (8 bytes) + uint32 dataLen + PNG data
          const dataLen = buf.readUInt32BE(pos + 8);
          return buf.slice(pos + 12, pos + 12 + dataLen);
        }
        case 19: {
          // uint32 dataLen + PNG data (no metrics)
          const dataLen = buf.readUInt32BE(pos);
          return buf.slice(pos + 4, pos + 4 + dataLen);
        }
        default:
          return null;
      }
    } catch (e) {
      console.warn(`Error reading CBDT data for glyph ${glyphId}: ${e?.message}`);
      return null;
    }
  },

  /**
   * Calculate a glyph's offset within CBDT relative to imageDataOffset,
   * based on the IndexSubtable version and data.
   *
   * @param {object} subtable - Parsed IndexSubtable from fontkit
   * @param {number} firstGlyphIndex - First glyph index in the range
   * @param {number} glyphId - Target glyph ID
   * @returns {number|null} Offset relative to imageDataOffset, or null
   */
  _calcGlyphOffsetInCBDT(subtable, firstGlyphIndex, glyphId) {
    const idx = glyphId - firstGlyphIndex;
    switch (subtable.version) {
      case 1: // uint32 offset array
        return subtable.offsetArray?.[idx] ?? null;
      case 2: // fixed-size images
        return idx * subtable.imageSize;
      case 3: // uint16 offset array
        return subtable.offsetArray?.[idx] ?? null;
      case 4: {
        // sparse glyphCode/offset pairs
        if (!subtable.glyphArray) return null;
        for (const pair of subtable.glyphArray) {
          if (pair.glyphCode === glyphId) return pair.offset;
        }
        return null;
      }
      case 5: {
        // fixed-size with explicit glyph list
        if (!subtable.glyphCodeArray) return null;
        const i = subtable.glyphCodeArray.indexOf(glyphId);
        return i >= 0 ? i * subtable.imageSize : null;
      }
      default:
        return null;
    }
  },

  /**
   * Manually read IndexSubtableArray entries from raw CBLC data when
   * fontkit's parser (which only reads 1 entry) doesn't cover the glyph.
   *
   * @param {object} font - fontkit font object
   * @param {number} strikeIdx - Index of the BitmapSizeTable in CBLC.sizes
   * @param {number} numSubTables - Total number of IndexSubtableArray entries
   * @param {number} glyphId - Target glyph ID
   * @returns {{offset: number, imageFormat: number}|null}
   */
  _manualCBLCLookup(font, strikeIdx, numSubTables, glyphId) {
    const buf = font.stream.buffer;
    const cblcStart = font.directory.tables.CBLC.offset;

    // BitmapSizeTable is 48 bytes; array starts at cblcStart + 8
    const bstOffset = cblcStart + 8 + strikeIdx * 48;
    // First uint32 in BitmapSizeTable is indexSubTableArrayOffset (from cblcStart)
    const istArrayOffset = buf.readUInt32BE(bstOffset);
    const istArrayStart = cblcStart + istArrayOffset;

    try {
      for (let i = 0; i < numSubTables; i++) {
        const entryPos = istArrayStart + i * 8;
        const firstGlyph = buf.readUInt16BE(entryPos);
        const lastGlyph = buf.readUInt16BE(entryPos + 2);
        const additionalOffset = buf.readUInt32BE(entryPos + 4);

        if (glyphId < firstGlyph || glyphId > lastGlyph) continue;

        // Parse IndexSubtable header at istArrayStart + additionalOffset
        const subStart = istArrayStart + additionalOffset;
        const indexFormat = buf.readUInt16BE(subStart);
        const imageFormat = buf.readUInt16BE(subStart + 2);
        const imageDataOffset = buf.readUInt32BE(subStart + 4);

        const idx = glyphId - firstGlyph;
        let relOffset = null;

        switch (indexFormat) {
          case 1: // uint32 offset array after 8-byte header
            relOffset = buf.readUInt32BE(subStart + 8 + idx * 4);
            break;
          case 2: {
            // fixed-size after 8-byte header
            const imageSize = buf.readUInt32BE(subStart + 8);
            relOffset = idx * imageSize;
            break;
          }
          case 3: // uint16 offset array after 8-byte header
            relOffset = buf.readUInt16BE(subStart + 8 + idx * 2);
            break;
          case 4: {
            // sparse: numGlyphs (uint32) at +8, then CodeOffsetPair array
            const numGlyphs = buf.readUInt32BE(subStart + 8);
            for (let j = 0; j <= numGlyphs; j++) {
              const pairPos = subStart + 12 + j * 4;
              if (buf.readUInt16BE(pairPos) === glyphId) {
                relOffset = buf.readUInt16BE(pairPos + 2);
                break;
              }
            }
            break;
          }
          case 5: {
            // fixed-size with explicit glyph list
            const imageSize = buf.readUInt32BE(subStart + 8);
            // BigMetrics (8 bytes) at +12, numGlyphs at +20, glyphCodeArray at +24
            const numGlyphs = buf.readUInt32BE(subStart + 20);
            for (let j = 0; j < numGlyphs; j++) {
              if (buf.readUInt16BE(subStart + 24 + j * 2) === glyphId) {
                relOffset = j * imageSize;
                break;
              }
            }
            break;
          }
        }

        if (relOffset !== null) {
          return { offset: imageDataOffset + relOffset, imageFormat };
        }
      }
    } catch (e) {
      console.warn(`Error manually parsing CBLC/IndexSubtableArray: ${e?.message}`);
      return null;
    }

    return null;
  },

  /**
   * Place an emoji image XObject at the specified position and size.
   * Handles the coordinate system flip that PDFKit applies.
   *
   * @param {object} image - PDFImage object
   * @param {number} x - X position (PDFKit coordinates, top-left origin)
   * @param {number} y - Y position (PDFKit coordinates, top-left origin)
   * @param {number} w - Width in points
   * @param {number} h - Height in points
   */
  _placeEmojiImage(image, x, y, w, h) {
    // Ensure the image is embedded
    if (!image.obj) {
      image.embed(this);
    }

    // Register the XObject on the current page
    if (this.page.xobjects[image.label] == null) {
      this.page.xobjects[image.label] = image.obj;
    }

    // PDFKit has a flipped coordinate system (origin top-left).
    // The default page transform is (1, 0, 0, -1, 0, pageHeight).
    // To place an image, we need to flip it back:
    //   y_pdf = pageHeight - y_pdkit
    // And images are drawn bottom-up, so we add h to y.
    this.save();
    this.transform(w, 0, 0, -h, x, y + h);
    this.addContent(`/${image.label} Do`);
    this.restore();
  },
};
