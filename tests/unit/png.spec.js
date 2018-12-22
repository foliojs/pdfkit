const PDFDocument = require("../../lib/document").default;
const PDFReference = require("../../lib/reference").default;
const PNGImage = require("../../lib/image/png").default;
const fs = require("fs");

describe("PNGImage", () => {
  let document;

  const createImage = fileName => {
    const img = new PNGImage(fs.readFileSync(fileName), "I1");
    // noop data manipulation methods
    img.loadIndexedAlphaChannel = () => {
      if (img.image.hasAlphaChannel) {
        img.alphaChannel = {};
      }
    };
    img.splitAlphaChannel = () => {
      if (img.image.hasAlphaChannel) {
        img.alphaChannel = {};
      }
    };
    img.embed(document);
    img.finalize();
    return img;
  };

  beforeEach(() => {
    document = new PDFDocument();
  });

  test("RGB", () => {
    // ImageWidth = 400
    // ImageHeight = 533
    // BitDepth = 8
    // ColorType = 2 (RGB)
    // Compression = 0
    // Filter = 0
    // Interlace = 0

    const img = createImage("./demo/images/test2.png");

    expect(img.obj.data).toMatchObject({
      BitsPerComponent: 8,
      ColorSpace: "DeviceRGB",
      Filter: "FlateDecode",
      Height: 533,
      Length: 397011,
      Subtype: "Image",
      Type: "XObject",
      Width: 400,
      DecodeParms: expect.any(PDFReference)
    });

    expect(img.obj.data.DecodeParms.data).toMatchObject({
      BitsPerComponent: 8,
      Colors: 3,
      Columns: 400,
      Predictor: 15
    });
  });

  test("RGB with Alpha", () => {
    // ImageWidth = 409
    // ImageHeight = 400
    // BitDepth = 8
    // ColorType = 6 (RGB with Alpha)
    // Compression = 0
    // Filter = 0
    // Interlace = 0

    const img = createImage("./tests/images/bee.png");

    expect(img.obj.data).toMatchObject({
      BitsPerComponent: 8,
      ColorSpace: "DeviceRGB",
      Filter: "FlateDecode",
      Height: 400,
      Length: 47715,
      Subtype: "Image",
      Type: "XObject",
      Width: 409,
      SMask: expect.any(PDFReference)
    });

    expect(img.obj.data.SMask.data).toMatchObject({
      BitsPerComponent: 8,
      ColorSpace: "DeviceGray",
      Decode: [
        0,
        1
      ],
      Filter: "FlateDecode",
      Height: 400,
      Length: 16,
      Subtype: "Image",
      Type: "XObject",
      Width: 409,
    });
  });

  test("Pallete", () => {
    // ImageWidth = 980
    // ImageHeight = 540
    // BitDepth = 8
    // ColorType = 3 (Pallete)
    // Compression = 0
    // Filter = 0
    // Interlace = 0

    const img = createImage("./demo/images/test3.png");

    expect(img.obj.data).toMatchObject({
      BitsPerComponent: 8,
      ColorSpace: ["Indexed", "DeviceRGB", 255, expect.any(PDFReference)],
      Filter: "FlateDecode",
      Height: 540,
      Length: 56682,
      Subtype: "Image",
      Type: "XObject",
      Width: 980,
      DecodeParms: expect.any(PDFReference)
    });

    expect(img.obj.data.DecodeParms.data).toMatchObject({
      BitsPerComponent: 8,
      Colors: 1,
      Columns: 980,
      Predictor: 15
    });
  });

  test("Grayscale with Alpha", () => {
    // ImageWidth = 112
    // ImageHeight = 112
    // BitDepth = 8
    // ColorType = 4 (Grayscale with Alpha)
    // Compression = 0
    // Filter = 0
    // Interlace = 0

    const img = createImage("./tests/images/fish.png");

    expect(img.obj.data).toMatchObject({
      BitsPerComponent: 8,
      ColorSpace: "DeviceGray",
      Filter: "FlateDecode",
      Height: 112,
      Length: 9922,
      Subtype: "Image",
      Type: "XObject",
      Width: 112,
      SMask: expect.any(PDFReference)
    });

    expect(img.obj.data.SMask.data).toMatchObject({
      BitsPerComponent: 8,
      ColorSpace: "DeviceGray",
      Decode: [
        0,
        1
      ],
      Filter: "FlateDecode",
      Height: 112,
      Length: 16,
      Subtype: "Image",
      Type: "XObject",
      Width: 112,
    });
  });
});
