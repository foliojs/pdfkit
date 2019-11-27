var PDFDocument = require('../');

var fs = require('fs');

// Create a new PDFDocument
var doc = new PDFDocument();

doc.pipe(fs.createWriteStream('spotColor.pdf'));

// Set some meta data
doc.info['Title'] = 'Test Document for Sport Color';

doc.info['Author'] = 'Nicola A.';


// Register a font name for use later
doc.registerFont('Palatino', 'fonts/PalatinoBold.ttf');

// Set the font, draw some text, and embed an image
doc
  .font('Palatino')
  .fontSize(18)
  .text('Testing Spot Colors: MYFIRST_SPOT_COLOR, MYSECOND_SPOT_COLOR', 50, 50)
  .fontSize(12)
  .text('Check it out on Swatches palette', 50, 100)

// Add another page
// doc
//   .addPage()
//   .fontSize(25)
//   .text('Here is some vector graphics...', 100, 100);

doc.addSpotColor('MYFIRST_SPOT_COLOR', 0, 50, 0, 0);
doc.addSpotColor('MYSECOND_SPOT_COLOR', 50, 0, 0, 0);


// Draw a triangle and a circle
doc
  .moveTo(100, 150)
  .lineTo(100, 250)
  .lineTo(200, 250)
  .stroke('MYFIRST_SPOT_COLOR');

doc
  .moveTo(200, 250)
  .lineTo(100, 150)
  .lineTo(200, 150)
  .lineTo(200, 250)
  .fillAndStroke('MYFIRST_SPOT_COLOR', 'MYSECOND_SPOT_COLOR');
doc.end();
