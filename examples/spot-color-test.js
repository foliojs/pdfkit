var PDFDocument = require('../js/pdfkit');
var fs = require('fs');

// Create a new PDFDocument
var doc = new PDFDocument();

doc.pipe(fs.createWriteStream('spot-color.pdf'));

// Set some meta data
doc.info['Title'] = 'Test Document';
doc.info['Author'] = 'Nigel Watson';

// Register a font name for use later
doc.registerFont('Palatino', 'fonts/PalatinoBold.ttf');

// add a spot color
doc.addSpotColor('PANTONE185C', 0, 100, 78, 9);

// Set the font, draw some text, and embed an image
doc
  .fillColor('PANTONE185C')
  .font('Palatino')
  .fontSize(25)
  .text('Some text with an embedded font!', 100, 100)
  .fontSize(18)
  .text('PNG and JPEG images:');

// Draw a triangle and a circle
doc
  .moveTo(100, 150)
  .lineTo(100, 250)
  .lineTo(200, 250)
  .fill('PANTONE185C');

doc
  .scale(0.6)
  .translate(300, 380)
  .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
  .fill('PANTONE185C', 'even-odd')
  .restore();

doc.end();
