import pkg from './package.json';
import babel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-cpy';

const external = ['stream', 'fs', 'zlib', 'fontkit', 'events', 'linebreak', 'png-js'];

// supports using brfs transform
const stripFSInterop = function () {
  return {
    renderChunk (code) {
      code = code.replace('var fs = _interopDefault(require(\'fs\'));', 'var fs = require(\'fs\');');
      return {
        code,
        map: null
      }
    }
  }
}

export default [
	// CommonJS build for Node
	{
    input: 'lib/document.js',
    external,
		output: {
			name: 'pdfkit',
			file: pkg.main,
      format: 'cjs',
      sourcemap: true
		},
		plugins: [
			babel({
        babelrc: false,
        presets: [['env', { 
          modules: false,
          targets: {
            node: '6.10'
          }
        }]],
        plugins: ['external-helpers']
      }),
      copy({
        files: ['lib/font/data/*.afm'],
        dest: 'js/font/data'
      }),
      stripFSInterop()
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
        presets: [['env', { 
          modules: false,
          targets: {
            browsers: [
              'ie 11'
            ]
          }
        }]],
        plugins: ['external-helpers'],
        exclude: ['babel-plugin-transform-es2015-typeof-symbol']
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
        presets: [['env', { 
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
        }]],
        plugins: ['external-helpers']
      })
		]
	}
];