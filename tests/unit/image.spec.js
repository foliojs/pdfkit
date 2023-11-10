import PDFDocument from '../../lib/document';
import { logData } from './helpers';

describe('Image', () => {
  let document;

  beforeEach(() => {
    document = new PDFDocument({ compress: false });
  });

  test('The image must be scaled to convert pixels to points', () => {
    const docData = logData(document),
      image = document.openImage('tests/images/bee.jpg'),
      scale = 72 / 96;

    const stream = Buffer.from(
      `1 0 0 -1 0 792 cm
q
${image.width * scale} 0 0 -${image.height * scale} 72 372 cm
/I1 Do
Q
`,
      'binary'
    );

    document.image(image);
    document.end();

    expect(docData).toContainChunk([
      '5 0 obj',
      `<<
/Length 55
>>`,
      'stream',
      stream,
      '\nendstream',
      'endobj'
    ]);
  });

});
