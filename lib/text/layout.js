import { Rules } from '@cto.af/linebreak';
import { computeInscribedBounds, normalizeAlignment, normalizeRotation, normalizeSides, rotateBox } from '../utils';

const SOFT_HYPHEN = '\u00AD';
const HYPHEN = '-';

/*
 * TODO: Add backwards compatability for event emitter (if that's something we still want)
 * TODO: continued text
 * TODO: text transformation
 * TODO: sort out document elements like structures and page breaks
 *
 * Future idea, allow support for inline styling of text e.g. ["Hello", {text: "world", font: "bold"}], or even template literals
 */

export default class LayoutEngine {
  /**
   * @param {PDFDocument} doc
   * @param {LayoutOptions} [options]
   */
  constructor(doc, options) {
    /** @type {any} */
    this.doc = doc;
    this.options = this._normalizeLayoutOptions(options);
    // TODO: This may need to a polyfill
    this.segmenter = new Intl.Segmenter(this.options.locales, { granularity: 'grapheme' });
    this.lineBreaker = new Rules({ string: true });
    /**
     * Cache computed widths of string to skip processing of equal segments
     * @type {Map<string, number>}
     */
    this.widthCache = new Map();
  }

  /**
   * Compute the horizon-locked circumscribed bounding box on a block of text.
   *
   * @note This factors in text rotation (if provided)
   * and computes the bounds of where the text would be rendered on the screen.
   *
   * @example
   * ```
   *      <───────width───────>
   *      ╔═══════════▄═══════╗ ˄
   *      ║░░░░░░   ██ ██     ║ │
   *      ║░90-Θ░░██     ██   ║ h
   *      ║░░░░░██   t   d ██ ║ e
   *      ║░░░░█   s   n     █║ i
   *      ║░░██  r   o   d ██ ║ g
   *      ║██  i   c   r ██   ║ h
   * x,y─>*█ F   e   i ██     ║ t
   *      ║ ██ S   h ██       ║ │
   *      ║   ██ T ██         ║ │
   *      ╚═════▀▀▀═══════════╝ ˅
   * 'Imagine the characters are also rotated'
   * ```
   *
   * @param {string} text - The string
   * @param {TextOptions} [options] - The options
   *
   * @returns {{x: number, y: number, width: number, height: number}}
   */
  boundsOfString(text, options) {
    const textOptions = this._normalizeTextOptions(options);

    // Compute max bounds
    const [maxWidth, maxHeight] = computeInscribedBounds(
      textOptions.width,
      textOptions.height,
      textOptions.rotation,
    );

    let contentHeight = 0;
    let contentWidth = 0;

    // Use `_constrainedLines()` as we don't care about the formatting applied in `lines()`
    for (const [, width, height] of this._constrainedLines(text, maxWidth, maxHeight, textOptions)) {
      contentHeight += height;
      contentWidth = Math.max(contentWidth, width);
    }

    // Lock the bounding box to the horizon
    const [x, y, width, height] = rotateBox(textOptions.x, textOptions.y, contentWidth, contentHeight, textOptions.rotation);
    return { x, y, width, height };
  }

  /**
   * Compute the height of a string at a specified position
   *
   * @note This factors in text rotation (if provided)
   * and computes the vertical height of the text (not the height of the lines)
   * i.e.
   * ```
   *      ╔═══════════▄═══════╗ ˄
   *      ║░░░░░░   ██ ██     ║ │
   *      ║░90-Θ░░██     ██   ║ h
   *      ║░░░░░██   t   d ██ ║ e
   *      ║░░░░█   s   n     █║ i
   *      ║░░██  r   o   d ██ ║ g
   *      ║██  i   c   r ██   ║ h
   * x,y─>*█ F   e   i ██     ║ t
   *      ║ ██ S   h ██       ║ │
   *      ║   ██ T ██         ║ │
   *      ╚═════▀▀▀═══════════╝ ˅
   * 'Imagine the characters are also be rotated'
   * ```
   *
   * @param {string} text - The string
   * @param {TextOptions} [options] - The options
   *
   * @returns {number}
   */
  heightOfString(text, options) {
    return this.boundsOfString(text, options).height;
  }

