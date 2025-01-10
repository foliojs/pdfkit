export function PDFNumber(n) {
  // PDF numbers are strictly 32bit
  // so convert this number to the nearest 32bit number
  // @see ISO 32000-1 Annex C.2 (real numbers)
  return Math.fround(n);
}
