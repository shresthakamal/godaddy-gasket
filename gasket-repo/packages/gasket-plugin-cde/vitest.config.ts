import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.(test|spec).ts'],
    exclude: ['node_modules'],
    coverage: {
      provider: 'v8',
      include: ['src'],
      reporter: ['text', 'lcov']
    },
    globals: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  esbuild: {
    target: 'ES2022'
  }
});
