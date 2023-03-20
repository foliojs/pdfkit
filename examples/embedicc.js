const PDFDocument=require('..');
const fs=require('fs');
// Create a new PDFDocument
let doc = new PDFDocument();
doc.pipe(fs.createWriteStream('embedicc.pdf'));
// Set some meta data
doc.info['Title'] = 'Test Document';
doc.info['Author'] = 'xiaohui';
doc
  .text('noICC', 40, 50)
  .image('images/landscape.jpg', 40, 70, {
    width: 200,
    height: 267
  })
  .text('embedICC', 280, 50)
  .image('images/landscape+icc.jpg', 280, 70, {
  width: 200,
  height: 267
});
doc.end();
