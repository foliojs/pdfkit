import { normalizeSides } from "./utils";

/**
 * @typedef {{
    colspan ?: number;
    rowspan ?: number;
    value ?: any;
    padding ?: SideDefinition<Wideness>;
    border ?: SideDefinition<Wideness>;
    borderColor ?: SideDefinition<PDFColor>;
    backgroundColor ?: PDFColor;
    textColor ?: PDFColor;
    textStroke ?: Wideness;
    textStrokeColor ?: PDFColor;
    align ?: 'center' | { x? : 'left' | 'center' | 'right' | 'justify'; y? : 'top' | 'center' | 'bottom' };
    font ?: string;
    fontFamily ?: string;
    fontSize ?: Size;
    x ?: Size;
    y ?: Size;
    debug ?: boolean;
 }} Cell
 */

/**
 * @typedef {{
    cols ?: number;
    rows ?: number;
    cellHeight ?: Size;
    cellWidth ?: Size;
    x ?: Size | undefined;
    y ?: Size | undefined;
    width ?: Size | undefined;
    height ?: Size | undefined;
    border ?: SideDefinition<Wideness>;
    borderColor ?: SideDefinition<PDFColor>;
    defaultCell ?: Cell
 }} TableOpts
 */

export class PDFTable {
  /**
   *
   * @param {PDFDocument} document
   * @param {TableOpts} opts
   */
  constructor(document, opts) {
    this.document = document;
    this.opts = Object.freeze(opts);
    // Normalise
    this.x = document.sizeToPoint(opts.x, document.x);
    this.y = document.sizeToPoint(opts.y, document.y);
    this.width = document.sizeToPoint(
      opts.width,
      document.page.contentWidth - this.x,
    );
    this.height = document.sizeToPoint(
      opts.height,
      document.page.contentHeight - this.y,
    );

    this.cols = opts.cols;
    if (opts.cols !== undefined && opts.cols <= 0) {
      throw new Error("cols must be greater than 0");
    }
    this.cellWidth = document.sizeToPoint(
      opts.cellWidth,
      opts.cols ? this.width / opts.cols : this.width / 4,
    );
    this.cellHeight = document.sizeToPoint(
      opts.cellHeight,
      opts.rows ? this.height / opts.rows : "2em",
    );

    if (opts.width === undefined && opts.cols !== undefined) {
      this.width = this.cellWidth * opts.cols;
    }

    this.border = normalizeSides(
      opts.border,
      0,
      document.sizeToPoint.bind(document),
    );
    this.borderColor = normalizeSides(opts.borderColor);

    this.currCellX = 0;
    this.currCellY = 0;
    this.cellClaim = new Set();
  }

  _initCellWidth(cols) {
    if (this.cols === undefined) {
      this.cols = cols;
      if (this.opts.cellWidth === undefined) {
        this.cellWidth = this.width / cols;
      }
      if (this.opts.width === undefined) this.width = this.cellWidth * cols;
    }
  }

