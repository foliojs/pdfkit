import Canvas from 'canvas';
import { strict as assert } from 'assert';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// adapted from https://github.com/mozilla/pdf.js/tree/master/examples/node/pdf2png

class NodeCanvasFactory {
  create(width, height) {
    assert(width > 0 && height > 0, 'Invalid canvas size');
    const canvas = Canvas.createCanvas(width, height);
    const context = canvas.getContext('2d');
    return {
      canvas,
      context,
    };
  }

  reset({ canvas }, width, height) {
    assert(canvas, 'Canvas is not specified');
    assert(width > 0 && height > 0, 'Invalid canvas size');
    canvas.width = width;
    canvas.height = height;
  }

  destroy(canvasAndContext) {
    assert(canvasAndContext.canvas, 'Canvas is not specified');

    // Zeroing the width and height cause Firefox to release graphics
    // resources immediately, which can greatly reduce memory consumption.
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

async function pdf2png(data, { systemFonts } = {}) {
  // Load the PDF file.
  const loadingTask = pdfjsLib.getDocument({
    data,
    disableFontFace: !systemFonts,
  });

  const pdfDocument = await loadingTask.promise;

  const pageCount = pdfDocument.numPages;

  const images = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdfDocument.getPage(i);
    // Render the page on a Node canvas with 100% scale.
    const viewport = page.getViewport({ scale: 2.0 });
    const canvasFactory = new NodeCanvasFactory();
    const canvasAndContext = canvasFactory.create(
      viewport.width,
      viewport.height,
    );
    const renderContext = {
      canvasContext: canvasAndContext.context,
      viewport,
      canvasFactory,
    };
    const renderTask = page.render(renderContext);
    await renderTask.promise;
    // Convert the canvas to an image buffer.
    const image = canvasAndContext.canvas.toBuffer();
    images.push(image);
    canvasFactory.destroy(canvasAndContext);
  }

  return images;
}

export { pdf2png };
