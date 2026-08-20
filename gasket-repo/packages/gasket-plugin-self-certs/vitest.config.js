// @ts-nocheck
import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.js'],
      exclude: ['lib/**/*.d.ts', 'cjs/**'],
      reporter: ['text', 'lcov', 'html']
    }
  }
});