  /**
   * Draws a row of cells to the table
   *
   * @example
   * ```
   * doc.table()
   *    .row(['A', 'B', 'C'])
   *    .row(['D', 'E', 'F'])
   * ```
   * would render a 3x2 table
   *
   * |  A  |  B  |  C  |
   * | --- | --- | --- |
   * |  D  |  E  |  F  |
   *
   * @param cells - The cells to render
   * @param defaultCell - Any config you wish to apply to all cells in this row
   */
  row(cells, defaultCell = {}) {
    // If you haven't provided any 'cols' indication,
    // then we will use the first non-empty row to infer it (assuming it's an array) else it will use the default
    if (Array.isArray(cells)) {
      const colspan = cells.reduce((acc, cell) => {
        const cellColspan =
          cell === null || cell === undefined || typeof cell !== "object"
            ? undefined
            : cell.colspan;

        return (
          acc +
          Math.max(
            1,
            Math.floor(
              cellColspan ??
                defaultCell.colspan ??
                this.opts.defaultCell?.colspan ??
                1,
            ),
          )
        );
      }, 0);
      if (colspan > 0) this._initCellWidth(colspan);
    }

    const startY = this.currCellY;
    this.currCellX = 0;

    let maxY = this.y;

    for (let cell of cells) {
      if (cell === null || cell === undefined || typeof cell !== "object") {
        cell = { value: cell };
      }
      cell = {
        rowspan: 1,
        colspan: 1,
        ...this.opts.defaultCell,
        ...defaultCell,
        ...cell,
      };

      // spanning can only be integer
      cell.rowspan = Math.max(1, Math.floor(cell.rowspan));
      cell.colspan = Math.max(1, Math.floor(cell.colspan));

      // Find first available cell
      while (this.cellClaim.has(`${this.currCellX},${this.currCellY}`)) {
        this.currCellX++;
        if (this.cols && this.currCellX >= this.cols) {
          this.currCellX = 0;
          this.currCellY++;
        }
      }

      maxY = Math.max(maxY, this._renderCell(cell));

      // Claim any spanning cells
      for (let i = 0; i < cell.colspan; i++) {
        for (let j = 0; j < cell.rowspan; j++) {
          if (i !== 0 || j !== 0)
            this.cellClaim.add(`${this.currCellX + i},${this.currCellY + j}`);
        }
      }
      // Move to next cell
      this.currCellX++;
    }

    this.currCellY++;

    // Draw borders
    this._renderBorder(
      this.border,
      this.borderColor,
      this.x,
      this.y + startY * this.cellHeight,
      this.width,
      maxY - (this.y + startY * this.cellHeight),
      { top: startY === 0, right: true, bottom: false, left: true },
    );

    // Move cursor to the bottom left of the row
    this.document.x = this.x;
    this.document.y = maxY;
    this.document.moveTo(this.document.x, this.document.y);

    return this;
  }

  /**
   * Indicates to the table that it is finished
   *
   * so that it can do any cleanup such as drawing the bottom border
   *
   * Not strictly required to call but may leave your table in an undesirable state
   *
   * @returns the document
   */
  end() {
    // Draw bottom border
    this._renderBorder(
      this.border,
      this.borderColor,
      this.x,
      this.document.y,
      this.width,
      0,
      {
        top: false,
        right: false,
        bottom: true,
        left: false,
      },
    );

    return this.document;
  }

