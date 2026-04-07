const PDFDocument = require('..');
const fs = require('fs');

const doc = new PDFDocument();

const left = 30;

doc.pipe(fs.createWriteStream('png.pdf'));

// Set the background color to highlight the transparency
doc.fillColor('lightblue');
doc.rect(0, 0, doc.page.width, doc.page.height).fill();

doc.fillColor('black');

doc.text('PNG with transparency (palette 8bit):', left, 50);
doc.image('../tests/images/pngsuite-palette-transparent-white.png', left, 64);

doc.text('PNG with transparency (palette 1bit):', left, 100);
doc.image('../tests/images/pallete-transparent-white-1bit.png', left, 114);

const beeWidth = 100;
doc.text('PNG with opacity = 1 (default):', left, 140);
doc.image('../tests/images/bee.png', left, 154, { width: beeWidth });

doc.text('PNG with opacity = 0.5:', left + 180, 140);
doc.image('../tests/images/bee.png', left + 180, 154, {
  opacity: 0.5,
  width: beeWidth,
});

doc.text('PNG with opacity = 0.25:', left + 360, 140);
doc.image('../tests/images/bee.png', left + 360, 154, {
  opacity: 0.25,
  width: beeWidth,
});

doc.end();
