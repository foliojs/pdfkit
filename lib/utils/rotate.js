import { cosine, sine } from './math';

/**
 * Rotates around top left corner
 *
 * @example
 * ```
 *       width
 * [x1,y1] > [x2,y2]
 *    ⌃           ⌄ height
 * [x4,y4] < [x3,y3]
 * ```
 *
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {number} angle
 *
 * @returns {[x: number, y: number, width: number, height: number]}
 */
export function rotateBox(x, y, width, height, angle) {
  // No rotation so we can use the existing values
  if (angle === 0) return [x, y, width, height];
  // Use fast computation without explicit trig
  if (angle === 90) return [x, y - width, height, width];
  else if (angle === 180) return [x - width, y - height, width, height];
  else if (angle === 270) return [x - height, y, height, width];

  // Non-trivial values so time for trig
  const cos = cosine(angle);
  const sin = sine(angle);

  const x1 = x,
    y1 = y,
    x2 = x + width * cos,
    y2 = y - width * sin,
    x3 = x + width * cos + height * sin,
    y3 = y - width * sin + height * cos,
    x4 = x + height * sin,
    y4 = y + height * cos,
    xMin = Math.min(x1, x2, x3, x4),
    xMax = Math.max(x1, x2, x3, x4),
    yMin = Math.min(y1, y2, y3, y4),
    yMax = Math.max(y1, y2, y3, y4);

  return [xMin, yMin, xMax - xMin, yMax - yMin];
}
