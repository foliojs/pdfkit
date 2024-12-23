import PDFDocument from '../../lib/document';
import { pdf2png } from './pdf2png.js';

function runDocTest(options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }
  if (!options.info) {
    options.info = {};
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument(options);
    const buffers = [];

    fn(doc);

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      try {
        const pdfData = Buffer.concat(buffers);
        const { systemFonts = false } = options;
        const images = await pdf2png(pdfData, { systemFonts });
        for (let image of images) {
          expect(image).toMatchImageSnapshot();
        }
        resolve();
      } catch (err) {
        reject(err)
      }
    });
    doc.end();
  });
}

export { runDocTest };
