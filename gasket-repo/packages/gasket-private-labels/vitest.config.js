import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.{js,jsx,ts,tsx,spec.js}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov']
    }
  }
});

