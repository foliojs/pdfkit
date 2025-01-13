import PDFStructureElement from '../structure_element';
import PDFDocument from '../document';

/**
 * Add accessibility to a table
 *
 * @this PDFTable
 * @memberOf PDFTable
 * @private
 */
export function accommodateTable() {
  if (this.opts.structParent) {
    this._tableStruct = this.document.struct('Table');
    this._tableStruct.dictionary.data.ID = this._id;
    if (this.opts.structParent instanceof PDFStructureElement) {
      this.opts.structParent.add(this._tableStruct);
    } else if (this.opts.structParent instanceof PDFDocument) {
      this.opts.structParent.addStructure(this._tableStruct);
    }
    this._headerRowLookup = {};
    this._headerColumnLookup = {};
  }
}

/**
 * Cleanup accessibility on a table
 *
 * @this PDFTable
 * @memberOf PDFTable
 * @private
 */
export function accommodateCleanup() {
  if (this._tableStruct) this._tableStruct.end();
}

/**
 * Render a row with all its accessibility features
 *
 * @this PDFTable
 * @memberOf PDFTable
 * @param {SizedNormalizedTableCellStyle[]} row
 * @param {number} rowIndex
 * @param {Function} renderCell
 * @private
 */
export function accessibleRow(row, rowIndex, renderCell) {
  const rowStruct = this.document.struct('TR');
  rowStruct.dictionary.data.ID = new String(`${this._id}-${rowIndex}`);
  this._tableStruct.add(rowStruct);
  row.forEach((cell) => renderCell(cell, rowStruct));
  rowStruct.end();
}

/**
 * Render a cell with all its accessibility features
 *
 * @this PDFTable
 * @memberOf PDFTable
 * @param {SizedNormalizedTableCellStyle} cell
 * @param {PDFStructureElement} rowStruct
 * @param {Function} callback
 * @private
 */
export function accessibleCell(cell, rowStruct, callback) {
  const cellStruct = this.document.struct(cell.type, { title: cell.title });
  cellStruct.dictionary.data.ID = cell.id;

  rowStruct.add(cellStruct);

  const padding = cell.padding;
  const border = cell.border;
  const attributes = {
    O: 'Table',
    Width: cell.width,
    Height: cell.height,
    Padding: [padding.top, padding.bottom, padding.left, padding.right],
    RowSpan: cell.rowSpan > 1 ? cell.rowSpan : undefined,
    ColSpan: cell.colSpan > 1 ? cell.colSpan : undefined,
    BorderThickness: [border.top, border.bottom, border.left, border.right],
  };

  // Claim row Headers
  if (cell.type === 'TH') {
    if (cell.scope === 'Row' || cell.scope === 'Both') {
      for (let i = 0; i < cell.rowSpan; i++) {
        if (!this._headerRowLookup[cell.rowIndex + i]) {
          this._headerRowLookup[cell.rowIndex + i] = [];
        }
        this._headerRowLookup[cell.rowIndex + i].push(cell.id);
      }
      attributes.Scope = cell.scope;
    }
    if (cell.scope === 'Column' || cell.scope === 'Both') {
      for (let i = 0; i < cell.colSpan; i++) {
        if (!this._headerColumnLookup[cell.colIndex + i]) {
          this._headerColumnLookup[cell.colIndex + i] = [];
        }
        this._headerColumnLookup[cell.colIndex + i].push(cell.id);
      }
      attributes.Scope = cell.scope;
    }
  }

  // Find any cells which are marked as headers for this cell
  const Headers = new Set(
    [
      ...Array.from(
        { length: cell.colSpan },
        (_, i) => this._headerColumnLookup[cell.colIndex + i],
      ).flat(),
      ...Array.from(
        { length: cell.rowSpan },
        (_, i) => this._headerRowLookup[cell.rowIndex + i],
      ).flat(),
    ].filter(Boolean),
  );
  if (Headers.size) attributes.Headers = Array.from(Headers);

  if (cell.backgroundColor !== undefined) {
    attributes.BackgroundColor = this.document._normalizeColor(
      cell.backgroundColor,
    );
  }
  const hasBorder = [border.top, border.bottom, border.left, border.right];
  if (hasBorder.some((x) => x)) {
    const borderColor = cell.borderColor;
    attributes.BorderColor = [
      hasBorder[0] ? this.document._normalizeColor(borderColor.top) : null,
      hasBorder[1] ? this.document._normalizeColor(borderColor.bottom) : null,
      hasBorder[2] ? this.document._normalizeColor(borderColor.left) : null,
      hasBorder[3] ? this.document._normalizeColor(borderColor.right) : null,
    ];
  }

  // Remove any undefined attributes
  Object.keys(attributes).forEach(
    (key) => attributes[key] === undefined && delete attributes[key],
  );
  cellStruct.dictionary.data.A = this.document.ref(attributes);
  cellStruct.add(callback);
  cellStruct.end();
  cellStruct.dictionary.data.A.end();
}
