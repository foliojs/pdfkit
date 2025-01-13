import PDFDocument from "../../lib/document";
import PDFTable from "../../lib/table";

describe("table", () => {
  test("created", () => {
    const document = new PDFDocument();
    expect(document.table()).toBeInstanceOf(PDFTable);
    expect(document.table({data: []})).toBe(document);
  });
  test("row", () => {
    const document = new PDFDocument();
    const table = document.table();
    table.row(["A", "B", "C"]);
    expect(table._columnWidths.length).toBe(3);
  });
});
