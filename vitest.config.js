import { defineConfig } from 'vitest/config';
import binary from './tools/binary-plugin.mjs';

export default defineConfig({
  plugins: [binary('.icc')],
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.spec.js'],
    exclude: ['**/node_modules/**', 'examples/**'],
    setupFiles: ['./tests/unit/setupTests.js'],
  },
});
