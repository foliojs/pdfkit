import PDFDocument from "../../lib/document";
import { PDFTable } from "../../lib/table";

describe("table", () => {
  test("created", () => {
    const document = new PDFDocument();
    const table = document.table();

    expect(table).toBeInstanceOf(PDFTable);
  });
  test("row", () => {
    const document = new PDFDocument();
    const table = document.table();
    table.row(["A", "B", "C"]);
    expect(table.cols).toBe(3);
  });
});
