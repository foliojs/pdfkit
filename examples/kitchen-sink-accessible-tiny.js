var PDFDocument = require('../');
var fs = require('fs');

// Create a new PDFDocument
var doc = new PDFDocument({
  autoFirstPage: true,
  bufferPages: true,
  pdfVersion: '1.5',
  // @ts-ignore PDF/UA needs to be enforced for PAC accessibility checker
  subset: 'PDF/UA',
  tagged: true,
  displayTitle: true,
  lang: 'en-US',
  fontSize: 12,
});

doc.pipe(fs.createWriteStream('accessible-links.pdf'));

// Set some meta data
doc.info['Title'] = 'Test Document';
doc.info['Author'] = 'Devon Govett';

// Initialise document logical structure
var struct = doc.struct('Document');
doc.addStructure(struct);

// Register a font name for use later
doc.registerFont('Palatino', 'fonts/PalatinoBold.ttf');

// Set the font and draw some text
struct.add(
  doc.struct('P', () => {
    doc
      .font('Palatino')
      .fontSize(25)
      .text('Some text with an embedded font! ', 100, 100);
  })
);


// Add another page
doc.addPage();

// Add some text with annotations
var linkSection = doc.struct('Sect');
struct.add(linkSection);

linkSection.add(
  doc.struct(
    'Link',
    {
      alt: 'Here is a link! '
    },
    () => {
      doc.font('Palatino').fillColor('blue').text('Here is a link!', 100, 100, {
        link: 'http://google.com/',
        underline: true
      });
    }
  )
);

linkSection.end();


// End and flush the document
doc.end();
