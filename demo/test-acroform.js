var PDFDocument = require('../');
var fs = require('fs');

// Create a new PDFDocument
var doc = new PDFDocument();

doc.pipe(fs.createWriteStream('out-acroform.pdf'));

// Set some meta data
doc.info['Title'] = 'Test AcroForm Document';

doc.info['Author'] = 'Jim Pravetz';

// Register a font name for use later
doc.registerFont('Palatino', 'fonts/PalatinoBold.ttf');

// Set the font, draw some text, and embed an image
doc
  .font('Palatino')
  .fontSize(25)
  .text('Some text with an embedded font!', 100, 100)

doc.font('Courier')
  .initAcroForm();

doc.font('Palatino').formText('field.0', 10, 10, 200, 200, { multiline: true });

doc.end();
