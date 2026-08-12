import { registerStdFonts } from 'pdfkit';
import Courier from 'pdfkit/standard-fonts/Courier';
import CourierBold from 'pdfkit/standard-fonts/CourierBold';
import Helvetica from 'pdfkit/standard-fonts/Helvetica';
// webpack is configured to load files in static-assets as base64
import robotoRegular from './static-assets/fonts/Roboto-Regular.ttf';
import bee from './static-assets/images/bee.png';

// is good practice to register only required fonts to avoid the bundle size increase too much
registerStdFonts(Courier, CourierBold, Helvetica);

const toBytes = base64 =>
  Uint8Array.from(atob(base64), char => char.charCodeAt(0));

export const fonts = {
  Roboto: toBytes(robotoRegular)
};

export const images = {
  bee: `data:image/png;base64,${bee}`
};
