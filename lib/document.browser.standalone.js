import PDFDocument, { registerStdFonts } from './document.browser';
import Courier from './font/generated/Courier';
import CourierBold from './font/generated/CourierBold';
import CourierBoldOblique from './font/generated/CourierBoldOblique';
import CourierOblique from './font/generated/CourierOblique';
import Helvetica from './font/generated/Helvetica';
import HelveticaBold from './font/generated/HelveticaBold';
import HelveticaBoldOblique from './font/generated/HelveticaBoldOblique';
import HelveticaOblique from './font/generated/HelveticaOblique';
import Symbol from './font/generated/Symbol';
import TimesBold from './font/generated/TimesBold';
import TimesBoldItalic from './font/generated/TimesBoldItalic';
import TimesItalic from './font/generated/TimesItalic';
import TimesRoman from './font/generated/TimesRoman';
import ZapfDingbats from './font/generated/ZapfDingbats';

registerStdFonts(
  Courier,
  CourierBold,
  CourierBoldOblique,
  CourierOblique,
  Helvetica,
  HelveticaBold,
  HelveticaBoldOblique,
  HelveticaOblique,
  Symbol,
  TimesBold,
  TimesBoldItalic,
  TimesItalic,
  TimesRoman,
  ZapfDingbats,
);

PDFDocument.PDFDocument = PDFDocument;

export default PDFDocument;
