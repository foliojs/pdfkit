/**
 * @template T
 * @typedef {function(number): T} Dynamic<T | undefined>
 */

/**
 * The value of the contents of a cell
 * @typedef {string | number | boolean | null | undefined} TableCellContent
 */

/** @typedef {Object} TableCellStyle
 *
 * @property {TableCellContent} [content]
 * The content of the table cell
 * @property {number} [rowSpan]
 * Number of rows the cell spans.
 *
 * Defaults to `1`.
 * @property {number} [colSpan]
 * Number of columns the cell spans.
 *
 * Defaults to `1`.
 * @property {SideDefinition<Wideness>} [padding]
 * Controls the padding of the cell content
 *
 * Defaults to `0.25em`
 * @property {SideDefinition<Wideness>} [border]
 * Controls the thickness of the cells borders.
 *
 * Defaults to `[1, 1, 1, 1]`.
 * @property {SideDefinition<PDFColor>} [borderColor]
 * Color of the border on each side of the cell.
 *
 * Defaults to the border color defined by the given table layout, or `black` on all sides.
 * @property {Font} [font]
 * Font options for the cell
 *
 * Defaults to the documents current font
 * @property {PDFColor} [backgroundColor]
 * Set the background color of the cell
 *
 * Defaults to transparent
 * @property {'center' | ExpandedAlign} [align]
 * Sets the text alignment of the cells content
 *
 * Defaults to `{x: 'left', y: 'top'}`
 * @property {Size} [textStroke]
 * Sets the text stroke width of the cells content
 *
 * Defaults to `0`
 * @property {PDFColor} [textStrokeColor]
 * Sets the text stroke color of the cells content
 *
 * Defaults to `black`
 * @property {PDFColor} [textColor]
 * Sets the text color of the cells content
 *
 * Defaults to `black`
 * @property {'TH' | 'TD'} [type]
 * Sets the cell type (for accessibility)
 *
 * Defaults to `TD`
 * @property {boolean} [debug]
 * Whether to show the debug lines for the cell
 *
 * Defaults to `false`
 */
/** @typedef {TableCellContent | TableCellStyle} TableCell **/

/**
 * The width of the column
 *
 * - `*` distributes equally, filling the whole available space
 * - `%` computes the proportion of the max size
 *
 * Defaults to `*`
 * @typedef {Size | '*'} ColumnWidth
 */

/**
 * @typedef {Object} ColumnStyle
 * @extends TableCellStyle
 *
 * @property {ColumnWidth} [width]
 * @property {Size} [minWidth]
 * The minimum width of the column
 *
 * Defaults to `0`
 * @property {Size} [maxWidth]
 * The maximum width of the column
 *
 * Defaults to `undefined` meaning no max
 */
/** @typedef {ColumnStyle | ColumnWidth} Column **/

/**
 * @typedef {Object} NormalizedColumnStyle
 * @extends ColumnStyle
 *
 * @property {number | '*'} width
 * @property {number} minWidth
 * @property {number} maxWidth
 */

/**
 * The height of the row
 *
 * - A fixed value sets an absolute height for every row.
 * - `auto` sets the height based on the content.
 *
 * `%` values are based on page content height
 *
 * Defaults to `auto`
 * @typedef {Size | 'auto'} RowHeight
 */

/**
 * @typedef {Object} RowStyle
 * @extends TableCellStyle
 *
 * @property {RowHeight} [height]
 * @property {Size} [minHeight]
 * The minimum height of the row
 *
 * `%` values are based on page content height
 *
 * Defaults to `0`
 * @property {Size} [maxHeight]
 * The maximum height of the row
 *
 * `%` values are based on page content height
 *
 * Defaults to `undefined` meaning no max
 */
/** @typedef {RowStyle | RowHeight} Row **/

/**
 * @typedef {Object} NormalizedRowStyle
 * @extends RowStyle
 *
 * @property {number | 'auto'} height
 * @property {number} minHeight
 * @property {number} maxHeight
 */

