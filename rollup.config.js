import pkg from './package.json';
import babel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-cpy';

const external = [
  'stream',
  'fs',
  'zlib',
  'fontkit',
  'events',
  'linebreak',
  'png-js',
  'crypto-js',
  'saslprep'
];

export default [
  // CommonJS build for Node
  {
    input: 'lib/document.js',
    external,
    output: {
      name: 'pdfkit',
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      interop: false
    },
    plugins: [
      babel({
        babelrc: false,
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
              targets: {
                node: '6.10'
              }
            }
          ]
        ]
      }),
      copy({
        files: ['lib/font/data/*.afm', 'lib/color_profiles/*.icc'],
        dest: 'js/data'
      })
    ]
  },
  // ES for legacy (IE11) browsers
  {
    input: 'lib/document.js',
    external,
    output: {
      name: 'pdfkit.es5',
      file: pkg.module,
      format: 'es',
      sourcemap: true
    },
    plugins: [
      babel({
        babelrc: false,
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
              targets: {
                browsers: ['ie 11']
              },
              exclude: ['@babel/plugin-transform-typeof-symbol']
            }
          ]
        ]
      })
    ]
  },
  // ES for green browsers
  {
    input: 'lib/document.js',
    external,
    output: {
      name: 'pdfkit.esnext',
      file: pkg.esnext,
      format: 'es',
      sourcemap: true
    },
    plugins: [
      babel({
        babelrc: false,
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
              targets: {
                browsers: [
                  'Firefox 57',
                  'Edge 15',
                  'Chrome 60',
                  'iOS 10',
                  'Safari 10'
                ]
              }
            }
          ]
        ]
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
        babelrc: false,
        presets: [
          [
            '@babel/preset-env',
            {
              loose: true,
              modules: false,
              targets: {
                browsers: ['ie 11']
              }
            }
          ]
        ]
      })
    ]
  }
];
