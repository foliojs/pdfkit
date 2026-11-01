import PDFDocument from './document';
import LineWrapper from './line_wrapper';
import { PAGE_SIZES } from './page';
import { registerStdFonts } from './font/standard_fonts';
import { registerFile } from '#fs';
import { fromBase64 } from './binary';
import { getIccProfilePath } from './mixins/pdfa';
import iccProfileBase64 from './mixins/data/sRGB_IEC61966_2_1.icc';

registerFile(getIccProfilePath(), fromBase64(iccProfileBase64));

export { PDFDocument, LineWrapper, PAGE_SIZES, registerStdFonts, registerFile };
export default PDFDocument;
