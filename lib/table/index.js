import { normalizeRow, normalizeTable } from "./normalize";
import { applyHeights, measure } from "./size";
import { renderRow } from "./render";

class PDFTable {
  /**
   * @param {PDFDocument} document
   * @param {Table} [opts]
   */
  constructor(document, opts = {}) {
    this.document = document;
    this.opts = Object.freeze(opts);

    normalizeTable.call(this);

    this._currRowIndex = 0;
    this._ended = false;

    // Render cells if present
    if (opts.data) {
      if (Symbol.asyncIterator in opts.data) {
        return (async () => {
          for await (const row of opts.data) {
            if (Symbol.asyncIterator in row) await this.rowAsync(row)
            else this.row(row);
          }
          return this.end()
        })()
      } else {
        for (const row of opts.data) this.row(row);
        return this.end();
      }
    }
  }

  /**
   * Render a new row in the table
   *
   * @param {Iterable<TableCell>} row - The cells to render
   * @param {boolean} lastRow - Whether this row is the last row
   * @returns {this}
   */
  row(row, lastRow = false) {
    if (this._ended) {
      throw new Error(`Table was marked as ended on row ${this._currRowIndex}`);
    }

    if (this._currRowIndex === 0) {
      this._struct = this.document.struct("Table");
      this.document.addStructure(this._struct);
    }

    // Convert the iterable into an array
    row = Array.from(row);
    // Transform row
    row = normalizeRow.call(this, row, this._currRowIndex);
    row = measure.call(this, row, this._currRowIndex);
    const {newPage, toRender} = applyHeights.call(this, row, this._currRowIndex);
    if (newPage) this.document.continueOnNewPage()
    const yPos = renderRow.call(this, toRender, this._currRowIndex);

    // Position document at base of new row
    this.document.x = this._position.x;
    this.document.y = yPos;

    if (lastRow) {
      return this.end();
    } else {
      this._currRowIndex++;
      return this;
    }
  }

  /**
   * Render a new row in the table
   *
   * @param {AsyncIterable<TableCell>} row - The cells to render
   * @param {boolean} lastRow - Whether this row is the last row
   * @returns {this}
   */
  async rowAsync(row, lastRow = false) {
    return this.row(await Array.fromAsync(row), lastRow)
  }

  /**
   * Indicates to the table that it is finished,
   * allowing the table to flush its cell buffer (which should be empty unless there is rowSpans)
   *
   * @returns {PDFDocument} the document
   */
  end() {
    // Flush any remaining cells
    while (this._rowBuffer?.size) this.row([]);
    this._ended = true;
    return this.document;
  }
}

export default PDFTable;
