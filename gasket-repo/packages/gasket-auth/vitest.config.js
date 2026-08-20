import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react'
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov']
    },
    include: ['test/**/*.{js,jsx,ts,tsx,spec.js}', 'src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['test/setup.js', 'test/fixures/**/*']
  }
});
