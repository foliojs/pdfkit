import PDFDocument from '../../lib/document';
import { logData} from '../unit/helpers';
import { extractICCProfile } from '../../lib/image/jpeg';
import fs from 'fs'
describe('jpeg', () => {
  test('extractICCProfile1', () => {
    let filePath = 'tests/images/landscape+icc.jpg'
    let buf=fs.readFileSync(filePath);
    let icc=extractICCProfile(buf);
    //console.log(icc)
    expect(icc.data.description).toBe('Display P3');
    expect(icc.buffer.length).toBe(536);
  })
  test('extractICCProfile2', () => {
    let filePath = 'tests/images/landscape+micc.jpg'
    let buf=fs.readFileSync(filePath);
    let icc=extractICCProfile(buf);
    expect(icc.data.description).toBe('Modified Display P3');
    expect(icc.buffer.length).toBe(76008);
  })
  test('embedImageWithICC', () => {
      let doc = new PDFDocument(); 
      const data = logData(doc);
      doc.image('tests/images/landscape+icc.jpg', 40, 70, {
        width: 200,
        height: 267
      });
      doc.end();
      expect(data).toContainChunk([
        '8 0 obj',
        '<<\n/Alternate /DeviceRGB\n/N 3\n/Length 349\n/Filter /FlateDecode\n>>'
      ]);
      expect(data).toContainChunk([
        '9 0 obj',
        '[/ICCBased 8 0 R]'
      ]);
      expect(data).toContainChunk([
        '10 0 obj',
        '<<\n' +
          '/Type /XObject\n' +
          '/Subtype /Image\n' +
          '/BitsPerComponent 8\n' +
          '/Width 804\n' +
          '/Height 1071\n' +
          '/ColorSpace 9 0 R\n' +
          '/Filter /DCTDecode\n' +
          '/Length 553372\n' +
          '>>',
      ]);
  });
})