  /**
   * Compute the width of a string at a specified position
   *
   * @note This factors in text rotation (if provided)
   * and computes the horizontal width of the text (not the width of the lines)
   * i.e.
   * ```
   *      <───────width───────>
   *      ╔═══════════▄═══════╗
   *      ║░░░░░░   ██ ██     ║
   *      ║░90-Θ░░██     ██   ║
   *      ║░░░░░██   t   d ██ ║
   *      ║░░░░█   s   n     █║
   *      ║░░██  r   o   d ██ ║
   *      ║██  i   c   r ██   ║
   * x,y─>*█ F   e   i ██     ║
   *      ║ ██ S   h ██       ║
   *      ║   ██ T ██         ║
   *      ╚═════▀▀▀═══════════╝
   * 'Imagine the characters are also rotated'
   * ```
   *
   * @param {string} text - The string
   * @param {TextOptions} [options] - The options
   *
   * @returns {number}
   */
  widthOfString(text, options) {
    return this.boundsOfString(text, options).width;
  }

  /**
   * Render the text to the document
   *
   * Unlike {@link LayoutEngine.textBox}, this uses the x,y position as the origin of the text,
   * this means that text follows the standard PDF text placement logic,
   * and can (if rotated) go above the starting x,y position.
   *
   * ```
   *      <───────width───────>
   *      ╔═══════════▄═══════╗ ˄
   *      ║░░░░░░   ██ ██     ║ │
   *      ║░90-Θ░░██     ██   ║ h
   *      ║░░░░░██   t   d ██ ║ e
   *      ║░░░░█   s   n     █║ i
   *      ║░░██  r   o   d ██ ║ g
   *      ║██  i   c   r ██   ║ h
   * x,y─>*█ F   e   i ██     ║ t
   *      ║ ██ S   h ██       ║ │
   *      ║   ██ T ██         ║ │
   *      ╚═════▀▀▀═══════════╝ ˅
   * 'Imagine the characters are also rotated'
   * ```
   *
   * If you wish for it to be top-left aligned see {@link LayoutEngine.textBox}
   *
   * @param {string} text - The string
   * @param {TextOptions} [options] - customize the rendering of the text
   */
  text(text, options) {
    text = `${text}`;
    const textOpts = this._normalizeTextOptions(options);

    if (textOpts.rotation) {
      this.doc.save();
      this.doc.rotate(-textOpts.rotation, { origin: [textOpts.x, textOpts.y] });
    }

    for (const { line, x, y } of this._lines(text, textOpts)) {
      // Render each formatted line (ignore rotation as that is set per render not per line)
      this._renderFragment(line, x, y, { ...textOpts, rotation: 0 });
    }
    if (textOpts.rotation) this.doc.restore();
  }

  /**
   * Render text in a box
   *
   * Unlike {@link LayoutEngine.text}, this uses the x,y position not as the origin of the text,
   * but as the origin of the text box, this means that when the text is rotated,
   * it does not go outside the origin bounding box.
   *
   * ```
   *      <───────width───────>
   * x,y─>*═══════════▄═══════╗ ˄
   *      ║░░░░░░   ██ ██     ║ │
   *      ║░90-Θ░░██     ██   ║ h
   *      ║░░░░░██   t   d ██ ║ e
   *      ║░░░░█   s   n     █║ i
   *      ║░░██  r   o   d ██ ║ g
   *      ║██  i   c   r ██   ║ h
   *      ║█ F   e   i ██     ║ t
   *      ║ ██ S   h ██       ║ │
   *      ║   ██ T ██         ║ │
   *      ╚═════▀▀▀═══════════╝ ˅
   * 'Imagine the characters are also rotated'
   * ```
   *
   * @param {string} text - The string
   * @param {TextBoxOptions} [options] - customize the rendering of the textbox
   */
  textBox(text, options) {
    text = `${text}`;
    const textBoxOpts = this._normalizeTextBoxOptions(options);

    let dx = 0, dy = 0;
    // We only need to know the bounds if either the text is rotated or the border is going to be rendered
    if (textBoxOpts.rotation || (textBoxOpts.border && textBoxOpts.borderColor && textBoxOpts.borderOpacity)) {
      // We need to know how big the text will be so that we can then offset the text origin
      const bounds = this.boundsOfString(text, textBoxOpts);

      // Render the border
      // This ignores rotation
      this.box(textBoxOpts.x, textBoxOpts.y, bounds.width, bounds.height, { ...textBoxOpts, rotation: 0 });

      // We offset the text position by the relative shift that the rotation has created
      dx = textBoxOpts.x - bounds.x;
      dy = textBoxOpts.y - bounds.y;
    }

    // Render the text
    this.text(text, { ...textBoxOpts, x: textBoxOpts.x + dx, y: textBoxOpts.y + dy });
  }

