const PDFDocument = require('../');
const fs = require('fs');

const doc = new PDFDocument();

// files with alpha channel -> uses zlib.deflate
const files = ['test.png', 'test3.png'];

const filesData = files.map(fileName => {
  return fs.readFileSync(`images/${fileName}`);
});

const iterationCount = 100;

console.time('png-bench');

for (let i = 0; i < iterationCount; i++) {
  filesData.forEach(data => {
    doc.image(data);
    doc.addPage();
  });
}

doc.on('data', () => {});

doc.on('end', () => {
  console.timeEnd('png-bench');
});

doc.end();
