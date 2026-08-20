import { defineConfig, globalIgnores } from 'eslint/config';
import jest from 'eslint-plugin-jest';
import goddaddyTypescript from 'eslint-config-godaddy-typescript';
import goddaddyReactTypescript from 'eslint-config-godaddy-react-typescript';
import unicorn from 'eslint-plugin-unicorn';
import vitest from '@vitest/eslint-plugin';
import jsdoc from 'eslint-plugin-jsdoc';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';

export default defineConfig([
  ...goddaddyTypescript,
  ...goddaddyReactTypescript,
  vitest.configs.recommended,
  jsdoc.configs['flat/recommended'],
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/cjs/**',
    '**/react/**',
    '**/generator/**',
    '**/__mocks__/**',
    '**/test/fixtures/**',
    '**/gasket-hcs/lib',
    '**/gasket-plugin-cde/lib',
    '**/gasket-plugin-switchboard/lib',
    '**/gasket-header-nav/lib',
    'tools/gasket-testing-tool/__apps__/**',
    '**/gasket-upgrade-cli/lib/patches/**',
    '**/gasket-plugin-content/lib/**',
    '**/gasket-plugin-contentful/lib/**',
    '**/gasket-plugin-goat/lib/**',
    '**/gasket-content-components/lib/**',
    '**/gasket-content-nodes/lib/**',
    '**/template/.next/**',
    '**/template/build/**',
    '**/template/dist/**',
    '**/template/{.eslintrc.cjs,babel.config.cjs}',
    '**/template/next-env.d.ts'
  ]),
  //
  // Configurations for Jest and Unicorn
  //
  {
    plugins: {
      jest,
      unicorn
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error'
    },
    languageOptions: {
      globals: {
        ...jest.environments.globals.globals
      }
    },
    rules: {
      ...jest.configs.recommended.rules,
      'unicorn/filename-case': 'error',
      'no-sync': 'warn',
      'vitest/expect-expect': 'warn'
    }
  },
  //
  // Configurations for TypeScript files
  //
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      typescriptPlugin.configs['flat/recommended']
    ],
    plugins: {
      '@typescript-eslint': typescriptPlugin
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'no-unused-vars': 'off',
      'no-unused-expressions': 'off',
      'no-unused-labels': 'off',
      'no-undef': 'warn',
      'camelcase': 'off',
      'spaced-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/triple-slash-reference': 'warn',
      'jsdoc/require-description': 'warn',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-param': 'off',
      'react/jsx-curly-spacing': 'off'
    }
  },
  //
  // Disable certain rules for TypeScript test files
  //
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'jest/valid-title': 'warn',
      'vitest/valid-title': 'warn',
      'react/jsx-curly-spacing': 'off',
      'react/react-in-jsx-scope': 'off'
    }
  },
  //
  // Disable JSDoc rules for test files
  //
  {
    files: ['**/*.test.{js,jsx}', '**/*.spec.{js,jsx}'],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-param': 'off'
    }
  },
  //
  // Disable required assertions for TypeScript test files
  //
  {
    files: ['packages/gasket-typescript-tests/**'],
    rules: {
      'jest/expect-expect': 'off',
      'jsdoc/require-description': 'off',
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-param-type': 'off',
      'vitest/expect-expect': 'off'
    }
  },
  //
  // Disable indent rule for problematic files
  //
  {
    files: ['**/content-context-provider.spec.tsx', 'packages/gasket-header-nav/src/make-with-header-nav.tsx'],
    rules: {
      indent: 'off'
    }
  },

  //
  // Testing tool rules
  //
  {
    files: ['tools/gasket-testing-tool/**'],
    rules: {
      'no-console': 'off',
      'no-sync': 'off',
      'max-len': 'off',
      'no-process-env': 'off',
      'jsdoc/require-returns-check': 'off',
      'no-process-exit': 'off',
      'indent': 'warn',
      'no-nested-ternary': 'warn'
    }
  }
]);
