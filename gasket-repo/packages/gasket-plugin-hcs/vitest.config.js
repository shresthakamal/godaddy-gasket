import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    alias: {
      '@godaddy/gasket-plugin-hcs/lib/components/manifest.js': '<rootDir>/components/manifest.js',
      'build/index.server.cjs': '<rootDir>/generator/files/components/index.js'
    },
    testTimeout: 10000,
    exclude: ['node_modules', 'generator'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov']
    }
  }
});
