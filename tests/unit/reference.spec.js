const PDFDocument = require('../../')
const zlib = require('zlib')

describe('PDFReference', () => {
  let document
  beforeEach(() => {
    document = new PDFDocument()
  })
  
  test('instantiated without data', () => {
    const ref = document.ref()    
    
    expect(ref.id).toBeDefined()          
    expect(ref.data).toBeDefined()
    expect(ref.data).toBeInstanceOf(Object)          
  })

  test('instantiated with data', () => {
    const refData = {Pages: 0}
    const ref = document.ref(refData)            

    expect(ref.id).toBeDefined()      
    expect(ref.data).toBe(refData)        
  })

  test('written data of empty reference', (done) => {
    const dataLog = []
    const expected = [
      '7 0 obj', 
      '<<\n>>', 
      'endobj'
    ]
    const ref = document.ref()
    document._write = function(data) {
      dataLog.push(data)
    }
    ref.finalize()
    setTimeout(() => {
      expect(dataLog).toEqual(expected)
      done()
    }, 1)
  })

  test('written data of reference with uncompressed data', (done) => {
    const dataLog = []
    const chunk = new Buffer('test')
    const expected = [
      '7 0 obj', 
      `<<
/Length ${chunk.length}
>>`,
      'stream',
      chunk,
      '\nendstream',
      'endobj'
    ]
    const ref = document.ref()
    ref.compress = false
    ref.write(chunk)
    document._write = function(data) {
      dataLog.push(data)
    }
    ref.finalize()
    setTimeout(() => {
      expect(dataLog).toEqual(expected)
      done()
    }, 1)
  })

  test('written data of reference with compressed data', (done) => {
    const dataLog = []
    const chunk = new Buffer('test')
    const compressed = zlib.deflateSync(chunk);
    const expected = [
      '7 0 obj', 
      `<<
/Length ${compressed.length}
/Filter /FlateDecode
>>`,
      'stream',
      compressed,
      '\nendstream',
      'endobj'
    ]
    const ref = document.ref()    
    ref.write(chunk)
    document._write = function(data) {
      dataLog.push(data)
    }
    ref.finalize()
    setTimeout(() => {
      expect(dataLog).toEqual(expected)
      done()
    }, 1)
  })
})