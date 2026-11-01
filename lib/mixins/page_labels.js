import PDFNumberTree from '../number_tree';

const STYLES = {
  decimal: 'D',
  upperRoman: 'R',
  lowerRoman: 'r',
  upperAlpha: 'A',
  lowerAlpha: 'a',
};

export default {
  /**
   * Set how pages are labelled from `pageIndex` on, until the next range.
   *
   * @param {number} pageIndex - zero-based index of the first page of the range
   * @param {object} [options]
   * @param {'decimal' | 'upperRoman' | 'lowerRoman' | 'upperAlpha' | 'lowerAlpha'} [options.style] - numbering style, no number is shown without one
   * @param {string} [options.prefix] - text in front of the number
   * @param {number} [options.start] - the number of the first page of the range, defaults to 1
   * @returns {this}
   */
  addPageLabel(pageIndex, options = {}) {
    if (!Number.isInteger(pageIndex) || pageIndex < 0) {
      throw new Error(
        `addPageLabel(${pageIndex}) invalid, pageIndex must be a non-negative integer`,
      );
    }

    const { style, prefix, start } = options;
    const label = {};

    if (style != null) {
      if (!Object.hasOwn(STYLES, style)) {
        throw new Error(
          `addPageLabel style ${style} invalid, must be one of ${Object.keys(STYLES).join(', ')}`,
        );
      }
      label.S = STYLES[style];
    }
    if (prefix != null) {
      label.P = new String(prefix);
    }
    if (start != null) {
      if (!Number.isInteger(start) || start < 1) {
        throw new Error(
          `addPageLabel start ${start} invalid, must be a positive integer`,
        );
      }
      label.St = start;
    }

    if (!this._root.data.PageLabels) {
      // a root node has no /Limits, and the tree must cover the first page
      this._root.data.PageLabels = new PDFNumberTree({ limits: false });
      this._root.data.PageLabels.add(0, { S: STYLES.decimal });
    }
    this._root.data.PageLabels.add(pageIndex, label);

    return this;
  },
};
