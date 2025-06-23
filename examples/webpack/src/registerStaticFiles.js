// the fs here is not node fs but the provided virtual one
import fs from 'fs';
// the content file is returned as is (webpack is configured to load *.afm files as asset/source)
import Helvetica from 'pdfkit/data/Helvetica.afm';
import HelveticaBold from 'pdfkit/data/Helvetica-Bold.afm';
import HelveticaBoldOblique from 'pdfkit/data/Helvetica-BoldOblique.afm';
import HelveticaOblique from 'pdfkit/data/Helvetica-Oblique.afm';
import Courier from 'pdfkit/data/Courier.afm';
import CourierBold from 'pdfkit/data/Courier-Bold.afm';

function registerBinaryFiles(ctx) {
  ctx.keys().forEach(key => {
    // extracts "./" from beginning of the key
    fs.writeFileSync(key.substring(2), ctx(key));
  });
}

// register all files found in assets folder (relative to src)
registerBinaryFiles(require.context('./static-assets', true));

// register AFM fonts distributed with pdfkit
// is good practice to register only required fonts to avoid the bundle size increase too much
// register files imported directly
fs.writeFileSync('data/Helvetica.afm', Helvetica);
fs.writeFileSync('data/Helvetica-Bold.afm', HelveticaBold);
fs.writeFileSync('data/Helvetica-BoldOblique.afm', HelveticaBoldOblique);
fs.writeFileSync('data/Helvetica-Oblique.afm', HelveticaOblique);
fs.writeFileSync('data/Courier.afm', Courier);
fs.writeFileSync('data/Courier-Bold.afm', CourierBold);
