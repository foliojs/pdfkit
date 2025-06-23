import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    keepNames: true,
  },
  build: {
    outDir: "js",
    emptyOutDir: false,
    lib: {
      entry: 'lib/virtual-fs.js',
      fileName: 'virtual-fs',
    },
    rollupOptions: {
      output: [
        {format: 'cjs', entryFileNames: 'virtual-fs.js'},
        {format: 'es', entryFileNames: 'virtual-fs.es.js'},
      ]
    },
  },
});
