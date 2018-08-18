// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class PDFFont {    
  constructor() {
    throw new Error('Cannot construct a PDFFont directly.');
  }
    
  encode(text) {
    throw new Error('Must be implemented by subclasses');
  }
      
  widthOfString(text) {
    throw new Error('Must be implemented by subclasses');
  }
    
  ref() {
    return this.dictionary != null ? this.dictionary : (this.dictionary = this.document.ref());
  }
    
  finalize() {
    if (this.embedded || (this.dictionary == null)) { return; }

    this.embed();
    return this.embedded = true;
  }
    
  embed() {
    throw new Error('Must be implemented by subclasses');
  }
      
  lineHeight(size, includeGap) {
    if (includeGap == null) { includeGap = false; }
    const gap = includeGap ? this.lineGap : 0;
    return (((this.ascender + gap) - this.descender) / 1000) * size;
  }
}
  
export default PDFFont;
