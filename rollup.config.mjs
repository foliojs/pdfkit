import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import asset from './tools/asset-plugin.mjs';
import binary from './tools/binary-plugin.mjs';

const iccProfilePath = 'lib/mixins/data/sRGB_IEC61966_2_1.icc';

const external = [
  'module',
  'stream',
  'fs',
  'zlib',
  'fflate',
  'fontkit',
  'events',
  'linebreak',
  'png-js',
  'js-md5',
  '@noble/hashes/utils',
  '@noble/hashes/sha256',
  '@noble/ciphers/aes',
  'crypto',
  'saslprep',
];

const supportedBrowsers = [
  'Firefox 115', // ESR from 2023
  'iOS 16', // from 2022
  'Safari 16', // from 2022
];

const standardFontInputs = {
  Courier: 'lib/font/generated/Courier.js',
  CourierBold: 'lib/font/generated/CourierBold.js',
  CourierBoldOblique: 'lib/font/generated/CourierBoldOblique.js',
  CourierOblique: 'lib/font/generated/CourierOblique.js',
  Helvetica: 'lib/font/generated/Helvetica.js',
  HelveticaBold: 'lib/font/generated/HelveticaBold.js',
  HelveticaBoldOblique: 'lib/font/generated/HelveticaBoldOblique.js',
  HelveticaOblique: 'lib/font/generated/HelveticaOblique.js',
  Symbol: 'lib/font/generated/Symbol.js',
  TimesBold: 'lib/font/generated/TimesBold.js',
  TimesBoldItalic: 'lib/font/generated/TimesBoldItalic.js',
  TimesItalic: 'lib/font/generated/TimesItalic.js',
  TimesRoman: 'lib/font/generated/TimesRoman.js',
  ZapfDingbats: 'lib/font/generated/ZapfDingbats.js',
};

const browserPlugins = () => [
  binary('.icc'),
  nodeResolve({
    exportConditions: ['default'],
  }),
  babel({
    babelHelpers: 'bundled',
    babelrc: false,
    targets: {
      browsers: supportedBrowsers,
    },
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          targets: {
            browsers: supportedBrowsers,
          },
        },
      ],
    ],
    comments: false,
  }),
];

export default [
  // CommonJS and ES builds for Node
  {
    input: 'lib/document.node.js',
    external,
    output: [
      {
        name: 'pdfkit',
        file: 'js/pdfkit.js',
        format: 'cjs',
        sourcemap: true,
        interop: 'default',
        exports: 'named',
        footer:
          'module.exports = exports.default;\nmodule.exports.PDFDocument = exports.PDFDocument;\nmodule.exports.LineWrapper = exports.LineWrapper;\nmodule.exports.registerFile = exports.registerFile;',
      },
      {
        file: 'js/pdfkit.node.mjs',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      asset(iccProfilePath, 'data/sRGB_IEC61966_2_1.icc'),
      nodeResolve({
        exportConditions: ['node'],
      }),
      babel({
        targets: {
          node: '20',
        },
        babelHelpers: 'bundled',
        babelrc: false,
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
              targets: {
                node: '20',
              },
            },
          ],
        ],
        comments: false,
      }),
    ],
  },
  // ES for green browsers
  {
    input: 'lib/document.browser.js',
    external,
    output: {
      name: 'pdfkit.es',
      file: 'js/pdfkit.browser.mjs',
      format: 'es',
      sourcemap: true,
    },
    plugins: browserPlugins(),
  },
  // CommonJS browser build consumed by Browserify for the standalone bundle.
  {
    input: 'lib/document.browser.standalone.js',
    external,
    output: {
      file: 'js/pdfkit.browser.js',
      format: 'cjs',
      sourcemap: true,
      interop: 'default',
      exports: 'named',
      footer:
        'module.exports = exports.default;\nmodule.exports.PDFDocument = exports.PDFDocument;',
    },
    plugins: browserPlugins(),
  },
  // Experimental helpers for collecting document output.
  {
    input: 'lib/output.js',
    output: [
      {
        file: 'js/output.cjs',
        format: 'cjs',
        exports: 'named',
      },
      {
        file: 'js/output.mjs',
        format: 'es',
      },
    ],
    plugins: browserPlugins(),
  },
  // Standard font data is kept outside the main bundles so it can be loaded
  // individually on demand.
  {
    input: standardFontInputs,
    output: [
      {
        dir: 'js/standard-fonts',
        format: 'cjs',
        entryFileNames: '[name].cjs',
        chunkFileNames: 'chunks/[name]-[hash].cjs',
        exports: 'default',
      },
      {
        dir: 'js/standard-fonts',
        format: 'es',
        entryFileNames: '[name].mjs',
        chunkFileNames: 'chunks/[name]-[hash].mjs',
      },
    ],
    plugins: [
      babel({
        babelHelpers: 'bundled',
        babelrc: false,
        comments: false,
      }),
    ],
  },
];
