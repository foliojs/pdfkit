/**
 * Get cosine in degrees of a
 *
 * Rounding errors are handled
 * @param {number} a
 * @returns {number}
 */
export function cosine(a) {
  if (a === 0) return 1;
  if (a === 90) return 0;
  if (a === 180) return -1;
  if (a === 270) return 0;
  return Math.cos((a * Math.PI) / 180);
}

/**
 * Get sine in degrees of a
 *
 * Rounding errors are handled
 * @param {number} a
 * @returns {number}
 */
export function sine(a) {
  if (a === 0) return 0;
  if (a === 90) return 1;
  if (a === 180) return 0;
  if (a === 270) return -1;
  return Math.sin((a * Math.PI) / 180);
}
