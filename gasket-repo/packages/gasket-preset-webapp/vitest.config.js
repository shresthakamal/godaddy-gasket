import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    globals: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['lib/**/*.js'],
      exclude: ['lib/**/*.d.ts', 'cjs/**', '**/node_modules/**'],
      ignoreEmptyLines: true,
      reporter: ['text', 'json', 'html']
    }
  }
});
