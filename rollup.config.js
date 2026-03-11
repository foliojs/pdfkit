import { babel } from '@rollup/plugin-babel';
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
  'saslprep'
];

const supportedBrowsers = [
  'Firefox 102', // ESR from 2022
  'iOS 14', // from 2020
  'Safari 14' // from 2020
];

export default [
  // CommonJS build for Node
  {
    input: {
      pdfkit: 'lib/document.js',
      write_svg: 'lib/write_svg.js'
    },
    external,
    output: {
      entryFileNames: '[name].js',
      dir: 'js',
      format: 'cjs',
      sourcemap: true,
      interop: false,
    },
    plugins: [
      babel({
        babelHelpers: 'bundled',
        babelrc: false,
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
              targets: {
                node: '18'
              }
            }
          ]
        ],
        comments: false
      }),
      copy({
        targets: [
          { src: ['lib/font/data/*.afm', 'lib/mixins/data/*.icc'], dest: 'js/data' },
        ]
      })
    ]
  },
  // ES for green browsers
  {
    input: {
      pdfkit: 'lib/document.js',
      write_svg: 'lib/write_svg.js'
    },
    external,
    output: {
      dir: 'js',
      entryFileNames: '[name].es.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      babel({
        babelHelpers: 'bundled',
        babelrc: false,
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
              targets: {
                browsers: supportedBrowsers
              }
            }
          ]
        ],
        comments: false
      })
    ]
  },
  {
    input: 'lib/virtual-fs.js',
    external,
    output: {
      name: 'virtual-fs',
      file: 'js/virtual-fs.js',
      format: 'cjs',
      sourcemap: false
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
                browsers: supportedBrowsers
              }
            }
          ]
        ]
      })
    ]
  }
];
