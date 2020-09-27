/*
PDFNameTree - represents a name tree object
*/

import PDFTree from "./tree";

class PDFNameTree extends PDFTree {
  constructor() {
    super();
  }

  _compareKeys(a, b) {
    return a.localeCompare(b);
  }

  _keysName(k) {
    return "Names";
  }

  _dataForKey(k) {
    return new String(k);
  }
}

export default PDFNameTree;
