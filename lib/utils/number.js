const fArray = new Float32Array(1);
const uArray = new Uint32Array(fArray.buffer);

/**
 * PDF numbers are strictly 32bit
 * so convert this number to a 32bit number
 * @see ISO 32000-1 Annex C.2 (real numbers)
 *
 * @param {number} n 64bit number
 * @returns {number} 32bit number
 */
export function PDFNumber(n) {
  const rounded = Math.fround(n);
  if (rounded <= n) return rounded;

  // Will have to perform 32bit float truncation
  fArray[0] = n;

  // Get the 32-bit representation as integer and shift bits
  if (n <= 0) {
    uArray[0] += 1;
  } else {
    uArray[0] -= 1;
  }

  // Return the float value
  return fArray[0];
}
