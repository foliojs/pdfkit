/**
 * Measurement of size
 *
 * @typedef {number | `${number}` | `${number}${'em' | 'in' | 'px' | 'cm' | 'mm' | 'pc' | 'ex' | 'ch' | 'rem' | 'vw' | 'vmin' | 'vmax' | '%' | 'pt'}`} Size
 */

/**
 * @typedef {Array<PDFTilingPattern | PDFColor> | NamedColor | [number, number, number] | [number, number, number, number]} PDFColor
 */

/** @typedef {string | Buffer | Uint8Array | ArrayBuffer} PDFFontSource */

/**
 * Side definitions
 * - To define all sides, use a single value
 * - To define up-down left-right, use a `[Y, X]` array
 * - To define each side, use `[top, right, bottom, left]` array
 * - Or `{vertical: SideValue, horizontal: SideValue}`
 * - Or `{top: SideValue, right: SideValue, bottom: SideValue, left: SideValue}`
 *
 * @template T
 * @typedef {T | [T, T] | [T, T, T, T] | { vertical: T; horizontal: T } | ExpandedSideDefinition<T>} SideDefinition<T>
 **/

/**
 * @template T
 * @typedef {{ top: T; right: T; bottom: T; left: T }} ExpandedSideDefinition<T>
 */

/**
 * @typedef {Object} Font
 * @property {PDFFontSource} [src]
 * The name of the font
 *
 * Defaults to the current document font source
 * @property {string} [family]
 * The font family of the font
 *
 * Defaults to the current document font family
 * @property {Size} [size]
 * The size of the font
 *
 * Defaults to the current document font size
 */
