const PDFReference = require('../../lib/reference').default;
const PDFDocument = require('../../lib/document').default;
const zlib = require('zlib');

describe('PDFReference', () => {
  let document;
  beforeEach(() => {
    document = new PDFDocument();
  });

  test('instantiated without data', () => {
    const ref = new PDFReference(document, 1);

    expect(ref.id).toBeDefined();
    expect(ref.data).toBeDefined();
    expect(ref.data).toBeInstanceOf(Object);
  });

  test('instantiated with data', () => {
    const refData = { Pages: 0 };
    const ref = new PDFReference(document, 1, refData);

    expect(ref.id).toBe(1);
    expect(ref.data).toBe(refData);
  });

  test('written data of empty reference', done => {
    const dataLog = [];
    const expected = ['1 0 obj', '<<\n>>', 'endobj'];
    const ref = new PDFReference(document, 1);
    document._write = function(data) {
      dataLog.push(data);
    };
    ref.finalize();
    setTimeout(() => {
      expect(dataLog).toEqual(expected);
      done();
    }, 1);
  });

  test('written data of reference with uncompressed data', done => {
    const dataLog = [];
    const chunk = new Buffer('test');
    const expected = [
      '1 0 obj',
      `<<
/Length ${chunk.length}
>>`,
      'stream',
      chunk,
      '\nendstream',
      'endobj'
    ];
    const ref = new PDFReference(document, 1);
    ref.compress = false;
    ref.write(chunk);
    document._write = function(data) {
      dataLog.push(data);
    };
    ref.finalize();
    setTimeout(() => {
      expect(dataLog).toEqual(expected);
      done();
    }, 1);
  });

  test('written data of reference with compressed data', done => {
    const dataLog = [];
    const chunk = new Buffer('test');
    const compressed = zlib.deflateSync(chunk);
    const expected = [
      '1 0 obj',
      `<<
/Length ${compressed.length}
/Filter /FlateDecode
>>`,
      'stream',
      compressed,
      '\nendstream',
      'endobj'
    ];
    const ref = new PDFReference(document, 1);
    ref.write(chunk);
    document._write = function(data) {
      dataLog.push(data);
    };
    ref.finalize();
    setTimeout(() => {
      expect(dataLog).toEqual(expected);
      done();
    }, 1);
  });
});
