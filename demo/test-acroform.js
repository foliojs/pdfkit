var PDFDocument = require('../');
var fs = require('fs');

// Create a new PDFDocument
var doc = new PDFDocument();

doc.pipe(fs.createWriteStream('out-acroform.pdf'));

// Set some meta data
doc.info['Title'] = 'Test AcroForm Document';

doc.info['Author'] = 'Jim Pravetz';

// Register a font name for use later

doc.registerFont('myfont1', 'fonts/PalatinoBold.ttf')

doc.font('Courier-Bold')    // establishes the default font
doc.initAcroForm()

doc.font('myfont1')
  .fontSize(25)
  .text('Test Doc', 0, 20, { width: 612, align: 'center' });
doc.font('Courier')
  .fontSize(16)
  .text('Courier subheading', 0, 50, { width: 612, align: 'center' });

doc.font('myfont1').formText('file0', 10, 100, 592, 400, { multiline: true });
doc.end();
