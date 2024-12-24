import { PDFTable } from "../table";

export default {
  table(opts = {}) {
    return new PDFTable(this, opts);
  },
};
