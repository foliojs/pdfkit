import { accessibleCell, accessibleRow } from './accessibility';

/**
 * Render a cell
 *
 * @this PDFTable
 * @memberOf PDFTable
 * @param {SizedNormalizedTableCellStyle[]} row
 * @param {number} rowIndex
 * @private
 */
export function renderRow(row, rowIndex) {
  if (this._tableStruct) {
    accessibleRow.call(this, row, rowIndex, renderCell.bind(this));
  } else {
    row.forEach((cell) => renderCell.call(this, cell));
  }

  return this._rowYPos[rowIndex] + this._rowHeights[rowIndex];
}

/**
 * Render a cell
 *
 * @this PDFTable
 * @memberOf PDFTable
 * @param {SizedNormalizedTableCellStyle} cell
 * @param {PDFStructureElement} rowStruct
 * @private
 */
function renderCell(cell, rowStruct) {
  const cellRenderer = () => {
    // Render cell background
    if (cell.backgroundColor !== undefined) {
      this.document
        .save()
        .rect(cell.x, cell.y, cell.width, cell.height)
        .fill(cell.backgroundColor)
        .restore();
    }

    // Render border
    renderBorder.call(
      this,
      cell.border,
      cell.borderColor,
      cell.x,
      cell.y,
      cell.width,
      cell.height,
    );

    // Debug cell borders
    if (cell.debug) {
      this.document.save();
      this.document.dash(1, { space: 1 }).lineWidth(1).strokeOpacity(0.3);

      // Debug cell bounds
      this.document
        .rect(cell.x, cell.y, cell.width, cell.height)
        .stroke('green');

      this.document.restore();
    }

    // Render text
    if (cell.text) renderCellText.call(this, cell);
  };

  if (rowStruct) accessibleCell.call(this, cell, rowStruct, cellRenderer);
  else cellRenderer();
}

/**
 * @this PDFTable
 * @memberOf PDFTable
 * @param {SizedNormalizedTableCellStyle} cell
 */
function renderCellText(cell) {
  // Configure fonts
  const rollbackFont = this.document._fontSource;
  const rollbackFontSize = this.document._fontSize;
  const rollbackFontFamily = this.document._fontFamily;
  if (cell.font?.src) this.document.font(cell.font.src, cell.font?.family);
  if (cell.font?.size) this.document.fontSize(cell.font.size);

  const x = cell.textX;
  const y = cell.textY;
  const Ah = cell.textAllocatedHeight;
  const Aw = cell.textAllocatedWidth;
  const Cw = cell.textBounds.width;
  const Ch = cell.textBounds.height;
  const Ox = -cell.textBounds.x;
  const Oy = -cell.textBounds.y;

  const PxScale =
    cell.align.x === 'right' ? 1 : cell.align.x === 'center' ? 0.5 : 0;
  const Px = (Aw - Cw) * PxScale;
  const PyScale =
    cell.align.y === 'bottom' ? 1 : cell.align.y === 'center' ? 0.5 : 0;
  const Py = (Ah - Ch) * PyScale;

  const dx = Px + Ox;
  const dy = Py + Oy;

  if (cell.debug) {
    this.document.save();
    this.document.dash(1, { space: 1 }).lineWidth(1).strokeOpacity(0.3);

    // Debug actual text bounds
    if (cell.text) {
      this.document
        .moveTo(x + Px, y)
        .lineTo(x + Px, y + Ah)
        .moveTo(x + Px + Cw, y)
        .lineTo(x + Px + Cw, y + Ah)
        .stroke('blue')
        .moveTo(x, y + Py)
        .lineTo(x + Aw, y + Py)
        .moveTo(x, y + Py + Ch)
        .lineTo(x + Aw, y + Py + Ch)
        .stroke('green');
    }
    // Debug allocated text bounds
    this.document.rect(x, y, Aw, Ah).stroke('orange');

    this.document.restore();
  }

  // Create text mask to cut off any overflowing text
  // Mask cuts off at the padding not the actual cell, this is intentional!
  this.document.save().rect(x, y, Aw, Ah).clip();

  this.document.fillColor(cell.textColor).strokeColor(cell.textStrokeColor);
  if (cell.textStroke > 0) this.document.lineWidth(cell.textStroke);

  // Render the text
  this.document.text(cell.text, x + dx, y + dy, cell.textOptions);

  // Cleanup
  this.document.restore();
  this.document.font(rollbackFont, rollbackFontFamily, rollbackFontSize);
}

/**
 * @this PDFTable
 * @memberOf PDFTable
 * @param {ExpandedSideDefinition<number>} border
 * @param {ExpandedSideDefinition<PDFColor>} borderColor
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number[]} [mask]
 * @private
 */
function renderBorder(border, borderColor, x, y, width, height, mask) {
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
        .rect(x, y, width, height)
        .stroke(borderColor.top)
        .restore();
    }
  } else {
    // Top
    if (computedBorder.top > 0) {
      this.document
        .save()
        .lineWidth(computedBorder.top)
        .polygon([x, y], [x + width, y])
        .stroke(borderColor.top)
        .restore();
    }
    // Right
    if (computedBorder.right > 0) {
      this.document
        .save()
        .lineWidth(computedBorder.right)
        .polygon([x + width, y], [x + width, y + height])
        .stroke(borderColor.right)
        .restore();
    }
    // Bottom
    if (computedBorder.bottom > 0) {
      this.document
        .save()
        .lineWidth(computedBorder.bottom)
        .polygon([x + width, y + height], [x, y + height])
        .stroke(borderColor.bottom)
        .restore();
    }
    // Left
    if (computedBorder.left > 0) {
      this.document
        .save()
        .lineWidth(computedBorder.left)
        .polygon([x, y + height], [x, y])
        .stroke(borderColor.left)
        .restore();
    }
  }
}
