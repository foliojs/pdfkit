import { deepMerge, definedProps, normalizeSides } from '../utils';
import { COLUMN_FIELDS, ROW_FIELDS } from './types';

/**
 * Normalize the row config
 * @note The context here is the cell not the document
 *
 * @param {DefaultTableCell} [defaultStyleInternal]
 * @returns {{
 *  defaultStyle: TableCellStyle,
 *  defaultRowStyle: RowStyle,
 *  defaultColStyle: ColumnStyle
 * }}
 * @private
 */
export function normalizedDefaultStyle(defaultStyleInternal) {
  let defaultStyle = defaultStyleInternal;
  // Force object form
  if (typeof defaultStyle !== 'object') defaultStyle = { text: defaultStyle };
  defaultStyle = definedProps(defaultStyle);

  const defaultRowStyle = Object.fromEntries(
    Object.entries(defaultStyle).filter(([k]) => ROW_FIELDS.includes(k)),
  );
  const defaultColStyle = Object.fromEntries(
    Object.entries(defaultStyle).filter(([k]) => COLUMN_FIELDS.includes(k)),
  );

  defaultStyle.padding = normalizeSides(defaultStyle.padding);
  defaultStyle.border = normalizeSides(defaultStyle.border);
  defaultStyle.borderColor = normalizeSides(defaultStyle.borderColor);
  defaultStyle.align =
    defaultStyle.align === undefined || typeof defaultStyle.align === 'string'
      ? { x: defaultStyle.align, y: defaultStyle.align }
      : defaultStyle.align;

  COLUMN_FIELDS.forEach((f) => delete defaultStyle[f]);
  ROW_FIELDS.forEach((f) => delete defaultStyle[f]);

  return { defaultStyle, defaultRowStyle, defaultColStyle };
}

/**
 * Normalize the row config
 *
 * @note The context here is the cell not the document
 *
 * @this PDFTable
 * @memberOf PDFTable
 * @param {RowStyle} defaultRowStyle
 * @param {Dynamic<Row>} rowStyleInternal
 * @param {number} i The target row
 * @returns {NormalizedRowStyle}
 * @private
 */
export function normalizedRowStyle(defaultRowStyle, rowStyleInternal, i) {
  let rowStyle = rowStyleInternal(i);
  // Force object form
  if (
    rowStyle === null ||
    rowStyle === undefined ||
    typeof rowStyle !== 'object'
  ) {
    rowStyle = { height: rowStyle };
  }
  // Normalize
  rowStyle.padding = normalizeSides(rowStyle.padding);
  rowStyle.border = normalizeSides(rowStyle.border);
  rowStyle.borderColor = normalizeSides(rowStyle.borderColor);
  rowStyle.align =
    rowStyle.align === undefined || typeof rowStyle.align === 'string'
      ? { x: rowStyle.align, y: rowStyle.align }
      : rowStyle.align;

  // Merge defaults
  rowStyle = deepMerge(defaultRowStyle, rowStyle);

  if (
    rowStyle.height === null ||
    rowStyle.height === undefined ||
    rowStyle.height === 'auto'
  ) {
    rowStyle.height = 'auto';
  } else {
    rowStyle.height = this.document.sizeToPoint(
      rowStyle.height,
      0,
      this.document.page,
      this.document.page.contentHeight,
    );
  }
  rowStyle.minHeight = this.document.sizeToPoint(
    rowStyle.minHeight,
    0,
    this.document.page,
    this.document.page.contentHeight,
  );
  rowStyle.maxHeight = this.document.sizeToPoint(
    rowStyle.maxHeight,
    0,
    this.document.page,
    this.document.page.contentHeight,
  );

  return definedProps(rowStyle);
}

/**
 * Normalize the column config
 *
 * @note The context here is the document not the cell
 *
 * @param {ColumnStyle} defaultColStyle
 * @param {Dynamic<Column>} colStyleInternal
 * @param {number} i - The target column
 * @returns {NormalizedColumnStyle}
 * @private
 */
export function normalizedColumnStyle(defaultColStyle, colStyleInternal, i) {
  let colStyle = colStyleInternal(i);
  // Force object form
  if (
    colStyle === null ||
    colStyle === undefined ||
    typeof colStyle !== 'object'
  ) {
    colStyle = { width: colStyle };
  }
  // Normalize
  colStyle.padding = normalizeSides(colStyle.padding);
  colStyle.border = normalizeSides(colStyle.border);
  colStyle.borderColor = normalizeSides(colStyle.borderColor);
  colStyle.align =
    colStyle.align === undefined || typeof colStyle.align === 'string'
      ? { x: colStyle.align, y: colStyle.align }
      : colStyle.align;

  // Merge defaults
  colStyle = deepMerge(defaultColStyle, colStyle);

  if (
    colStyle.width === null ||
    colStyle.width === undefined ||
    colStyle.width === '*'
  ) {
    colStyle.width = '*';
  } else {
    colStyle.width = this.document.sizeToPoint(
      colStyle.width,
      0,
      this.document.page,
      this._maxWidth, // Use table width here for percentage scaling
    );
  }
  colStyle.minWidth = this.document.sizeToPoint(
    colStyle.minWidth,
    0,
    this.document.page,
    this._maxWidth, // Use table width here for percentage scaling
  );
  colStyle.maxWidth = this.document.sizeToPoint(
    colStyle.maxWidth,
    0,
    this.document.page,
    this._maxWidth, // Use table width here for percentage scaling
  );

  return definedProps(colStyle);
}
