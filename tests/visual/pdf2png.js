// adapted from https://github.com/mozilla/pdf.js/tree/master/examples/node/pdf2png
import path from 'path';
import { fileURLToPath } from 'url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

async function pdf2png(data) {
  // Load the PDF file.
  const loadingTask = getDocument({
    data: new Uint8Array(data),
    useSystemFonts: false,
    standardFontDataUrl: path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../node_modules/pdfjs-dist/standard_fonts/',
    ),
  });

  const pdfDocument = await loadingTask.promise;
  const canvasFactory = pdfDocument.canvasFactory;

  const pageCount = pdfDocument.numPages;

  const images = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdfDocument.getPage(i);
    // Render the page on a Node canvas with 100% scale.
    const viewport = page.getViewport({ scale: 2.0 });
    const canvasAndContext = canvasFactory.create(
      viewport.width,
      viewport.height,
    );
    const renderContext = {
      canvasContext: canvasAndContext.context,
      viewport,
    };
    const renderTask = page.render(renderContext);
    await renderTask.promise;
    // Convert the canvas to an image buffer.
    const image = canvasAndContext.canvas.toBuffer('image/png');
    images.push(image);
    page.cleanup();
  }

  return images;
}

export { pdf2png };
