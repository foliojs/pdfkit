var PDFDocument = require('../');
var fs = require('fs');

// Create a new PDFDocument
var doc = new PDFDocument();

doc.pipe(fs.createWriteStream('out-acroform.pdf'));

// Set some meta data
doc.info['Title'] = 'Test AcroForm Document';

doc.info['Author'] = 'Jim Pravetz';

// Register a font name for use later

doc.font('Helvetica')    // establishes the default font
doc.initAcroForm();

let rootField = doc.field('rootField');
let child1Field = doc.field('child1Field', { parent: rootField });
let child2Field = doc.field('child2Field', { parent: rootField });
doc.formText('leaf1', 10, 10, 200, 40, { parent: child1Field })
doc.formText('leaf2', 10, 60, 200, 40, { parent: child1Field })
doc.formText('leaf3', 10, 110, 200, 40, { parent: child2Field })

doc.end();