  box(x, y, width, height, options) {
    const { border, borderColor, borderOpacity, rotation } = this._normalizeBoxOptions(options);

    if (!border || !borderColor || !borderOpacity) return;

    if (rotation) {
      this.doc.save();
      this.doc.rotate(-rotation, { origin: [x, y] });
    }

    // Combine border, color and opacity
    const bco = {
      top: [border.top, borderColor.top, borderOpacity.top],
      right: [border.right, borderColor.right, borderOpacity.right],
      bottom: [border.bottom, borderColor.bottom, borderOpacity.bottom],
      left: [border.left, borderColor.left, borderOpacity.left],
    };

    // Optimization: if all sides are the same, we can render as a rectangle
    if ([bco.right, bco.bottom, bco.left].every(side => side.every((s, i) => s === bco.top[i]))) {
      // Skip if no width or opacity
      if (bco.top[0] > 0 && bco.top[2] > 0) {
        this.doc
          .save()
          .lineWidth(bco.top[0])
          .rect(x, y, width, height)
          .strokeColor(bco.top[1], bco.top[2])
          .stroke()
          .restore();
      }
    } else {
      // Top
      if (bco.top[0] > 0 && bco.top[2] > 0) {
        this.doc
          .save()
          .lineWidth(bco.top[0])
          .moveTo(x, y)
          .lineTo(x + width, y)
          .strokeColor(bco.top[1], bco.top[2])
          .stroke()
          .restore();
      }
      // Right
      if (bco.right[0] > 0 && bco.right[2] > 0) {
        this.doc
          .save()
          .lineWidth(bco.right[0])
          .moveTo(x + width, y)
          .lineTo(x + width, y + height)
          .strokeColor(bco.right[1], bco.right[2])
          .stroke()
          .restore();
      }
      // Bottom
      if (bco.bottom[0] > 0 && bco.bottom[2] > 0) {
        this.doc
          .save()
          .lineWidth(bco.bottom[0])
          .moveTo(x + width, y + height)
          .lineTo(x, y + height)
          .strokeColor(bco.bottom[1], bco.bottom[2])
          .stroke()
          .restore();
      }
      // Left
      if (bco.left[0] > 0 && bco.left[2] > 0) {
        this.doc
          .save()
          .lineWidth(bco.left[0])
          .moveTo(x, y + height)
          .lineTo(x, y)
          .strokeColor(bco.left[1], bco.left[2])
          .stroke()
          .restore();
      }
    }

    if (rotation) this.doc.restore();
  }

  /**
   * @private
   *
   * @param {LayoutOptions} [options]
   *
   * @returns {LayoutOptions}
   */
  _normalizeLayoutOptions(options) {
    options = options ?? {};
    const normalizedOptions = {};

    normalizedOptions.locales = options.locales;

    return normalizedOptions;
  }

