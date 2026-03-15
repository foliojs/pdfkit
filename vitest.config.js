import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.spec.js'],
    exclude: ['**/node_modules/**', 'examples/**'],
    setupFiles: ['./tests/unit/setupTests.js'],
  },
});
