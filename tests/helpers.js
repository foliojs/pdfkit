var PDFDocument = require('../');

function runDocTest(fn) {
  return new Promise(function(resolve) {
    var doc = new PDFDocument;
    var buffers = [];

    doc.info.CreationDate = new Date(Date.UTC(2018,1,1));

    fn(doc);

    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers)
      expect(pdfData.toString()).toMatchSnapshot()
      resolve();
    });
    doc.end();
  })
}

module.exports = {
  runDocTest: runDocTest
}