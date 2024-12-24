import { runDocTest } from "./helpers";

describe("table", function () {
  test("simple table", function () {
    return runDocTest(function (doc) {
      doc.font("tests/fonts/Roboto-Italic.ttf");
      doc
        .table()
        .row(["Column 1", "Column 2", "Column 3"])
        .row(["One value goes here", "Another one here", "OK?"]);
    });
  });

  test("with font changes", function () {
    return runDocTest(function (doc) {
      doc.font("tests/fonts/Roboto-Italic.ttf");
      doc
        .table()
        .row(["Column 1", "Column 2", "Column 3"], { font: "tests/fonts/Roboto-Medium.ttf" })
        .row(["One value goes here", "Another one here", "OK?"], {
          font: "tests/fonts/Roboto-Regular.ttf",
        });
      doc.text("Italic text");
    });
  });

  test("spanning", function () {
    return runDocTest(function (doc) {
      doc.font("tests/fonts/Roboto-Italic.ttf");
      doc
        .table()
        .row([
          { value: "colspan: 2", colspan: 2 },
          { value: "rowspan: 2", rowspan: 2 },
        ])
        .row(["Col 1", { value: "Col 2" }])
        .row([{ value: "colspan: 3\nrowspan: 3", colspan: 3, rowspan: 3 }]);
    });
  });

  test("coloring", function () {
    return runDocTest(function (doc) {
      doc.font("tests/fonts/Roboto-Italic.ttf");
      doc
        .table()
        .row([{ value: "Header 1" }, { value: "Header 2" }], {
          backgroundColor: "lightgrey",
        })
        .row(["Col 1", "Col 2"]);
    });
  });

  test("skip borders", function () {
    return runDocTest(function (doc) {
      doc.font("tests/fonts/Roboto-Italic.ttf");
      doc
        .table({ border: 1 })
        .row([{ value: "Column 1" }, { value: "Column 2" }], { border: false })
        .end();
    });
  });
});
