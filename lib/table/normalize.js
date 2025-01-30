import { deepMerge, definedProps, normalizeSides } from '../utils';
import {
  normalizedColumnStyle,
  normalizedDefaultStyle,
  normalizedRowStyle,
} from './style';
import { COLUMN_FIELDS, ROW_FIELDS } from './types';

/**
 * Normalize a table
 *
 * @this PDFTable
 * @memberOf PDFTable
 * @private
 */
export function normalizeTable() {
  // Normalize config
  let index = this.document._tableIndex++;
  this._id = new String(this.opts.id ?? `table-${index}`);
  this._position = {
    x: this.document.sizeToPoint(this.opts.position?.x, this.document.x),
    y: this.document.sizeToPoint(this.opts.position?.y, this.document.y),
  };
  this._maxWidth = this.document.sizeToPoint(
    this.opts.maxWidth,
    this.document.page.width -
      this.document.page.margins.right -
      this._position.x,
  );

  const { defaultStyle, defaultColStyle, defaultRowStyle } =
    normalizedDefaultStyle(this.opts.defaultStyle);
  this._defaultStyle = defaultStyle;

  let colStyle;
  if (this.opts.columnStyles) {
    if (Array.isArray(this.opts.columnStyles)) {
      colStyle = (i) => this.opts.columnStyles[i];
    } else if (typeof this.opts.columnStyles === 'function') {
      colStyle = this.opts.columnStyles;
    } else if (typeof this.opts.columnStyles === 'object') {
      colStyle = () => this.opts.columnStyles;
    }
  }
  if (!colStyle) colStyle = () => ({});
  this._colStyle = normalizedColumnStyle.bind(this, defaultColStyle, colStyle);

  let rowStyle;
  if (this.opts.rowStyles) {
    if (Array.isArray(this.opts.rowStyles)) {
      rowStyle = (i) => this.opts.rowStyles[i];
    } else if (typeof this.opts.rowStyles === 'function') {
      rowStyle = this.opts.rowStyles;
    } else if (typeof this.opts.rowStyles === 'object') {
      rowStyle = () => this.opts.rowStyles;
    }
  }
  if (!rowStyle) rowStyle = () => ({});
  this._rowStyle = normalizedRowStyle.bind(this, defaultRowStyle, rowStyle);
}

/**
 * Convert text into a string
 * - null and undefined are preserved (as they will be ignored)
 * - everything else is run through `String()`
 *
 * @param {*} text
 * @returns {string}
 * @private
 */
export function normalizeText(text) {
  // Parse out text
  if (text !== null && text !== undefined) text = String(text);
  return text;
}

/**
 * Normalize a cell config
 *
 * @this PDFTable
 * @memberOf PDFTable
 * @param {TableCellStyle} cell - The cell to mutate
 * @param {number} rowIndex - The cells row
 * @param {number} colIndex - The cells column
 * @returns {NormalizedTableCellStyle}
 * @private
 */
export function normalizeCell(cell, rowIndex, colIndex) {
  const colStyle = this._colStyle(colIndex);
  let rowStyle = this._rowStyle(rowIndex);

  const font = deepMerge({}, colStyle.font, rowStyle.font, cell.font);

  // Initialize cell context
  const rollbackFont = this.document._fontSource;
  const rollbackFontSize = this.document._fontSize;
  const rollbackFontFamily = this.document._fontFamily;
  if (font.src) this.document.font(font.src, font.family);
  if (font.size) this.document.fontSize(font.size);

  // Refetch rowStyle to reflect font changes
  rowStyle = this._rowStyle(rowIndex);

  COLUMN_FIELDS.forEach((f) => delete colStyle[f]);
  ROW_FIELDS.forEach((f) => delete rowStyle[f]);

  cell.padding = normalizeSides(cell.padding);
  cell.border = normalizeSides(cell.border);
  cell.borderColor = normalizeSides(cell.borderColor);

  // Cell takes highest priority, then row, then column, then defaultConfig
  const config = deepMerge(this._defaultStyle, colStyle, rowStyle, cell, {
    rowIndex,
    colIndex,
    font,
  });

  // Normalize config
  config.text = normalizeText(config.text);
  config.rowSpan = config.rowSpan ?? 1;
  config.colSpan = config.colSpan ?? 1;
  config.padding = normalizeSides(config.padding, '0.25em', (x) =>
    this.document.sizeToPoint(x, '0.25em'),
  );
  config.border = normalizeSides(config.border, 1, (x) =>
    this.document.sizeToPoint(x, 1),
  );
  config.borderColor = normalizeSides(
    config.borderColor,
    'black',
    (x) => x ?? 'black',
  );
  config.align =
    config.align === undefined || typeof config.align === 'string'
      ? { x: config.align, y: config.align }
      : config.align;
  config.align.x = config.align.x ?? 'left';
  config.align.y = config.align.y ?? 'top';
  config.textStroke = this.document.sizeToPoint(config.textStroke, 0);
  config.textStrokeColor = config.textStrokeColor ?? 'black';
  config.textColor = config.textColor ?? 'black';
  config.textOptions = config.textOptions ?? {};

  // Accessibility settings
  config.id = new String(config.id ?? `${this._id}-${rowIndex}-${colIndex}`);
  config.type = config.type?.toUpperCase() === 'TH' ? 'TH' : 'TD';
  config.scope = config.scope?.toLowerCase();
  if (config.scope === "row") config.scope = "Row"
  else if (config.scope === "both") config.scope = "Both"
  else if (config.scope === "column") config.scope = "Column"

  if (this.opts.debug !== undefined) config.debug = this.opts.debug;

  this.document.font(rollbackFont, rollbackFontFamily, rollbackFontSize);

  return config;
}

/**
 * Normalize a row
 *
 * @this PDFTable
 * @memberOf PDFTable
 * @param {TableCell[]} row
 * @param {number} rowIndex
 * @returns {NormalizedTableCellStyle[]}
 * @private
 */
export function normalizeRow(row, rowIndex) {
  if (!this._cellClaim) this._cellClaim = new Set();

  let colIndex = 0;
  return row.map((cell) => {
    // Ensure TableCell
    if (cell === null || cell === undefined || typeof cell !== 'object') {
      cell = { text: cell };
    }
    cell = definedProps(cell);

    // Find the starting column of the cell
    // Skipping over the claimed cells
    while (this._cellClaim.has(`${rowIndex},${colIndex}`)) {
      colIndex++;
    }

    cell = normalizeCell.call(this, cell, rowIndex, colIndex);

    // Claim any spanning cells
    for (let i = 0; i < cell.rowSpan; i++) {
      for (let j = 0; j < cell.colSpan; j++) {
        this._cellClaim.add(`${rowIndex + i},${colIndex + j}`);
      }
    }

    colIndex += cell.colSpan;
    return cell;
  });
}
