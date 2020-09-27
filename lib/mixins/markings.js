/*
Markings mixin - support marked content sequences in content streams
By Ben Schmidt
*/

import PDFStructureElement from "../structure_element";
import PDFStructureContent from "../structure_content";
import PDFNumberTree from "../number_tree";
import PDFObject from "../object";

export default {

  initMarkings() {
    this.structChildren = [];
  },

  markContent(tag, options = null) {
    if (!options) {
      this.page.markings.push({ tag });
      this.addContent(`/${tag} BMC`);
      return this;
    }

    this.page.markings.push({ tag, options });

    const dictionary = {};

    if (typeof options.mcid !== 'undefined') {
      dictionary.MCID = options.mcid;
    }

    this.addContent(`/${tag} ${PDFObject.convert(dictionary)} BDC`);
    return this;
  },

  markStructureContent(tag, options = {}) {
    let toClose = 0;
    this.page.markings.forEach((marking) => {
      if (toClose || marking.structContent) {
        toClose++;
      }
    });
    while (toClose--) {
      this.endMarkedContent();
    }

    const pageStructParents = this.getStructParentTree().get(this.page.structParentTreeKey);
    const mcid = pageStructParents.length;
    pageStructParents.push(null);

    this.markContent(tag, { ...options, mcid });

    const structContent = new PDFStructureContent(this.page.dictionary, mcid);
    this.page.markings.slice(-1)[0].structContent = structContent;
    return structContent;
  },

  endMarkedContent() {
    this.page.markings.pop();
    this.addContent('EMC');
    return this;
  },

  struct(type, options = {}, children = null) {
    return new PDFStructureElement(this, type, options, children);
  },

  addStructure(structElem) {
    const structTreeRoot = this.getStructTreeRoot();
    structElem.setParent(structTreeRoot);
    this.structChildren.push(structElem);
    if (!structTreeRoot.data.K) {
      structTreeRoot.data.K = [];
    }
    structTreeRoot.data.K.push(structElem.dictionary);
    return this;
  },

  initPageMarkings(pageMarkings) {
    pageMarkings.forEach((marking) => {
      if (marking.structContent) {
        const structContent = marking.structContent;
        const newStructContent = this.markStructureContent(marking.tag, marking.options);
        structContent.push(newStructContent);
        this.page.markings.slice(-1)[0].structContent = structContent;
      } else {
        this.markContent(marking.tag, marking.options);
      }
    });
  },

  endPageMarkings(page) {
    const pageMarkings = page.markings;
    pageMarkings.forEach(() => page.write('EMC'));
    page.markings = [];
    return pageMarkings;
  },

  getMarkingsDictionary() {
    if (!this._root.data.Markings) {
      this._root.data.Markings = this.ref({});
    }
    return this._root.data.Markings;
  },

  getStructTreeRoot() {
    if (!this._root.data.StructTreeRoot) {
      this._root.data.StructTreeRoot = this.ref({
        Type: "StructTreeRoot",
        ParentTree: new PDFNumberTree(),
        ParentTreeNextKey: 0
      });
    }
    return this._root.data.StructTreeRoot;
  },

  getStructParentTree() {
    return this.getStructTreeRoot().data.ParentTree;
  },

  createStructParentTreeNextKey() {
    // initialise the Markings dictionary
    this.getMarkingsDictionary();

    const structTreeRoot = this.getStructTreeRoot();
    const key = structTreeRoot.data.ParentTreeNextKey++;
    structTreeRoot.data.ParentTree.add(key, []);
    return key;
  },

  endMarkings() {
    const structTreeRoot = this._root.data.StructTreeRoot;
    if (structTreeRoot) {
      structTreeRoot.end();
      this.structChildren.forEach((structElem) => structElem.end());
    }
    if (this._root.data.Markings) {
      this._root.data.Markings.end();
    }
  }

};
