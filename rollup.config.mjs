import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';

const external = [
  'stream',
  'fs',
  'zlib',
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

export default [
  // CommonJS build for Node
  {
    input: 'lib/document.js',
    external,
    output: {
      name: 'pdfkit',
      file: 'js/pdfkit.js',
      format: 'cjs',
      sourcemap: true,
      interop: 'default',
    },
    plugins: [
      nodeResolve({
        exportConditions: ['node'],
      }),
      babel({
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
      copy({
        targets: [
          {
            src: ['lib/font/data/*.afm', 'lib/mixins/data/*.icc'],
            dest: 'js/data',
          },
        ],
      }),
    ],
  },
  // ES for green browsers
  {
    input: 'lib/document.js',
    external,
    output: {
      name: 'pdfkit.es',
      file: 'js/pdfkit.browser.mjs',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      nodeResolve({
        exportConditions: ['default'],
      }),
      babel({
        babelHelpers: 'bundled',
        babelrc: false,
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
              bugfixes: true,
              targets: {
                browsers: supportedBrowsers,
              },
            },
          ],
        ],
        comments: false,
      }),
    ],
  },
  {
    input: 'lib/virtual-fs.js',
    external,
    output: {
      name: 'virtual-fs',
      file: 'js/virtual-fs.js',
      format: 'es',
      sourcemap: false,
    },
    plugins: [
      babel({
        babelHelpers: 'bundled',
        babelrc: false,
        presets: [
          [
            '@babel/preset-env',
            {
              loose: true,
              modules: false,
              targets: {
                browsers: supportedBrowsers,
              },
            },
          ],
        ],
      }),
    ],
  },
];
