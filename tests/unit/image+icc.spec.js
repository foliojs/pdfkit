import PDFDocument from '../../lib/document';
import { logData} from '../unit/helpers';
import { getICC } from '../../lib/image/icc';
import fs from 'fs'
describe('imageWithICC', () => {
  test('getICC', async() => {
    let filePath = 'tests/images/landscape+icc.jpg'
    let buf=fs.readFileSync(filePath);
    let icc=await getICC(buf);
    expect(icc.data.ProfileDescription).toBe('Display P3');
    expect(icc.buffer.length).toBe(548);
  })
  test('embedImageWithICC', async() => {
      let doc = new PDFDocument(); 
      const data = logData(doc);
      await doc.imageWithICC('tests/images/landscape+icc.jpg', 40, 70, {
        width: 200,
        height: 267
      });
      doc.end();
      expect(data).toContainChunk([
        '8 0 obj',
        '<<\n/Alternate /DeviceRGB\n/N 3\n/Length 329\n/Filter /FlateDecode\n>>'
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
          '/Width 230\n' +
          '/Height 306\n' +
          '/ColorSpace 9 0 R\n' +
          '/Filter /DCTDecode\n' +
          '/Length 134399\n' +
          '>>',
      ]);
  });
})