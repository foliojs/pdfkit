import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { rollup } from 'rollup';
import Helvetica from '../../lib/font/generated/Helvetica';

const rootDir = fileURLToPath(new URL('../..', import.meta.url));
const iccProfile = readFileSync(
  path.join(rootDir, 'lib/mixins/data/sRGB_IEC61966_2_1.icc'),
);

const render = (document) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    document.on('data', (chunk) => chunks.push(chunk));
    document.on('end', () => resolve(Buffer.concat(chunks)));
    document.on('error', reject);
    document.end();
  });

// Bundles the Node build the way an application bundler does: every module of
// pdfkit folded into one file that lives in a directory of its own, so neither
// the `standard-fonts/` nor the `data/` directory of the pdfkit package sits
// next to it. The bundle sits under node_modules so bare
// imports of pdfkit's dependencies still resolve and Vitest leaves it to Node.
describe('bundled node build', () => {
  let bundleDir;
  let esmBundle;
  let cjsBundle;

  beforeAll(async () => {
    const cacheDir = path.join(rootDir, 'node_modules/.cache');
    mkdirSync(cacheDir, { recursive: true });
    bundleDir = mkdtempSync(path.join(cacheDir, 'pdfkit-bundle-'));
    writeFileSync(path.join(bundleDir, 'package.json'), '{}\n');

    const bundle = await rollup({
      input: path.join(rootDir, 'lib/document.node.js'),
      external: (id) =>
        !id.startsWith('.') && !id.startsWith('#') && !path.isAbsolute(id),
      plugins: [nodeResolve({ exportConditions: ['node'] })],
      onwarn: () => {},
    });

    esmBundle = path.join(bundleDir, 'pdfkit.mjs');
    await bundle.write({ file: esmBundle, format: 'es' });

    // A CommonJS output has no `import.meta`; esbuild substitutes an empty
    // object, so every `import.meta.url` reads as undefined.
    cjsBundle = path.join(bundleDir, 'pdfkit.cjs');
    await bundle.write({
      file: cjsBundle,
      format: 'cjs',
      exports: 'named',
      plugins: [
        { name: 'no-import-meta', resolveImportMeta: () => 'undefined' },
      ],
    });

    await bundle.close();
  });

  afterAll(() => {
    rmSync(bundleDir, { recursive: true, force: true });
  });

  describe.each([
    ['ESM', () => import(pathToFileURL(esmBundle).href)],
    ['CommonJS', () => createRequire(import.meta.url)(cjsBundle)],
  ])('as %s', (format, load) => {
    let pdfkit;

    beforeAll(async () => {
      pdfkit = await load();
    });

    test('loads without touching the standard fonts', () => {
      expect(typeof pdfkit.PDFDocument).toBe('function');
      expect(typeof pdfkit.registerStdFonts).toBe('function');
      expect(typeof pdfkit.registerFile).toBe('function');
    });

    test('explains a standard font it cannot find', () => {
      let error;
      try {
        new pdfkit.PDFDocument();
      } catch (caught) {
        error = caught;
      }

      expect(error.message).toMatch(
        /^Cannot load the standard font "Helvetica" .*registerStdFonts\(\)/s,
      );
      expect(error.cause.code).toBe('MODULE_NOT_FOUND');
    });

    test('renders with a registered standard font', async () => {
      pdfkit.registerStdFonts(Helvetica);

      const document = new pdfkit.PDFDocument();
      document.text('Standard fonts can be registered in a bundle');
      const output = await render(document);

      expect(output.subarray(0, 5).toString()).toBe('%PDF-');
    });

    test('rejects a font that is still unregistered', () => {
      const document = new pdfkit.PDFDocument();

      expect(() => document.font('Courier')).toThrow(
        /^Cannot load the standard font "Courier" /,
      );
    });

    if (format === 'ESM') {
      test('reads the ICC profile relative to the bundle', async () => {
        const document = new pdfkit.PDFDocument({ subset: 'PDF/A-1' });
        await expect(render(document)).rejects.toThrow(/ENOENT/);

        pdfkit.registerFile(
          new URL('./data/sRGB_IEC61966_2_1.icc', pathToFileURL(esmBundle))
            .href,
          new Uint8Array(iccProfile),
        );
        const registered = new pdfkit.PDFDocument({ subset: 'PDF/A-1' });
        const output = await render(registered);

        expect(output.subarray(0, 5).toString()).toBe('%PDF-');
      });
    } else {
      test('explains a missing import.meta.url when PDF/A needs the profile', async () => {
        const document = new pdfkit.PDFDocument({ subset: 'PDF/A-1' });

        await expect(render(document)).rejects.toThrow(
          /import\.meta\.url is not available/,
        );
      });
    }
  });
});