  _renderCell({
    border,
    borderColor,
    padding,
    align,
    fontSize,
    textStroke,
    textColor,
    textStrokeColor,
    backgroundColor,
    value,
    colspan,
    rowspan,
    font,
    fontFamily,
    debug,
    x,
    y,
    ...cell
  }) {
    // Set font temporarily
    const rollbackFont = this.document._fontSource;
    const rollbackFontSize = this.document._fontSize;
    const rollbackFontFamily = this.document._fontFamily;
    if (font) this.document.font(font, fontFamily);
    if (fontSize) this.document.fontSize(fontSize);

    // Normalize options
    border = normalizeSides(
      border,
      1,
      this.document.sizeToPoint.bind(this.document),
    );
    borderColor = normalizeSides(borderColor, undefined);
    padding = normalizeSides(
      padding,
      "0.25em",
      this.document.sizeToPoint.bind(this.document),
    );
    align =
      align === undefined || typeof align === "string"
        ? { x: align, y: align }
        : align;
    textStroke = this.document.sizeToPoint(textStroke);

    // Default alignment
    if (align.x === undefined) align.x = "left";
    if (align.y === undefined) align.y = "center";

    if (typeof value === "boolean") value = value ? "\u2713" : "\u2715";
    if (value !== null && value !== undefined) value = String(value);

    // Render the cell borders
    const rectHeight = this.cellHeight * rowspan;
    const rectWidth = this.cellWidth * colspan;
    const posX = this.document.sizeToPoint(
      x,
      this.x + this.currCellX * this.cellWidth,
    );
    const posY = this.document.sizeToPoint(
      y,
      this.y + this.currCellY * this.cellHeight,
    );

    if (backgroundColor !== undefined) {
      this.document
        .save()
        .rect(posX, posY, rectWidth, rectHeight)
        .fill(backgroundColor)
        .restore();
    }
    this._renderBorder(border, borderColor, posX, posY, rectWidth, rectHeight);

    // Render text

    // Compute bounds of text
    const textRectWidth = rectWidth - padding.left - padding.right;
    const textRectHeight = rectHeight - padding.top - padding.bottom;

    const textOptions = {
      align: align.x,
      ellipsis: true,
      lineBreak: false,
      stroke: textStroke > 0,
      fill: true,
      ...cell,
      width: textRectWidth,
      height: textRectHeight,
    };

    // Compute actual position of text based on alignment
    const textHeight = this.document.heightOfString(value ?? "", textOptions);
    const yOffset =
      (textRectHeight - textHeight) *
      (align.y === "bottom" ? 1 : align.y === "center" ? 0.5 : 0);

    const textPosX = posX + padding.left;
    const textPosY = posY + padding.top;

    // Debug viewer
    if (debug) {
      this.document
        .save()
        .dash(1, { space: 1 })
        .lineWidth(1)
        .strokeOpacity(0.3);
      // Debug text bounds
      if (value?.length)
        this.document
          .rect(textPosX, textPosY + yOffset, textRectWidth, textHeight)
          .stroke("red");
      // Debug text allocated space
      this.document
        .rect(textPosX, textPosY, textRectWidth, textRectHeight)
        .stroke("blue");
      this.document.restore();
    }

    if (value?.length) {
      this.document.save();
      if (textColor !== undefined) this.document.fillColor(textColor);
      if (textStroke > 0) this.document.lineWidth(textStroke);
      if (textStrokeColor !== undefined)
        this.document.strokeColor(textStrokeColor);
      this.document.text(value, textPosX, textPosY + yOffset, textOptions);
      this.document.restore();
    }
    if (font || fontSize) {
      this.document.font(rollbackFont, rollbackFontFamily, rollbackFontSize);
    }

    // Return bottom Y position of cell
    return posY + rectHeight;
  }

  _renderBorder(border, borderColor, x, y, width, height, mask) {
    const computedBorder = Object.fromEntries(
      Object.entries(border).map(([k, v]) => [k, mask && !mask[k] ? 0 : v]),
    );

    if (
      [computedBorder.right, computedBorder.bottom, computedBorder.left].every(
        (val) => val === computedBorder.top,
      )
    ) {
      if (computedBorder.top > 0) {
        this.document
          .save()
          .lineWidth(computedBorder.top)
          .rect(x, y, width, height);
        if (borderColor.top) this.document.strokeColor(borderColor.top);
        this.document.stroke().restore();
      }
    } else {
      // Top
      if (computedBorder.top > 0) {
        this.document
          .save()
          .lineWidth(computedBorder.top)
          .polygon([x, y], [x + width, y]);
        if (borderColor.top) this.document.strokeColor(borderColor.top);
        this.document.stroke().restore();
      }
      // Right
      if (computedBorder.right > 0) {
        this.document
          .save()
          .lineWidth(computedBorder.right)
          .polygon([x + width, y], [x + width, y + height]);
        if (borderColor.right) this.document.strokeColor(borderColor.right);
        this.document.stroke().restore();
      }
      // Bottom
      if (computedBorder.bottom > 0) {
        this.document
          .save()
          .lineWidth(computedBorder.bottom)
          .polygon([x + width, y + height], [x, y + height]);
        if (borderColor.bottom) this.document.strokeColor(borderColor.bottom);
        this.document.stroke().restore();
      }
      // Left
      if (computedBorder.left > 0) {
        this.document
          .save()
          .lineWidth(computedBorder.left)
          .polygon([x, y + height], [x, y]);
        if (borderColor.left) this.document.strokeColor(borderColor.left);
        this.document.stroke().restore();
      }
    }
  }
}
