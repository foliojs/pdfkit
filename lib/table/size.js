/**
 * Compute the widths of the columns, ensuring to distribute the star widths
 *
 * @this PDFTable
 * @memberOf PDFTable
 * @param {NormalizedTableCellStyle[]} row
 * @param {number} rowIndex
 *
 * @returns {PartialSizedNormalizedTableCellStyle[]}
 * @private
 */
export function measure(row, rowIndex) {
  if (rowIndex === 0) {
    ensureColumnWidths.call(
      this,
      row.reduce((a, cell) => a + cell.colSpan, 0),
    );
  }

  return row.map((cell) => {
    let cellWidth = 0;

    // Traverse all the columns of the cell
    for (let i = 0; i < cell.colSpan; i++) {
      cellWidth += this._columnWidths[cell.colIndex + i];
    }

    const contentAllocatedWidth =
      cellWidth - cell.padding.left - cell.padding.right;

    const textOptions = {
      align: cell.align.x,
      ellipsis: true,
      stroke: cell.textStroke > 0,
      fill: true,
      width: contentAllocatedWidth,
    };

    let contentWidth = 0;
    let contentHeight = 0;
    if (cell.content) {
      const rollbackFont = this.document._fontSource;
      const rollbackFontSize = this.document._fontSize;
      const rollbackFontFamily = this.document._fontFamily;
      if (cell.font?.src) this.document.font(cell.font.src, cell.font?.family);
      if (cell.font?.size) this.document.fontSize(cell.font.size);

      // Compute the width and height of the content
      ({ width: contentWidth, height: contentHeight } =
        this.document.boundsOfString(cell.content, textOptions));

      this.document.font(rollbackFont, rollbackFontFamily, rollbackFontSize);
    }

    return {
      ...cell,
      width: cellWidth,
      contentAllocatedWidth,
      contentWidth,
      contentHeight,
      textOptions,
      x: this._columnXPos[cell.colIndex],
      contentX: this._columnXPos[cell.colIndex] + cell.padding.left,
    };
  });
}

/**
 * Compute the widths of the columns, ensuring to distribute the star widths
 *
 * @this PDFTable
 * @memberOf PDFTable
 * @param {number} numCols
 * @private
 */
function ensureColumnWidths(numCols) {
  /** @type number[] **/
  this._columnWidths = [];

  // Compute the widths
  let starColumnIndexes = [];
  let starMinAcc = 0;
  let unclaimedWidth = this._maxWidth;

  for (let i = 0; i < numCols; i++) {
    let col = this._colStyle(i);
    if (col.width === "*") {
      starColumnIndexes[i] = col;
      starMinAcc += col.minWidth;
    } else {
      unclaimedWidth -= col.width;
      this._columnWidths[i] = col.width;
    }
  }

  let starColCount = starColumnIndexes.reduce((x) => x + 1, 0);

  if (starMinAcc >= unclaimedWidth) {
    // case 1 - there's no way to fit all columns within available width
    // that's actually pretty bad situation with PDF as we have no horizontal scroll
    starColumnIndexes.forEach((cell, i) => {
      this._columnWidths[i] = cell.minWidth;
    });
  } else if (starColCount > 0) {
    // Otherwise we distribute evenly factoring in the cell bounds
    starColumnIndexes.forEach((col, i) => {
      let starSize = unclaimedWidth / starColCount;
      this._columnWidths[i] = Math.max(starSize, col.minWidth);
      if (col.maxWidth > 0) {
        this._columnWidths[i] = Math.min(this._columnWidths[i], col.maxWidth);
      }
      unclaimedWidth -= this._columnWidths[i];
      starColCount--;
    });
  }

  this._columnXPos = this._columnWidths.map((_, i, a) =>
    a.slice(0, i).reduce((a, b) => a + b, this._position.x),
  );
}

/**
 * Compute the widths of the columns, ensuring to distribute the star widths
 *
 * @this PDFTable
 * @memberOf PDFTable
 * @param {PartialSizedNormalizedTableCellStyle[]} row
 * @param {number} rowIndex
 * @returns {{newPage: boolean, toRender: SizedNormalizedTableCellStyle[]}}
 * @private
 */
export function applyHeights(row, rowIndex) {
  if (rowIndex === 0) {
    this._rowHeights = [];
    this._rowYPos = [this._position.y];
    /** @type {Set<PartialSizedNormalizedTableCellStyle>} **/
    this._rowBuffer = new Set();
  }

  // Add cells to buffer
  row.forEach((cell) => this._rowBuffer.add(cell));

  if (rowIndex > 0) {
    this._rowYPos[rowIndex] =
      this._rowYPos[rowIndex - 1] + this._rowHeights[rowIndex - 1];
  }

  // Find any finishing cells
  const toRender = [];
  this._rowBuffer.forEach((cell) => {
    if (cell.rowIndex + cell.rowSpan - 1 === rowIndex) {
      toRender.push(cell);
      this._rowBuffer.delete(cell);
    }
  });

  const rowStyle = this._rowStyle(rowIndex);
  let rowHeight = rowStyle.height;

  if (rowHeight === "auto") {
    // Compute remaining height on cells
    rowHeight = toRender.reduce((acc, cell) => {
      let minHeight =
        cell.contentHeight + cell.padding.top + cell.padding.bottom;
      for (let i = 0; i < cell.rowSpan - 1; i++) {
        minHeight -= this._rowHeights[cell.rowIndex + i];
      }
      return Math.max(acc, minHeight);
    }, 0);
  }

  rowHeight = Math.max(rowHeight, rowStyle.minHeight);
  if (rowStyle.maxHeight > 0) {
    rowHeight = Math.min(rowHeight, rowStyle.maxHeight);
  }
  this._rowHeights[rowIndex] = rowHeight;

  let newPage = false;
  if (rowHeight > this.document.page.contentHeight) {
    // We are unable to render this row on a single page, for now we log a warning and disable the newPage
    console.warn(
      new Error(
        `Row ${rowIndex} requested more than the safe page height, row has been clamped`,
      ).stack.slice(7),
    );
    this._rowHeights[rowIndex] =
      this.document.page.maxY() - this._rowYPos[rowIndex];
  } else if (this._rowYPos[rowIndex] + rowHeight >= this.document.page.maxY()) {
    // If row is going to go over the safe page height then move it over to new page
    this._rowYPos[rowIndex] = this.document.page.margins.top;
    newPage = true;
  }

  return {
    newPage,
    toRender: toRender.map((cell) => {
      let height = 0;
      for (let i = 0; i < cell.rowSpan; i++) {
        height += this._rowHeights[cell.rowIndex + i];
      }

      const contentAllocatedHeight =
        height - cell.padding.top - cell.padding.bottom;
      return {
        ...cell,
        textOptions: { ...cell.textOptions, height: contentAllocatedHeight },
        height,
        y: this._rowYPos[cell.rowIndex],
        contentY: this._rowYPos[cell.rowIndex] + cell.padding.top,
        contentAllocatedHeight,
        // Clamp the content height to the cell (in situations where content will overflow)
        contentHeight: Math.min(contentAllocatedHeight, cell.contentHeight),
      };
    }),
  };
}
