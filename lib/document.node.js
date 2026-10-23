import { createRequire } from 'module';
import PDFDocument from './document';
import LineWrapper from './line_wrapper';
import {
  registerStdFontLoaders,
  registerStdFonts,
} from './font/standard_fonts';
import { registerFile } from '#fs';

// The standard fonts are required by a path relative to the built file, so they
// resolve next to `js/pdfkit.js` and `js/pdfkit.node.mjs`. A bundler that
// folds this module into its own output leaves `import.meta.url` undefined
// (CommonJS output) or pointing at a bundle with no `standard-fonts/` directory
// next to it (ESM output). Neither may fail before a document actually asks for
// a standard font, so the lookup falls back to a base createRequire accepts and
// a failed lookup explains itself. The base is the root path `/`, which is
// absolute on every platform; the URL `file:///` has no drive letter, so
// createRequire rejects it on Windows.
const require = createRequire(import.meta.url ?? '/');

const loaders = {
  Courier: () => require('./standard-fonts/Courier.cjs'),
  'Courier-Bold': () => require('./standard-fonts/CourierBold.cjs'),
  'Courier-BoldOblique': () =>
    require('./standard-fonts/CourierBoldOblique.cjs'),
  'Courier-Oblique': () => require('./standard-fonts/CourierOblique.cjs'),
  Helvetica: () => require('./standard-fonts/Helvetica.cjs'),
  'Helvetica-Bold': () => require('./standard-fonts/HelveticaBold.cjs'),
  'Helvetica-BoldOblique': () =>
    require('./standard-fonts/HelveticaBoldOblique.cjs'),
  'Helvetica-Oblique': () => require('./standard-fonts/HelveticaOblique.cjs'),
  Symbol: () => require('./standard-fonts/Symbol.cjs'),
  'Times-Bold': () => require('./standard-fonts/TimesBold.cjs'),
  'Times-BoldItalic': () => require('./standard-fonts/TimesBoldItalic.cjs'),
  'Times-Italic': () => require('./standard-fonts/TimesItalic.cjs'),
  'Times-Roman': () => require('./standard-fonts/TimesRoman.cjs'),
  ZapfDingbats: () => require('./standard-fonts/ZapfDingbats.cjs'),
};

registerStdFontLoaders(
  Object.fromEntries(
    Object.entries(loaders).map(([name, load]) => [
      name,
      () => {
        try {
          return load();
        } catch (error) {
          if (error?.code !== 'MODULE_NOT_FOUND') {
            throw error;
          }

          throw new Error(
            `Cannot load the standard font "${name}" from pdfkit's package ` +
              'directory, which is not available once pdfkit is bundled ' +
              'into another file. Either mark pdfkit as external in the ' +
              'bundler, or import the fonts the document uses from ' +
              '"pdfkit/standard-fonts/<Name>" and pass them to ' +
              'registerStdFonts() before creating the document.',
            { cause: error },
          );
        }
      },
    ]),
  ),
);

export { PDFDocument, LineWrapper, registerStdFonts, registerFile };
export default PDFDocument;
