/*
PDFNameTree - represents a name tree object
*/

import PDFTree from './tree';

class PDFNameTree extends PDFTree {
  _compareKeys(a, b) {
    // Readers look a key up expecting the keys in ascending byte order
    // (ISO 32000-1, 7.9.6). Character codes compare in that order for ASCII
    // keys, while `localeCompare` puts `appendix` before `Chapter1`.
    return a < b ? -1 : a > b ? 1 : 0;
  }

  _keysName() {
    return 'Names';
  }

  _dataForKey(k) {
    return new String(k);
  }
}

export default PDFNameTree;
