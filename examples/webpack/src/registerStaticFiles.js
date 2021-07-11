// the fs here is not node fs but the provided virtual one
import fs from 'fs';
// the content file is returned as is (webpack is configured to load *.afm files as asset/source)
import Courier from 'pdfkit/js/data/Courier.afm';
import CourierBold from 'pdfkit/js/data/Courier-Bold.afm';

function registerBinaryFiles(ctx) {
  ctx.keys().forEach(key => {
    // extracts "./" from beginning of the key
    fs.writeFileSync(key.substring(2), ctx(key));
  });
}

function registerAFMFonts(ctx) {
  ctx.keys().forEach(key => {
    const match = key.match(/([^/]*\.afm$)/);
    if (match) {
      // afm files must be stored on data path
      fs.writeFileSync(`data/${match[0]}`, ctx(key));
    }
  });
}

// register all files found in assets folder (relative to src)
registerBinaryFiles(require.context('./static-assets', true));

// register AFM fonts distributed with pdfkit
// is good practice to register only required fonts to avoid the bundle size increase too much
registerAFMFonts(require.context('pdfkit/js/data', false, /Helvetica.*\.afm$/));

// register files imported directly
fs.writeFileSync('data/Courier.afm', Courier);
fs.writeFileSync('data/Courier-Bold.afm', CourierBold);
