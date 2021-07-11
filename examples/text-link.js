var fs = require('fs');
var PDFDocument = require('../');

var doc = new PDFDocument({ bufferPages: true });
doc.pipe(fs.createWriteStream('text-link.pdf'));
doc.addPage();
doc.addPage();
doc.switchToPage(0);
doc.text('First Page', { paragraphGap: 4 });
doc.text('Click here to go to Second Page', { link: 1, paragraphGap: 4 });
doc
  .text('Continued text ', { continued: true })
  .text('with a link inside', {
    continued: true,
    link: 'http://pdfkit.org',
    underline: true
  })
  .text(' and remaining text', {
    continued: false,
    link: null,
    underline: false
  });
doc.switchToPage(1);
doc.text('Go To First Page', { link: 0 });
doc.text('Link to google', { link: 'https://www.google.com/' });
doc.end();
