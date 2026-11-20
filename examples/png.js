import fs from 'node:fs';
import { PDFDocument } from 'pdfkit';

const outputFilePath = new URL('./png.pdf', import.meta.url);
const beeImagePath = new URL('../tests/images/bee.png', import.meta.url);
const paletteTransparentWhitePath = new URL(
  '../tests/images/pngsuite-palette-transparent-white.png',
  import.meta.url,
);
const paletteTransparentWhite1BitPath = new URL(
  '../tests/images/pallete-transparent-white-1bit.png',
  import.meta.url,
);
const doc = new PDFDocument();

const left = 30;

doc.pipe(fs.createWriteStream(outputFilePath));

// Set the background color to highlight the transparency
doc.fillColor('lightblue');
doc.rect(0, 0, doc.page.width, doc.page.height).fill();

doc.fillColor('black');

doc.text('PNG with transparency (palette 8bit):', left, 50);
doc.image(paletteTransparentWhitePath, left, 64);

doc.text('PNG with transparency (palette 1bit):', left, 100);
doc.image(paletteTransparentWhite1BitPath, left, 114);

const beeWidth = 100;
doc.text('PNG with opacity = 1 (default):', left, 140);
doc.image(beeImagePath, left, 154, { width: beeWidth });

doc.text('PNG with opacity = 0.5:', left + 180, 140);
doc.image(beeImagePath, left + 180, 154, {
  opacity: 0.5,
  width: beeWidth,
});

doc.text('PNG with opacity = 0.25:', left + 360, 140);
doc.image(beeImagePath, left + 360, 154, {
  opacity: 0.25,
  width: beeWidth,
});

doc.end();
