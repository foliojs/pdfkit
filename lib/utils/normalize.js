/** @typedef {'left' | 'center' | 'right' | 'justify'} AlignX **/
/** @typedef {'top' | 'center' | 'bottom'} AlignY **/
/**
 * @typedef {Object} ExpandedAlign
 * @property {AlignX} [x]
 * @property {AlignY} [y]
 */
/** @typedef {'center' | ExpandedAlign} Align */

/**
 * Convert any alignment definition into a static structure
 *
 * @param {Align} align
 * @param {ExpandedAlign} defaults
 * @returns {ExpandedAlign}
 */
export function normalizeAlignment(align, defaults) {
  if (align == null || typeof align === 'string') {
    align = { x: align, y: align };
  }

  if (defaults) {
    align.x = align.x ?? defaults.x;
    align.y = align.y ?? defaults.y;
  }
  return align;
}

/**
 * Convert any side definition into a static structure
 *
 * @template S
 * @template D
 * @template O
 * @template {S | D} T
 * @param {SideDefinition<S>} sides - The sides to convert
 * @param {SideDefinition<D>} defaultDefinition - The value to use when no definition is provided
 * @param {function(T): O} transformer - The transformation to apply to the sides once normalized
 * @returns {ExpandedSideDefinition<O>}
 */
export function normalizeSides(
  sides,
  defaultDefinition = undefined,
  transformer = (v) => v,
) {
  if (
    sides == null ||
    (typeof sides === 'object' && Object.keys(sides).length === 0)
  ) {
    sides = defaultDefinition;
  }
  if (sides == null || typeof sides !== 'object') {
    sides = { top: sides, right: sides, bottom: sides, left: sides };
  } else if (Array.isArray(sides)) {
    if (sides.length === 2) {
      sides = { vertical: sides[0], horizontal: sides[1] };
    } else {
      sides = {
        top: sides[0],
        right: sides[1],
        bottom: sides[2],
        left: sides[3],
      };
    }
  }

  if ('vertical' in sides || 'horizontal' in sides) {
    sides = {
      top: sides.vertical,
      right: sides.horizontal,
      bottom: sides.vertical,
      left: sides.horizontal,
    };
  }

  return {
    top: transformer(sides.top),
    right: transformer(sides.right),
    bottom: transformer(sides.bottom),
    left: transformer(sides.left),
  };
}

export function normalizeRotation(rot, defaultValue = 0) {
  rot = (rot ?? defaultValue) % 360;
  if (rot < 0) rot += 360;
  return rot;
}
