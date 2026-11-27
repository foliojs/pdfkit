import PDFDocument from './document';
import LineWrapper from './line_wrapper';
import { PAGE_SIZES } from './page';
import { registerStdFonts } from './font/standard_fonts';
import { registerFile } from '#fs';
import { fromBase64 } from './binary';
import { setIccProfilePath } from './mixins/pdfa';
import iccProfileBase64 from './mixins/data/sRGB_IEC61966_2_1.icc';

// The profile is embedded, so it is registered under a fixed name rather than a
// URL resolved from `import.meta.url`, which bundlers for runtimes such as
// Cloudflare Workers leave undefined.
const iccProfilePath = 'sRGB_IEC61966_2_1.icc';
setIccProfilePath(iccProfilePath);
registerFile(iccProfilePath, fromBase64(iccProfileBase64));

export { PDFDocument, LineWrapper, PAGE_SIZES, registerStdFonts, registerFile };
export default PDFDocument;
