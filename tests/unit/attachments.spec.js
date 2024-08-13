import PDFDocument from '../../lib/document';
import PDFSecurity from '../../lib/security';
import { logData } from './helpers';
import { createHash } from 'crypto';

// manual mock for PDFSecurity to ensure stored id will be the same across different systems
PDFSecurity.generateFileID = () => {
  return Buffer.from('mocked-pdf-id');
};

const date = new Date(Date.UTC(2018, 1, 1));

describe('file', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({
      info: { CreationDate: date }
    });
  });

  test('with name and type', () => {
    const docData = logData(document);

    document.file(Buffer.from('example text'), {
      name: 'file.txt',
      type: 'text/plain',
      creationDate: date,
      modifiedDate: date
    });
    document.end();

    const md5 = createHash('md5')
      .update('example text')
      .digest('hex');

    expect(docData).toContainChunk([
      `8 0 obj`,
      `<<
/Type /EmbeddedFile
/Params <<
/CreationDate (D:20180201000000Z)
/ModDate (D:20180201000000Z)
/CheckSum (${md5})
/Size 12
>>
/Subtype /text#2Fplain
/Length 20
/Filter /FlateDecode
>>`
    ]);

    expect(docData).toContainChunk([
      `9 0 obj`,
      `<<
/Type /Filespec
/F (file.txt)
/EF <<
/F 8 0 R
>>
/UF (file.txt)
>>`
    ]);

    expect(docData).toContainChunk([
      `2 0 obj`,
      `<<
/Dests <<
  /Names [
]
>>
/EmbeddedFiles <<
  /Names [
    (file.txt) 9 0 R
]
>>
>>`
    ]);
  });

  test('with description', () => {
    const docData = logData(document);

    document.file(Buffer.from('example text'), {
      name: 'file.txt',
      creationDate: date,
      modifiedDate: date,
      description: 'file description'
    });
    document.end();

    const md5 = createHash('md5')
      .update('example text')
      .digest('hex');

    expect(docData).toContainChunk([
      `8 0 obj`,
      `<<
/Type /EmbeddedFile
/Params <<
/CreationDate (D:20180201000000Z)
/ModDate (D:20180201000000Z)
/CheckSum (${md5})
/Size 12
>>
/Length 20
/Filter /FlateDecode
>>`
    ]);

    expect(docData).toContainChunk([
      `9 0 obj`,
      `<<
/Type /Filespec
/F (file.txt)
/EF <<
/F 8 0 R
>>
/UF (file.txt)
/Desc (file description)
>>`
    ]);
  });

  test('with hidden option', () => {
    const docData = logData(document);

    document.file(Buffer.from('example text'), {
      name: 'file.txt',
      creationDate: date,
      modifiedDate: date,
      hidden: true
    });
    document.end();

    const md5 = createHash('md5')
      .update('example text')
      .digest('hex');

    expect(docData).toContainChunk([
      `8 0 obj`,
      `<<
/Type /EmbeddedFile
/Params <<
/CreationDate (D:20180201000000Z)
/ModDate (D:20180201000000Z)
/CheckSum (${md5})
/Size 12
>>
/Length 20
/Filter /FlateDecode
>>`
    ]);

    // hidden: do not add to /EmbeddedFiles
    expect(docData).toContainChunk([
      `2 0 obj`,
      `<<
/Dests <<
  /Names [
]
>>
>>`
    ]);
  });

  test('attach multiple files', () => {
    const docData = logData(document);

    document.file(Buffer.from('example text'), {
      name: 'file1.txt',
      creationDate: date,
      modifiedDate: date
    });
    document.file(Buffer.from('example text'), {
      name: 'file2.txt',
      creationDate: date,
      modifiedDate: date
    });
    document.end();

    expect(docData).toContainChunk([
      `2 0 obj`,
      `<<
/Dests <<
  /Names [
]
>>
/EmbeddedFiles <<
  /Names [
    (file1.txt) 9 0 R
    (file2.txt) 11 0 R
]
>>
>>`
    ]);
  });

  test('attach the same file multiple times', () => {
    const docData = logData(document);

    document.file(Buffer.from('example text'), {
      name: 'file1.txt',
      creationDate: date,
      modifiedDate: date
    });
    document.file(Buffer.from('example text'), {
      name: 'file1.txt',
      creationDate: new Date(date),
      modifiedDate: new Date(date)
    });
    document.end();

    const numFiles = docData.filter((str) => typeof str === 'string' && str.startsWith('<<\n/Type /EmbeddedFile\n'))
    
    expect(numFiles.length).toEqual(1)
    
    expect(docData).toContainChunk([
      `2 0 obj`,
      `<<
/Dests <<
  /Names [
]
>>
/EmbeddedFiles <<
  /Names [
    (file1.txt) 10 0 R
]
>>
>>`
    ]);
  });
});
