import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import PDFDocument, { LineWrapper, registerFile } from 'pdfkit';
import { toBytes } from 'pdfkit/output';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

assert.equal(
  import.meta.resolve('pdfkit'),
  new URL('../js/pdfkit.node.mjs', import.meta.url).href,
);

assert.equal(typeof PDFDocument, 'function');
assert.equal(PDFDocument.name, 'PDFDocument');
assert.equal(typeof LineWrapper, 'function');
assert.equal(typeof registerFile, 'function');
assert.equal(PDFDocument.LineWrapper, undefined);
assert.equal(PDFDocument.registerFile, undefined);

const loadedStandardFontModules = () =>
  Object.keys(require.cache).filter((file) =>
    file.includes('js/standard-fonts'),
  );

assert.deepEqual(loadedStandardFontModules(), []);

const helveticaDocument = new PDFDocument();
const helveticaOutput = toBytes(helveticaDocument);
helveticaDocument.text('Standard fonts self-register in the node ESM build');
helveticaDocument.end();
assert.ok((await helveticaOutput) instanceof Uint8Array);
assert.ok(
  loadedStandardFontModules().some((file) => file.endsWith('Helvetica.cjs')),
);
assert.equal(
  loadedStandardFontModules().some(
    (file) => file.includes('Courier') || file.includes('TimesRoman'),
  ),
  false,
);

// The node ESM build reaches the standard fonts through createRequire, so the
// require condition is the only one ever taken at runtime. Bundlers and file
// tracers walk this same file as ESM and resolve `#standard-fonts/*` under the
// import condition instead: if the two point at different files, the tracer packs
// the modules that are never loaded, omits the ones that are, and the bundle
// throws `Cannot find module` on the first document. Keep every standard font
// resolving to the one file the runtime uses, under both conditions.
const standardFonts = Object.keys(packageJson.exports)
  .filter((entry) => entry.startsWith('./standard-fonts/'))
  .map((entry) => entry.slice('./standard-fonts/'.length));

assert.equal(standardFonts.length, 14);

for (const font of standardFonts) {
  const expected = new URL(`../js/standard-fonts/${font}.cjs`, import.meta.url)
    .href;
  assert.equal(import.meta.resolve(`#standard-fonts/${font}`), expected);
  assert.equal(
    require.resolve(`#standard-fonts/${font}`),
    fileURLToPath(expected),
  );
}

const fileDocument = new PDFDocument();
const fileOutput = toBytes(fileDocument);
fileDocument.font(
  fileURLToPath(new URL('fonts/Roboto-Regular.ttf', import.meta.url)),
);
fileDocument.text('The node build reads files from the real file system');
fileDocument.image(fileURLToPath(new URL('images/bee.png', import.meta.url)), {
  width: 100,
});
fileDocument.end();
assert.ok((await fileOutput) instanceof Uint8Array);
