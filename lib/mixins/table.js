import PDFTable from '../table/index';

export default {
  initTables() {
    this._tableIndex = 0;
  },
  /**
   * @param {Table} [opts]
   * @returns {PDFTable}
   */
  table(opts) {
    return new PDFTable(this, opts);
  },
};
