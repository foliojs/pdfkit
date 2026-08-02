const assert = require('node:assert/strict');

const PDFDocument = require('pdfkit');

assert.equal(typeof PDFDocument, 'function');
assert.equal(PDFDocument.name, 'PDFDocument');