  /**
   * @private
   *
   * @param {TextOptions} [options]
   * @returns {NormalizedTextOptions}
   */
  _normalizeTextOptions(options) {
    options = options ?? {};

    const normalizedOptions = {};
    normalizedOptions.x = this.doc.sizeToPoint(options.x, this.doc.x);
    normalizedOptions.y = this.doc.sizeToPoint(options.y, this.doc.x);
    normalizedOptions.width = this.doc.sizeToPoint(options.width, this.doc.page.width - this.doc.page.margins.right - normalizedOptions.x);
    normalizedOptions.height = this.doc.sizeToPoint(options.height, this.doc.page.height - this.doc.page.margins.bottom - normalizedOptions.y);

    normalizedOptions.rotation = (options.rotation ?? 0) % 360;
    if (normalizedOptions.rotation < 0) normalizedOptions.rotation += 360;

    normalizedOptions.ellipsis = options.ellipsis ?? false;
    if (typeof normalizedOptions.ellipsis === 'boolean') normalizedOptions.ellipsis = normalizedOptions.ellipsis ? '…' : '';
    normalizedOptions.ellipsisWidth = this._widthOfSegment(normalizedOptions.ellipsis);

    return normalizedOptions;
  }

  /**
   * @private
   *
   * @param {BoxOptions} [options]
   * @param {number} [defaultBorder=1]
   * @returns {NormalizedBoxOptions}
   */
  _normalizeBoxOptions(options, defaultBorder = 1) {
    options = options ?? {};
    const normalizedOptions = {};
    normalizedOptions.border = normalizeSides(options.border, defaultBorder);
    normalizedOptions.borderColor = normalizeSides(options.borderColor, 'black');
    normalizedOptions.borderOpacity = normalizeSides(options.borderOpacity, 1);
    normalizedOptions.rotation = normalizeRotation(options.rotation, 0);
    return normalizedOptions;
  }

  /**
   * @private
   *
   * @param {TextBoxOptions} [options]
   * @returns {NormalizedTextBoxOptions}
   */
  _normalizeTextBoxOptions(options) {
    options = options ?? {};
    const textOptions = this._normalizeTextOptions(options);
    const boxOptions = this._normalizeBoxOptions(options, 0);

    const normalizedOptions = {};
    Object.assign(normalizedOptions, textOptions, boxOptions);

    normalizedOptions.alignContent = normalizeAlignment(options.alignContent, { x: 'left', y: 'top' });

    return normalizedOptions;
  }

  /**
   * Fetch the width of a text segment using the current document font.
   * This value is also then stored in the cache for reuse
   *
   * @param {string} text - The text
   * @returns {number}
   * @private
   */
  _widthOfSegment(text) {
    if (!text) return 0;
    if (!this.widthCache.has(text)) {
      this.widthCache.set(text, this.doc._font.widthOfString(text, this.doc._fontSize, this.options.features));
    }
    return this.widthCache.get(text);
  }

  /**
   * Split a string into lines that will fit in the provided bounds
   *
   * text that does not fit in the bounds will be truncated/ellipsis
   *
   * @param {string} text - The string
   * @param {NormalizedTextOptions} options - The options
   *
   * @note the returning values do not factor in rotation (as rotation is applied to the entire textbox)
   * @returns {Iterator<{line: string, x: number, y: number, width: number, height: number}>}
   */
  * _lines(text, options) {
    // Compute max bounds
    const [maxWidth, maxHeight] = computeInscribedBounds(
      options.width,
      options.height,
      options.rotation,
    );

    // Apply any formatting to the line
    let currHeight = options.y;
    for (const [line, width, height] of this._constrainedLines(text, maxWidth, maxHeight, options)) {
      yield { line, x: options.x, y: currHeight, width, height };
      currHeight += height;
    }
  }

