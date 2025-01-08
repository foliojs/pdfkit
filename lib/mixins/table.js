import PDFTable from "../table/index";

export default {
  /**
   * @param {Table} [opts]
   * @returns {PDFTable}
   */
  table(opts) {
    return new PDFTable(this, opts);
  },
};
