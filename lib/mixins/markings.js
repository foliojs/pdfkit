/*
Markings mixin - support marked content sequences in content streams
By Ben Schmidt
*/

import PDFObject from "../object";

export default {

  markContent(tag, options = null) {
    if (!options) {
      this.page.markings.push({ tag });
      this.addContent(`/${tag} BMC`);
      return this;
    }

    this.page.markings.push({ tag, options });

    const dictionary = {};

    // TODO: add entries to dictionary based on options

    this.addContent(`/${tag} ${PDFObject.convert(dictionary)} BDC`);
    return this;
  },

  endMarkedContent() {
    this.page.markings.pop();
    this.addContent('EMC');
    return this;
  },

  initPageMarkings(pageMarkings) {
    pageMarkings.forEach((marking) => {
      this.markContent(marking.tag, marking.options);
    });
  },

  endPageMarkings(page) {
    const pageMarkings = page.markings;
    pageMarkings.forEach(() => page.write('EMC'));
    page.markings = [];
    return pageMarkings;
  }

};
