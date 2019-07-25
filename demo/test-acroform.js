var PDFDocument = require('../');
var fs = require('fs');

// Create a new PDFDocument
var doc = new PDFDocument();

doc.pipe(fs.createWriteStream('out-acroform.pdf'));

// Set some meta data
doc.info['Title'] = 'Test AcroForm Document';
doc.info['Author'] = 'Jim Pravetz';

doc.registerFont('Courier', 'Courier');
doc.font('Helvetica'); // establishes the default font for forms
doc.initForms();

let rootField = doc.field('rootField');
let child1Field = doc.field('child1Field', { Parent: rootField });
let child2Field = doc.field('child2Field', { Parent: rootField });

let y = 10;
doc.formText('leaf1', 10, y, 200, 40, {
  Parent: child1Field,
  multiline: true
});
y += 50;
doc.font('Courier');
doc.formText('leaf2', 10, y, 200, 40, {
  Parent: child1Field,
  multiline: true,
  align: 'right'
});
y += 50;
doc.formText('leaf3', 10, y, 200, 80, {
  Parent: child2Field,
  multiline: true
});

y += 100;
var opts = {
  backgroundColor: 'yellow',
  label: 'Test Button'
};
doc.formPushButton('btn1', 10, y, 100, 30, opts);

y += 50;
opts = {
  backgroundColor: 'yellow',
  Opt: ['', 'github', 'bitbucket', 'gitlab'],
  V: '',
  DV: '',
  align: 'left',
  combo: true
};
doc.formChoice('ch1', 10, y, 100, 20, opts);

doc.end();
