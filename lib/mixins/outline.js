// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import PDFOutline from '../outline';

export default {
    initOutline() {
        return this.outline = new PDFOutline(this, null, null, null);
    },

    endOutline() {
        this.outline.endOutline();
        if (this.outline.children.length > 0) {
            this._root.data.Outlines = this.outline.dictionary;
            return this._root.data.PageMode = 'UseOutlines';
        }
    }
};
