var { runDocTest } = require('./helpers');
var PDFDocument = require('../../lib/document').default;
var CryptoJS = require('crypto-js');

describe('pdfmake', function() {
  let generateRandomWordArray = null;

  beforeAll(function() {
    const doc = new PDFDocument({ userPassword: 'user' });
    generateRandomWordArray = Object.getPrototypeOf(doc._security).constructor
      .generateRandomWordArray;
    Object.getPrototypeOf(
      doc._security
    ).constructor.generateRandomWordArray = function(bytes) {
      return CryptoJS.lib.WordArray.create(null, bytes);
    };
  });

  afterAll(function() {
    const doc = new PDFDocument({ userPassword: 'user' });
    Object.getPrototypeOf(
      doc._security
    ).constructor.generateRandomWordArray = generateRandomWordArray;
  });

  test('encryption with RC-40 (PDF 1.3)', function() {
    return runDocTest(
      { pdfVersion: '1.3', userPassword: 'user', ownerPassword: 'owner' },
      function(doc) {
        doc.text('test');
      }
    );
  });

  test('encryption with RC-128 (PDF 1.4)', function() {
    return runDocTest(
      { pdfVersion: '1.4', userPassword: 'user', ownerPassword: 'owner' },
      function(doc) {
        doc.text('test');
      }
    );
  });

  test('encryption with RC-128 (PDF 1.5)', function() {
    return runDocTest(
      { pdfVersion: '1.5', userPassword: 'user', ownerPassword: 'owner' },
      function(doc) {
        doc.text('test');
      }
    );
  });

  test('encryption with AES-128 (PDF 1.6)', function() {
    return runDocTest(
      { pdfVersion: '1.6', userPassword: 'user', ownerPassword: 'owner' },
      function(doc) {
        doc.text('test');
      }
    );
  });

  test('encryption with AES-128 (PDF 1.7)', function() {
    return runDocTest(
      { pdfVersion: '1.7', userPassword: 'user', ownerPassword: 'owner' },
      function(doc) {
        doc.text('test');
      }
    );
  });

  test('encryption with AES-256 (PDF 1.7 extension 3)', function() {
    return runDocTest(
      { pdfVersion: '1.7ext3', userPassword: 'user', ownerPassword: 'owner' },
      function(doc) {
        doc.text('test');
      }
    );
  });
});
