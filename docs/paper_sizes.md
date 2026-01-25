# Paper Sizes

When creating a new document or adding a new page to your current document, PDFKit allows you to set the page dimensions. To improve convenience, PDFKit has a number of predefined page sizes. These sizes are based on the most commonly used standard page sizes. 

### Predefined Page Sizes

The following predefined sizes are based on the ISO (International) standards. All the dimensions in brackets are in PostScript points. 

#### A-series

* A0 (2383.94 x 3370.39)
* A1 (1683.78 x 2383.94)
* A2 (1190.55 x 1683.78)
* A3 (841.89 x 1190.55)
* A4 (595.28 x 841.89)
* A5 (419.53 x 595.28)
* A6 (297.64 x 419.53)
* A7 (209.76 x 297.64)
* A8 (147.40 x 209.76)
* A9 (104.88 x 147.40)
* A10 (73.70 x 104.88)

#### B-series

* B0 (2834.65 x 4008.19)
* B1 (2004.09 x 2834.65)
* B2 (1417.32 x 2004.09)
* B3 (1000.63 x 1417.32)
* B4 (708.66 x 1000.63)
* B5 (498.90 x 708.66)
* B6 (354.33 x 498.90)
* B7 (249.45 x 354.33)
* B8 (175.75 x 249.45)
* B9 (124.72 x 175.75)
* B10 (87.87 x 124.72)

#### C-series

* C0 (2599.37 x 3676.54)
* C1 (1836.85 x 2599.37)
* C2 (1298.27 x 1836.85)
* C3 (918.43 x 1298.27)
* C4 (649.13 x 918.43)
* C5 (459.21 x 649.13)
* C6 (323.15 x 459.21)
* C7 (229.61 x 323.15)
* C8 (161.57 x 229.61)
* C9 (113.39 x 161.57)
* C10 (79.37 x 113.39)

#### RA-series

* RA0 (2437.80 x 3458.27)
* RA1 (1729.13 x 2437.80)
* RA2 (1218.90 x 1729.13)
* RA3 (864.57 x 1218.90)
* RA4 (609.45 x 864.57)

#### SRA-series

* SRA0 (2551.18 x 3628.35)
* SRA1 (1814.17 x 2551.18)
* SRA2 (1275.59 x 1814.17)
* SRA3 (907.09 x 1275.59)
* SRA4 (637.80 x 907.09)

The following predefined sizes are based on the common paper sizes used mainly in the United States of America and Canada. The dimensions in brackets are in PostScript points. 

* EXECUTIVE (521.86 x 756.00)
* LEGAL (612.00 x 1008.00)
* LETTER (612.00 X 792.00)
* TABLOID (792.00 X 1224.00)

PDFKit supports also the following paper sizes. The dimensions in brackets are in PostScript points. 

* 4A0 (4767.89 x 6740.79)
* 2A0 (3370.39 x 4767.87)
* FOLIO (612.00 X 936.00)

### Setting the page size

In order to use the predefined sizes, the name of the size (as named in the lists above) should be passed to either the `PDFDocument` constructor or the `addPage()` function in the `size` property of the `options` object, as shown in the example below, using `A7` as the preferred size. 

    // Passing size to the constructor
    const doc = new PDFDocument({size: 'A7'});

    // Passing size to the addPage function
    doc.addPage({size: 'A7'});

### User Unit (PDF 1.6+)

The `userUnit` option allows you to scale the physical size of a page without changing the coordinate system. This is useful for creating large format documents like posters or banners that exceed the standard PDF coordinate limit (200 inches or 14400 points).

The default value is `1.0`, where 1 unit equals 1/72 inch (1 point). Setting `userUnit: 2.0` means 1 unit equals 2/72 inch, effectively doubling the physical size of the page.

    // Create a page with 2x physical size
    doc.addPage({ size: 'A4', userUnit: 2.0 });

    // Create a large poster (4x scale)
    doc.addPage({ size: [612, 792], userUnit: 4.0 });
