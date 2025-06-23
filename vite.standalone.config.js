import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { external_packages, node_modules } from './vite.config.js';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    nodePolyfills({ include: node_modules }),
    {
      name: 'inline',
      async transform(code, filename) {
        const dirname = path.dirname(filename);
        return {
          // Inline any file imports
          code: code.replaceAll(/fs\.readFileSync\(__dirname \+ '(.+?)', '(.+?)'\);/g, (match, filename, encoding) => {
            const source = fs.readFileSync(path.join(dirname, filename), encoding);
            return `"${source.replaceAll('\n', '\\n')}";`;
          })
        };
      }
    }
  ],
  esbuild: {
    keepNames: true,
  },
  build: {
    outDir: "js",
    emptyOutDir: false,
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      input: 'lib/document.js',
      external: external_packages,
      output: {
        format: 'umd',
        name: 'pdfkit',
        entryFileNames: 'pdfkit.standalone.js',
        globals: {
          'crypto-js': 'CryptoJS',
          'fontkit': 'fontkit',
          'linebreak': 'LineBreaker',
          'jpeg-exif': 'exif',
          'png-js': 'PNG'
        }
      }
    }
  }
});
