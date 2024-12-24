/**
 * Measurement of size
 *
 * @typedef {number | `${number}` | `${number}${'em' | 'in' | 'px' | 'cm' | 'mm' | 'pc' | 'ex' | 'ch' | 'rem' | 'vw' | 'vmin' | 'vmax' | '%' | 'pt'}`} Size
 */

/**
 * Measurement of how wide something is, false means 0 and true means 1
 *
 * @typedef {Size | boolean} Wideness
 */

/**
 * Side definitions
 * - To define all sides, use a single value
 * - To define up-down left-right, use a `[Y, X]` array
 * - To define each side, use `[top, right, bottom, left]` array
 * - Or `{vertical: SideValue, horizontal: SideValue}`
 * - Or `{top: SideValue, right: SideValue, bottom: SideValue, left: SideValue}`
 *
 * @template T
 * @typedef {T| [T, T]| [T, T, T, T]| { vertical: T; horizontal: T }| { top: T; right: T; bottom: T; left: T }} SideDefinition<T>
 **/

/**
 * @template T
 * @typedef {{ top: T; right: T; bottom: T; left: T }} ExpandedSideDefinition<T>
 */

/**
 * Convert any side definition into a static structure
 *
 * @template T
 * @template D
 * @template O
 * @param {SideDefinition<T>} sides The sides to convert
 * @param {SideDefinition<D>} defaultDefinition The value to use when no definition is provided
 * @param {(v: T | D) => O} transformer The transformation to apply to the sides once normalized
 * @returns {ExpandedSideDefinition<O>}
 */
export function normalizeSides(
  sides,
  defaultDefinition = undefined,
  transformer = v => v
) {
  if (sides === undefined) sides = defaultDefinition;
  if (typeof sides !== 'object' || sides === null) sides = [sides, sides, sides, sides];
  if (Array.isArray(sides)) {
    if (sides.length === 2) sides = { vertical: sides[0], horizontal: sides[1] };
    else sides = { top: sides[0], right: sides[1], bottom: sides[2], left: sides[3] };
  }

  if ('vertical' in sides && 'horizontal' in sides) {
    sides = { top: sides.vertical, right: sides.horizontal, bottom: sides.vertical, left: sides.horizontal };
  }

  if (!('top' in sides && 'right' in sides && 'bottom' in sides && 'left' in sides)) {
    sides = { top: sides, right: sides, bottom: sides, left: sides };
  }

  return {
    top: transformer(sides.top),
    right: transformer(sides.right),
    bottom: transformer(sides.bottom),
    left: transformer(sides.left)
  };
}

export const MM_TO_CM = 1 / 10; // 1MM = 1CM
export const CM_TO_IN = 1 / 2.54; // 1CM = 1/2.54 IN
export const PX_TO_IN = 1 / 96; // 1 PX = 1/96 IN
export const IN_TO_PT = 72; // 1 IN = 72 PT
export const PC_TO_PT = 12; // 1 PC = 12 PT
