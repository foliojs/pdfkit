/*
PDFStructureElement - represents an element in the PDF logical structure tree
By Ben Schmidt
*/

import PDFStructureContent from "./structure_content";

class PDFStructureElement {
  constructor(document, type, options = {}, children = null) {
    this.document = document;

    this._ended = false;
    this.dictionary = document.ref({
      // Type: "StructElem",
      S: type
    });

    const data = this.dictionary.data;

    if (Array.isArray(options)) {
      children = options;
      options = {};
    }

    if (typeof options.title !== 'undefined') {
      data.T = new String(options.title);
    }
    if (typeof options.lang !== 'undefined') {
      data.Lang = new String(options.lang);
    }
    if (typeof options.alt !== 'undefined') {
      data.Alt = new String(options.alt);
    }
    if (typeof options.expanded !== 'undefined') {
      data.E = new String(options.expanded);
    }
    if (typeof options.actual !== 'undefined') {
      data.ActualText = new String(options.actual);
    }

    this.structElemChildren = [];

    if (children) {
      children.forEach((child) => this.add(child));
      this.end();
    }
  }

  add(child) {
    if (this._ended) {
      throw new Error(`Cannot add child to already-ended structure element`);
    }

    if (!this.dictionary.data.K) {
      this.dictionary.data.K = [];
    }

    if (!(child instanceof PDFStructureElement || child instanceof PDFStructureContent)) {
      throw new Error(`Invalid structure element child`);
    }

    if (child instanceof PDFStructureElement) {
      child.setParent(this.dictionary);
      this.structElemChildren.push(child);
      this.dictionary.data.K.push(child.dictionary);
    }

    if (child instanceof PDFStructureContent) {
      child.refs.forEach(({ pageRef, mcid }) => {
        if (!this.dictionary.data.Pg) {
          this.dictionary.data.Pg = pageRef;
        }

        if (this.dictionary.data.Pg === pageRef) {
          this.dictionary.data.K.push(mcid);
        } else {
          this.dictionary.data.K.push({
            Type: "MCR",
            Pg: pageRef,
            MCID: mcid
          });
        }

        const pageStructParents = this.document.getStructParentTree()
          .get(pageRef.data.StructParents);
        pageStructParents[mcid] = this.dictionary;
      });
    }

    return this;
  }

  setParent(parentRef) {
    if (this.dictionary.data.P) {
      throw new Error(`Structure element added to more than one parent`);
    }

    this.dictionary.data.P = parentRef;

    if (this._ended) {
      this._flush();
    }
  }

  end() {
    if (this._ended) {
      return;
    }

    this.structElemChildren.forEach((child) => child.end());

    this._ended = true;

    if (this.dictionary.data.P) {
      this._flush();
    }
  }

  _flush() {
    this.dictionary.end();

    // free memory used by children; the dictionary itself may still be
    // referenced by a parent structure element or root, but we can
    // at least trim the tree here
    this.structElemChildren = [];
    this.dictionary.data.K = null;
  }
}

export default PDFStructureElement;
