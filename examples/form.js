var PDFDocument = require('../');
var fs = require('fs');

// Create a new PDFDocument
var doc = new PDFDocument();

doc.pipe(fs.createWriteStream('form.pdf'));

// Set some meta data
doc.info['Title'] = 'Test Form Document';
doc.info['Author'] = 'test-acroform.js';

doc.font('Helvetica'); // establishes the default font for forms
doc.initForm();

let rootField = doc.formField('rootField');
doc.font('Courier');
let child1Field = doc.formField('child1Field', { parent: rootField });
doc.font('Helvetica');
let child2Field = doc.formField('child2Field', { parent: rootField });

let y = 10;
doc.formText('leaf1', 10, y, 200, 20, {
  parent: child1Field,
  value: '1999-12-31',
  format: {
    type: 'date',
    param: 'yyyy-mm-dd'
  },
  align: 'center'
});

y += 30;
opts = {
  parent: child1Field,
  value: 32.98,
  format: {
    type: 'number',
    nDec: 2,
    currency: '$',
    currencyPrepend: true
  },
  align: 'right'
};
doc.formText('dollar', 10, y, 200, 20, opts);

y += 30;
doc.formText('leaf2', 10, y, 200, 40, {
  parent: child1Field,
  multiline: true,
  align: 'right'
});
y += 50;
doc.formText('leaf3', 10, y, 200, 80, {
  parent: child2Field,
  multiline: true
});

y += 90;
var opts = {
  backgroundColor: 'yellow',
  label: 'Test Button'
};
doc.formPushButton('btn1', 10, y, 100, 30, opts);

y += 40;
opts = {
  borderColor: 'black',
  select: ['Select Option', 'github', 'bitbucket', 'gitlab'],
  value: 'Select Option',
  defaultValue: 'Select Option',
  align: 'center',
  edit: true
};
doc.formCombo('ch1', 10, y, 100, 20, opts);

y += 30;
opts = {
  borderColor: '#808080',
  select: ['github', 'bitbucket', 'gitlab', 'sourcesafe', 'perforce'],
  sort: true
};
doc.formList('ch2', 10, y, 100, 45, opts);

doc.end();