  /**
   * Split a string into lines ensuring they are contained in the bounding box
   *
   * @param {string} text - The string
   * @param {number} maxWidth - The max width of a line
   * @param {number} maxHeight - The max height of the text block
   * @param {NormalizedTextOptions} options - The options
   *
   * @returns {Iterator<[line: string, width: number, height: number]>}
   */
  * _constrainedLines(text, maxWidth, maxHeight, options) {
    // There is no way to have any lines if the maxHeight is 0
    if (maxHeight === 0) return undefined;

    // The current position of the text bottom
    let currHeight = 0;
    const lineHeight = this.doc.currentLineHeight();

    // We are unable to fit at least one line in the bounds, so terminate early
    if (lineHeight > maxHeight) return undefined;

    const lineGap = this.doc.currentLineGap();

    let currLine;
    for (let newLine of this._widthConstrainedLines(text, maxWidth)) {
      // The last character is a soft hyphen - replace it with visible hyphen.
      switch (newLine[newLine.length - 1]) {
        case SOFT_HYPHEN:
          newLine[newLine.length - 1] = HYPHEN;
          break;
        case '\n':
          newLine = newLine.slice(0, -1);
          break;
      }

      // Compute width of newLine
      const newLineWidth = this._widthOfSegment(newLine);

      // Release the current line as we know there is a new one
      if (currLine) {
        // If the new line can't fit, then we need to truncate the current one and flush
        if (currHeight + lineGap + lineHeight > maxHeight) {
          let truncatedCurrLine = currLine.line.trimEnd();
          let truncatedCurrLineWidth = this._widthOfSegment(currLine.line);

          if (truncatedCurrLineWidth + options.ellipsisWidth > maxWidth) {
            truncatedCurrLine = '';
            truncatedCurrLineWidth = 0;
            for (const { segment } of this.segmenter.segment(currLine.line)) {
              const segWidth = this._widthOfSegment(segment);
              truncatedCurrLineWidth += segWidth;

              if (truncatedCurrLineWidth + options.ellipsisWidth > maxWidth) break;
              truncatedCurrLine += segment;
            }
          }

          if (options.ellipsis) {
            truncatedCurrLine += options.ellipsis;
            truncatedCurrLineWidth += options.ellipsisWidth;
          }

          // No gap as it's the last line
          yield [truncatedCurrLine, truncatedCurrLineWidth, lineHeight];

          // No new lines can fit so terminate early
          return undefined;
        }

        // Flush the current line as we know it can fit
        yield [currLine.line, currLine.width, lineHeight + lineGap];
      }

      currLine = { line: newLine, width: newLineWidth };
      currHeight += lineHeight + lineGap;
    }

    if (currLine) {
      // No gap as it's the last line
      yield [currLine.line, currLine.width, lineHeight];
    }
  }

  /**
   * Split a string into lines ensuring they are contained in the width option
   *
   * @param {string} text - The string
   * @param {number} maxWidth - The max width of a line
   *
   * @returns {Iterator<string>}
   */
  * _widthConstrainedLines(text, maxWidth) {
    // There is no way to have any lines if the maxWidth is 0
    if (maxWidth === 0) return undefined;

    let buffer = '';
    let bufferLen = 0;

    // Find line break opportunities
    for (const brk of this.lineBreaker.breaks(text)) {
      const seg = brk.string;
      const segWidth = this._widthOfSegment(seg);


      // Check if the current segment will fit on the current line
      if (bufferLen + segWidth <= maxWidth) {
        buffer += seg;
        bufferLen += segWidth;
      } else {
        // Terminate the previous line
        if (buffer) yield buffer;

        // if the segment itself is too wide, then split it by graphemes
        if (segWidth <= maxWidth) {
          // Move string to new line
          bufferLen = segWidth;
          buffer = seg;
        } else {
          buffer = '';
          bufferLen = 0;

          for (const data of this.segmenter.segment(seg)) {
            const grapheme = data.segment;
            const graphemeWidth = this._widthOfSegment(grapheme);
            if (bufferLen + graphemeWidth > maxWidth) {
              if (buffer) yield buffer;

              bufferLen = graphemeWidth;
              buffer = grapheme;
            } else {
              // Add grapheme to the buffer
              buffer += grapheme;
              bufferLen += graphemeWidth;
            }
          }
        }
      }

      // Force a break if required
      if (brk.required && buffer) {
        yield buffer;
        buffer = '';
        bufferLen = 0;
      }
    }
    // Flush any remaining text
    if (buffer) yield buffer;
  }

  /**
   * @private
   *
   * Write the fragment to the document
   *
   * @param {string} frag
   * @param {number} x
   * @param {number} y
   * @param {NormalizedTextOptions} options
   */
  _renderFragment(frag, x, y, options) {
    //TODO: replace fragment generation with custom system
    this.doc._fragment(frag, x, y, options);
  }
}
