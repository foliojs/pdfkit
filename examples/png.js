const PDFDocument = require('..');
const fs = require('fs');

const doc = new PDFDocument();

doc.pipe(fs.createWriteStream('png.pdf'));

// Set the background color to highlight the transparency
doc.fillColor('lightblue');
doc.rect(0, 0, doc.page.width, doc.page.height).fill();

doc.fillColor('black');

doc.text('PNG with transparency (palette 8bit):', 60, 50);
doc.image('../tests/images/pngsuite-palette-transparent-white.png', 60, 64);

doc.text('PNG with transparency (palette 1bit):', 60, 100);
doc.image('../tests/images/pallete-transparent-white-1bit.png', 60, 114);

doc.end();
