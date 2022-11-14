import PDFDocument from '../../../lib/document';

// This tests for PNG memory runaway, and if throttling improves it.
//
// Number of images and memory threshold was chosen so the test runs relatively
// quickly. Less would leave a very low margin for flakiness.
// The real problem is with PDFs with a lot of PNG images going over RSS memory
// limits of containers or swapping to a crawl.
//
// Test was added as "visual" because these run serially and as we're testing
// memory we don't want to overwhelm the system just in case.

const NUMBER_OF_4K_IMAGES = 14;
const THRESHOLD_MEGABYTES = 300;
const MAX_PNG_DECODE_MEGABYTES = 200;

const TEST_TIMEOUT = 60000;
const MEGABYTES = 1024 * 1024;

function memoryCheckForPNGImages(pdfDocumentOptions, memoryCheckCallback) {
  return new Promise(resolve => {
    const doc = new PDFDocument(pdfDocumentOptions);
    // Adding a 4K RGBA png takes around 62 MB worst case (all aligned)
    // and 31 MB average
    //    Average: buffer chunks, unified buffer
    // Worst case: buffer chunks, unified buffer, decode buffer, RGB/A split

    // Buffer memory usage recording
    const initialMemory = process.memoryUsage().external;
    let peakMemory = initialMemory;

    let recorder;
    const record = () => {
      recorder = setImmediate(() => {
        peakMemory = Math.max(peakMemory, process.memoryUsage().external);
        record();
      });
    };
    record();

    // Add a bunch of 4K RGBA PNG unique images
    for (let i = 0; i < NUMBER_OF_4K_IMAGES; i++) {
      const x = 40 + (i % 4) * 600;
      const y = 40 + Math.floor(i / 4) * 600;
      doc.image('tests/images/RGBA4K.png', x, y, {
        width: 600,
        height: 600
      });
      // Remove it form the cache so it loads again.
      doc._imageRegistry['tests/images/RGBA4K.png'] = undefined;
      doc.save();
      doc.restore();
    }

    doc.on('data', () => {});
    doc.on('end', async () => {
      clearImmediate(recorder);

      const approximateUsedMegaBytes = (peakMemory - initialMemory) / MEGABYTES;

      memoryCheckCallback(approximateUsedMegaBytes);
      resolve();
    });
    doc.end();
  });
}

describe('pdfmake', function() {
  test(
    'no-throttle-memory-runaway',
    function() {
      // First lets make sure it would consume more memory without the throttling
      const pdfDocumentOptions = {};
      const testMemoryCheck = approximateUsedMegaBytes =>
        expect(approximateUsedMegaBytes).toBeGreaterThan(THRESHOLD_MEGABYTES);

      return memoryCheckForPNGImages(pdfDocumentOptions, testMemoryCheck);
    },
    TEST_TIMEOUT
  );

  test(
    'throttle-memory-limited',
    function() {
      // Then check throttling works (within an overhead margin)
      const pdfDocumentOptions = {
        maxPNGParallelDecodeMegaBytes: MAX_PNG_DECODE_MEGABYTES
      };
      const testMemoryCheck = approximateUsedMegaBytes =>
        expect(approximateUsedMegaBytes).toBeLessThan(THRESHOLD_MEGABYTES);

      return memoryCheckForPNGImages(pdfDocumentOptions, testMemoryCheck);
    },
    TEST_TIMEOUT
  );
});
