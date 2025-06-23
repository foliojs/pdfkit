import { defineConfig } from 'vitest/config';
import { viteStaticCopy } from 'vite-plugin-static-copy'

export const node_modules = [
  'stream',
  'zlib',
  'fs',
  'events',
];

export const external_packages = [
  'fontkit',
  'linebreak',
  'png-js',
  'crypto-js',
  'jpeg-exif'
]
export const external = [
  ...node_modules,
  ...external_packages,
];

export default defineConfig({
  test: {
    globals: true,
    setupFiles: './tests/unit/setupTests.js',
    coverage: {
      provider: 'istanbul'
    },
    fileParallelism: true,
    dir: 'tests'
  },
  esbuild: {
    keepNames: true,
  },
  build: {
    outDir: "js",
    lib: {
      entry: 'lib/document.js',
      fileName: 'pdfkit',
    },
    rollupOptions: {
      external,
      output: [
        {format: 'cjs', entryFileNames: 'pdfkit.js'},
        {format: 'es', entryFileNames: 'pdfkit.es.js'},
      ]
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: ['lib/font/data/*.afm', 'lib/mixins/data/*.icc'], dest: 'data' }
      ]
    })
  ]
});
