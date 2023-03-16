// import PDFDocument from '../js/pdfkit.es5.js'
const PDFDocument=require('..');
const fs=require('fs');
(async()=>{
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
    .text('embedICC', 280, 50);
  // embed an image with ICC embedded, and ICC is embedded to pdf
  await doc.imageWithICC('images/landscape+icc.jpg', 280, 70, {
    width: 200,
    height: 267
  });
  doc.end();
})()
