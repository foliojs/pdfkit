import fs from '../../lib/virtual-fs';

function checkMissingFiles(files) {
  for (let file of files) {
    expect(() => fs.readFileSync(`files/${file}`)).toThrow(
      `File 'files/${file}' not found in virtual file system`,
    );
  }
}

describe('virtual-fs', function () {
  beforeEach(() => {
    fs.fileData = {};
  });

  test('readFileSync', function () {
    checkMissingFiles(['encoded', 'raw', 'binary']);

    fs.bindFileData({
      'files/binary': Buffer.from('Buffer content'),
    });

    const base64Data = fs.readFileSync('files/binary', 'base64');
    expect(base64Data).toEqual('QnVmZmVyIGNvbnRlbnQ=');
  });

  test('writeFileSync', function () {
    checkMissingFiles(['encoded', 'raw', 'binary']);

    fs.writeFileSync(
      'files/encoded',
      Buffer.from('File content').toString('base64'),
    );
    fs.writeFileSync('files/raw', 'File content');
    fs.writeFileSync('files/binary', new Uint8Array([4, 3, 1, 2]));

    const encodedData = fs.readFileSync('files/encoded');
    expect(encodedData).toBeInstanceOf(Buffer);
    expect(encodedData.toString('utf8')).toEqual('File content');

    const rawData = fs.readFileSync('files/raw', 'utf8');
    expect(rawData).toEqual('File content');

    const binaryData = fs.readFileSync('files/binary');
    expect(binaryData).toBeInstanceOf(Buffer);
    expect(binaryData.toJSON()).toEqual({ data: [4, 3, 1, 2], type: 'Buffer' });
  });

  test('bindFileData', function () {
    checkMissingFiles(['encoded', 'raw', 'binary']);

    fs.bindFileData({
      'files/encoded': Buffer.from('File content').toString('base64'),
    });

    fs.bindFileData({
      'files/raw': 'File content',
      'files/binary': new Uint8Array([4, 3, 1, 2]),
    });

    const encodedData = fs.readFileSync('files/encoded');
    expect(encodedData).toBeInstanceOf(Buffer);
    expect(encodedData.toString('utf8')).toEqual('File content');

    let rawData = fs.readFileSync('files/raw', 'utf8');
    expect(rawData).toEqual('File content');

    let binaryData = fs.readFileSync('files/binary');
    expect(binaryData).toBeInstanceOf(Buffer);
    expect(binaryData.toJSON()).toEqual({ data: [4, 3, 1, 2], type: 'Buffer' });

    // reset option
    fs.bindFileData(
      {
        'files/raw': 'New File content',
        'files/binary2': new Uint8Array([4, 3, 1, 2]),
      },
      { reset: true },
    );

    checkMissingFiles(['encoded', 'binary']);

    rawData = fs.readFileSync('files/raw', 'utf8');
    expect(rawData).toEqual('New File content');

    binaryData = fs.readFileSync('files/binary2');
    expect(binaryData).toBeInstanceOf(Buffer);
    expect(binaryData.toJSON()).toEqual({ data: [4, 3, 1, 2], type: 'Buffer' });
  });
});