/** @typedef {'left' | 'center' | 'right' | 'justify'} AlignX **/
/** @typedef {'top' | 'center' | 'bottom'} AlignY **/
/**
 * @typedef {Object} ExpandedAlign
 * @property {AlignX} [x]
 * @property {AlignY} [y]
 */

/**
 * @typedef {Object} DefaultTableCellStyle
 *
 * @extends ColumnStyle
 * @extends RowStyle
 * @extends TableCellStyle
 */
/** @typedef {TableCellContent | DefaultTableCellStyle} DefaultTableCell **/

/**
 * @typedef {Object} NormalizedDefaultTableCellStyle
 *
 * @extends NormalizedColumnStyle
 * @extends NormalizedRowStyle
 * @extends TableCellStyle
 */

/**
 * @typedef {Object} NormalizedTableCellStyle
 *
 * @extends NormalizedColumnStyle
 * @extends NormalizedRowStyle
 * @extends TableCellStyle
 *
 * @property {number} rowIndex
 * @property {number} rowSpan
 * @property {number} colIndex
 * @property {number} colSpan
 *
 * @property {string} content
 * @property {Font} font
 * @property {ExpandedSideDefinition<number>} padding
 * @property {ExpandedSideDefinition<number>} border
 * @property {ExpandedSideDefinition<PDFColor>} borderColor
 * @property {ExpandedAlign} align
 * @property {number} textStroke
 * @property {PDFColor} textStrokeColor
 * @property {PDFColor} textColor
 * @property {number} minWidth
 * @property {number} maxWidth
 * @property {number} minHeight
 * @property {number} maxHeight
 */

/**
 * @typedef {Object} PartialSizedNormalizedTableCellStyle
 *
 * @extends {NormalizedTableCellStyle}
 *
 * @property {number} x
 * @property {number} contentX
 * @property {number} width
 * @property {number} contentWidth
 * @property {number} contentAllocatedWidth
 * @property {number} contentHeight
 * @property {object} textOptions
 */

/**
 * @typedef {Object} SizedNormalizedTableCellStyle
 *
 * @extends {PartialSizedNormalizedTableCellStyle}
 *
 * @property {number} y
 * @property {number} contentY
 * @property {number} height
 * @property {number} contentAllocatedHeight
 */

/**
 * @typedef {Object} Table
 *
 * @property {Position} [position]
 * The position of the table
 *
 * Defaults to the current document position `{x: doc.x, y: doc.y}`
 * @property {Size} [maxWidth]
 * The maximum width the table can expand to
 *
 * Defaults to the remaining content width (offset from the tables position)
 * @property {Column | Column[] | Dynamic<Column>} [columnStyles]
 * Column definitions of the table.
 * - A fixed value sets the config for every column
 * - Use an array or a callback function to control the column config for each column individually.
 *
 * Defaults to `auto`
 * @property {Row | Row[] | Dynamic<Row>} [rowStyles]
 * Row definitions of the table.
 * - A fixed value sets the config for every column
 * - Use an array or a callback function to control the row config of each row individually.
 *
 * The given values are ignored for rows whose content is higher.
 *
 * Defaults to `*`.
 * @property {DefaultTableCell} [defaultStyle]
 * Defaults to apply to every cell
 * @property {Iterable<Iterable<TableCell>> | AsyncIterable<Iterable<TableCell> | AsyncIterable<TableCell>>} [data]
 * Two-dimensional iterable that defines the table's data.
 *
 * With the first dimension being the row, and the second being the column
 *
 * If provided the table will be automatically ended after the last row has been written,
 * Otherwise it is up to the user to call `table.end()` or `table.row([], true)`
 * @property {boolean} [debug]
 * Whether to show the debug lines for all the cells
 *
 * Defaults to `false`
 */

/**
 * Fields exclusive to row styles
 * @type {string[]}
 */
export const ROW_FIELDS = ["height", "minHeight", "maxHeight"];
/**
 * Fields exclusive to column styles
 * @type {string[]}
 */
export const COLUMN_FIELDS = ["width", "minWidth", "maxWidth"];
