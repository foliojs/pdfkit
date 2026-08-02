import PDFDocument from './document';
import { registerStdFontLoaders } from './font/standard_fonts';

registerStdFontLoaders({
  Courier: () => require('#standard-fonts/Courier'),
  'Courier-Bold': () => require('#standard-fonts/CourierBold'),
  'Courier-BoldOblique': () => require('#standard-fonts/CourierBoldOblique'),
  'Courier-Oblique': () => require('#standard-fonts/CourierOblique'),
  Helvetica: () => require('#standard-fonts/Helvetica'),
  'Helvetica-Bold': () => require('#standard-fonts/HelveticaBold'),
  'Helvetica-BoldOblique': () =>
    require('#standard-fonts/HelveticaBoldOblique'),
  'Helvetica-Oblique': () => require('#standard-fonts/HelveticaOblique'),
  Symbol: () => require('#standard-fonts/Symbol'),
  'Times-Bold': () => require('#standard-fonts/TimesBold'),
  'Times-BoldItalic': () => require('#standard-fonts/TimesBoldItalic'),
  'Times-Italic': () => require('#standard-fonts/TimesItalic'),
  'Times-Roman': () => require('#standard-fonts/TimesRoman'),
  ZapfDingbats: () => require('#standard-fonts/ZapfDingbats'),
});

export default PDFDocument;
