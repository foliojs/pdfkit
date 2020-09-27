/*
PDFNumberTree - represents a number tree object
*/

import PDFTree from "./tree";

class PDFNumberTree extends PDFTree {
  constructor() {
    super();
  }

  _compareKeys(a, b) {
    return parseInt(a) - parseInt(b);
  }

  _keysName(k) {
    return "Nums";
  }

  _dataForKey(k) {
    return parseInt(k);
  }
}

export default PDFNumberTree;
