/* eslint-disable max-nested-callbacks */
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.join(__dirname, '../template');

describe('@godaddy/gasket-template-webapp-express', () => {
  describe('Template Structure', () => {
    const expectedFiles = [
      'package.json',
      'gasket.ts',
      'gasket-data.ts',
      'next.config.js',
      'server.ts',
      'instrumentation.ts',
      'intl.ts',
      'vitest.config.js',
      'tsconfig.json',
      'tsconfig.server.json',
      'next-env.d.ts',
      'manifest.xml',
      'README.md'
    ];

    expectedFiles.forEach(file => {
      it(`should have ${file}`, () => {
        expect(fs.existsSync(path.join(templatePath, file))).toBe(true);
      });
    });

    const expectedDirectories = [
      'pages',
      'components',
      'locales',
      'styles',
      'test'
    ];

    expectedDirectories.forEach(dir => {
      it(`should have ${dir} directory`, () => {
        expect(fs.statSync(path.join(templatePath, dir)).isDirectory()).toBe(true);
      });
    });
  });

  describe('TypeScript Configuration', () => {
    let tsconfig, tsconfigServer;

    beforeAll(() => {
      const tsconfigPath = path.join(templatePath, 'tsconfig.json');
      const tsconfigServerPath = path.join(templatePath, 'tsconfig.server.json');

      tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      tsconfigServer = JSON.parse(fs.readFileSync(tsconfigServerPath, 'utf8'));
    });

    it('should have proper TypeScript config for Next.js', () => {
      expect(tsconfig.compilerOptions.target).toBe('ESNext');
      expect(tsconfig.compilerOptions.lib).toContain('dom');
      expect(tsconfig.compilerOptions.allowJs).toBe(true);
      expect(tsconfig.compilerOptions.skipLibCheck).toBe(true);
      expect(tsconfig.compilerOptions.strict).toBe(false); // Not yet enabled
      expect(tsconfig.compilerOptions.noEmit).toBe(true);
      expect(tsconfig.compilerOptions.esModuleInterop).toBe(true);
      expect(tsconfig.compilerOptions.module).toBe('ESNext');
      expect(tsconfig.compilerOptions.moduleResolution).toBe('bundler');
      expect(tsconfig.compilerOptions.resolveJsonModule).toBe(true);
      expect(tsconfig.compilerOptions.isolatedModules).toBe(true);
      expect(tsconfig.compilerOptions.jsx).toBe('react-jsx');
      expect(tsconfig.compilerOptions.incremental).toBe(true);
    });

    it('should include TypeScript files in paths', () => {
      expect(tsconfig.include).toContain('**/*.ts');
      expect(tsconfig.include).toContain('**/*.tsx');
      expect(tsconfig.include).toContain('.next/types/**/*.ts');
    });

    it('should have server-specific TypeScript config', () => {
      // Server config doesn't extend main config in this setup
      expect(tsconfigServer.compilerOptions.module).toBe('NodeNext');
      expect(tsconfigServer.compilerOptions.moduleResolution).toBe('NodeNext');
      expect(tsconfigServer.include).toContain('server.ts');
      expect(tsconfigServer.include).toContain('gasket.ts');
    });

    it('should exclude node_modules in server config', () => {
      expect(tsconfigServer.exclude).toContain('node_modules');
    });
  });

  describe('Pages Router Structure', () => {
    const pagesRouterFiles = [
      'pages/_app.tsx',
      'pages/_document.ts',
      'pages/_error.tsx',
      'pages/index.tsx'
    ];

    pagesRouterFiles.forEach(file => {
      it(`should have Pages Router file ${file}`, () => {
        expect(fs.existsSync(path.join(templatePath, file))).toBe(true);
      });
    });

    it('should not have App Router files', () => {
      const appRouterFiles = ['app/layout.tsx', 'app/page.tsx', 'middleware.ts'];
      appRouterFiles.forEach(file => {
        expect(fs.existsSync(path.join(templatePath, file))).toBe(false);
      });
    });

    it('should have _app.tsx with proper setup', () => {
      const appPath = path.join(templatePath, 'pages/_app.tsx');
      const content = fs.readFileSync(appPath, 'utf8');
      expect(content).toMatch(/createApp/);
      expect(content).toMatch(/reportWebVitals/);
    });

    it('should have _document.ts with document setup', () => {
      const documentPath = path.join(templatePath, 'pages/_document.ts');
      const content = fs.readFileSync(documentPath, 'utf8');
      expect(content).toMatch(/makeDocument/);
      expect(content).toMatch(/withGasketData/);
    });

    it('should have components directory with head.tsx', () => {
      const headPath = path.join(templatePath, 'components/head.tsx');
      expect(fs.existsSync(headPath)).toBe(true);

      const content = fs.readFileSync(headPath, 'utf8');
      expect(content).toMatch(/NextHead/);
    });
  });

  describe('Express Server Configuration', () => {
    it('should have server.ts with Express setup', () => {
      const serverPath = path.join(templatePath, 'server.ts');
      expect(fs.existsSync(serverPath)).toBe(true);

      const content = fs.readFileSync(serverPath, 'utf8');
      expect(content).toMatch(/startServer/);
    });

    it('should not have middleware.ts (Pages Router specific)', () => {
      const middlewarePath = path.join(templatePath, 'middleware.ts');
      expect(fs.existsSync(middlewarePath)).toBe(false);
    });
  });

  describe('Package.json Validation', () => {
    let packageJson;

    beforeAll(() => {
      const packagePath = path.join(templatePath, 'package.json');
      packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    });

    it('should have type: module', () => {
      expect(packageJson.type).toBe('module');
    });

    it('should have TypeScript dependencies', () => {
      expect(packageJson.dependencies).toHaveProperty('typescript');
      expect(packageJson.dependencies).toHaveProperty('@types/react');
      expect(packageJson.dependencies).toHaveProperty('tsx');
      expect(packageJson.devDependencies).toHaveProperty('@typescript-eslint/parser');
    });

    it('should have required dependencies', () => {
      const requiredDeps = [
        '@gasket/assets',
        '@gasket/core',
        '@gasket/data',
        '@gasket/intl',
        '@gasket/nextjs',
        '@gasket/plugin-command',
        '@gasket/plugin-data',
        '@gasket/plugin-dynamic-plugins',
        '@gasket/plugin-express',
        '@gasket/plugin-https',
        '@gasket/plugin-intl',
        '@gasket/plugin-logger',
        '@gasket/plugin-nextjs',
        '@gasket/plugin-webpack',
        '@gasket/plugin-winston',
        '@gasket/react-intl',
        '@gasket/request',
        '@gasket/utils',
        '@godaddy/browserslist-config',
        '@godaddy/gasket-next',
        '@godaddy/gasket-plugin-atlas',
        '@godaddy/gasket-plugin-auth',
        '@godaddy/gasket-plugin-dev-certs',
        '@godaddy/gasket-plugin-otel',
        '@godaddy/gasket-plugin-security',
        '@godaddy/gasket-plugin-self-certs',
        '@godaddy/gasket-plugin-traffic',
        '@godaddy/gasket-plugin-uxp',
        '@godaddy/gasket-plugin-visitor',
        '@godaddy/react-mintl',
        '@opentelemetry/api',
        '@opentelemetry/resources',
        '@opentelemetry/semantic-conventions',
        '@types/react',
        '@ux/box',
        '@ux/button',
        '@ux/card',
        '@ux/icon',
        '@ux/intents',
        '@ux/pivot',
        '@ux/text',
        '@vercel/otel',
        'express',
        'next',
        'react',
        'react-dom',
        'react-transition-group',
        'tsx',
        'typescript',
        'winston'
      ];

      requiredDeps.forEach(dep => {
        expect(packageJson.dependencies).toHaveProperty(dep);
      });
    });

    it('should have required dev dependencies', () => {
      const requiredDevDeps = [
        '@babel/core',
        '@docusaurus/core',
        '@docusaurus/preset-classic',
        '@gasket/plugin-analyze',
        '@gasket/plugin-docs',
        '@gasket/plugin-docusaurus',
        '@gasket/plugin-metadata',
        '@godaddy/postcss-merge-selectors',
        '@testing-library/dom',
        '@testing-library/react',
        '@typescript-eslint/parser',
        '@vitejs/plugin-react',
        '@vitest/coverage-v8',
        'ajv',
        'concurrently',
        'eslint',
        'eslint-config-godaddy-react',
        'eslint-plugin-react-hooks',
        'file-loader',
        'jsdom',
        '@ux/postcss-intents',
        'postcss',
        'postcss-flexbugs-fixes',
        'postcss-preset-env',
        'search-insights',
        'stylelint',
        'stylelint-config-godaddy',
        'typescript',
        'url-loader',
        'vitest',
        'webpack'
      ];

      requiredDevDeps.forEach(dep => {
        expect(packageJson.devDependencies).toHaveProperty(dep);
      });
    });

    it('should have build scripts for TypeScript', () => {
      expect(packageJson.scripts).toHaveProperty('build:tsc');
      expect(packageJson.scripts).toHaveProperty('build:tsc:watch');
      expect(packageJson.scripts.build).toMatch(/build:tsc/);
    });

    it('should have Express-specific dependencies', () => {
      expect(packageJson.dependencies).toHaveProperty('express');
      expect(packageJson.dependencies).toHaveProperty('@gasket/plugin-express');
      expect(packageJson.dependencies).toHaveProperty('@gasket/plugin-https');
      expect(packageJson.devDependencies).toHaveProperty('concurrently');
    });

    it('should have correct scripts', () => {
      const requiredScripts = [
        'build',
        'start',
        'local',
        'test',
        'lint',
        'stylelint'
      ];

      requiredScripts.forEach(script => {
        expect(packageJson.scripts).toHaveProperty(script);
      });

      // Check TypeScript/Express-specific scripts
      expect(packageJson.scripts.local).toMatch(/tsx watch/);
      expect(packageJson.scripts.start).toMatch(/dist\/server\.js/);
      expect(packageJson.scripts.docs).toMatch(/tsx gasket\.ts/);
    });

    it('should have TSX for development', () => {
      expect(packageJson.dependencies).toHaveProperty('tsx');
    });

    it('should have concurrently for development', () => {
      expect(packageJson.devDependencies).toHaveProperty('concurrently');
    });

    it('should be configured as ES module', () => {
      expect(packageJson.type).toBe('module');
    });
  });

  describe('Gasket Configuration', () => {
    it('should have valid gasket.ts', () => {
      const gasketPath = path.join(templatePath, 'gasket.ts');
      const content = fs.readFileSync(gasketPath, 'utf8');

      expect(content).toMatch(/makeGasket/);
      expect(content).toMatch(/pluginNextjs/);
      expect(content).toMatch(/pluginExpress/);
      expect(content).toMatch(/export default/);
    });

    it('should have gasket-data.ts', () => {
      const gasketDataPath = path.join(templatePath, 'gasket-data.ts');
      const content = fs.readFileSync(gasketDataPath, 'utf8');

      // This template uses a simple export default object instead of makeGasketData
      expect(content).toMatch(/export default/);
      expect(content).toMatch(/examplePrivateSetting/);
      expect(content).toMatch(/public/);
    });

    it('should have intl.ts configuration', () => {
      const intlPath = path.join(templatePath, 'intl.ts');
      const content = fs.readFileSync(intlPath, 'utf8');

      expect(content).toMatch(/makeIntlManager/);
      expect(content).toMatch(/export default/);
    });
  });

  describe('Configuration Files', () => {
    it('should have valid next.config.js', () => {
      const nextConfigPath = path.join(templatePath, 'next.config.js');
      const content = fs.readFileSync(nextConfigPath, 'utf8');

      expect(content).toMatch(/gasket\.actions\.getNextConfig/);
      expect(content).toMatch(/export default/);
    });

    it('should have valid vitest.config.js', () => {
      const vitestConfigPath = path.join(templatePath, 'vitest.config.js');
      const content = fs.readFileSync(vitestConfigPath, 'utf8');

      expect(content).toMatch(/defineConfig/);
      expect(content).toMatch(/@vitejs\/plugin-react/);
    });

    it('should not have middleware.ts (Pages Router)', () => {
      const middlewarePath = path.join(templatePath, 'middleware.ts');
      expect(fs.existsSync(middlewarePath)).toBe(false);
    });
  });

  describe('Test Setup', () => {
    it('should have test files with TypeScript', () => {
      const testPath = path.join(templatePath, 'test', 'index.test.tsx');
      expect(fs.existsSync(testPath)).toBe(true);

      const content = fs.readFileSync(testPath, 'utf8');
      expect(content).toMatch(/import.*from 'react'/);
      expect(content).toMatch(/render/);
    });

    it('should have vitest config', () => {
      const vitestPath = path.join(templatePath, 'vitest.config.js');
      expect(fs.existsSync(vitestPath)).toBe(true);

      const content = fs.readFileSync(vitestPath, 'utf8');
      expect(content).toMatch(/@vitejs\/plugin-react/);
      expect(content).toMatch(/jsdom/);
    });
  });

  describe('Server Configuration', () => {
    it('should have server.ts for Express server', () => {
      const serverPath = path.join(templatePath, 'server.ts');
      expect(fs.existsSync(serverPath)).toBe(true);

      const content = fs.readFileSync(serverPath, 'utf8');
      expect(content).toMatch(/startServer/);
    });

    it('should have instrumentation.ts for OpenTelemetry', () => {
      const instrumentPath = path.join(templatePath, 'instrumentation.ts');
      expect(fs.existsSync(instrumentPath)).toBe(true);

      const content = fs.readFileSync(instrumentPath, 'utf8');
      expect(content).toMatch(/register/);
    });
  });

  describe('Localization Files', () => {
    it('should have locale files', () => {
      const localeFiles = ['en-US.json', 'fr-FR.json'];
      localeFiles.forEach(file => {
        const localePath = path.join(templatePath, 'locales', file);
        expect(fs.existsSync(localePath)).toBe(true);

        const content = fs.readFileSync(localePath, 'utf8');
        expect(() => JSON.parse(content)).not.toThrow();
      });
    });
  });

  describe('Styles', () => {
    it('should have global styles', () => {
      const stylesPath = path.join(templatePath, 'styles/global.css');
      expect(fs.existsSync(stylesPath)).toBe(true);
    });

    it('should have PostCSS configuration', () => {
      const packagePath = path.join(templatePath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      expect(packageJson.postcss).toBeDefined();
      expect(packageJson.postcss.plugins).toHaveProperty('postcss-flexbugs-fixes');
      expect(packageJson.postcss.plugins).toHaveProperty('postcss-preset-env');
    });

    it('should have stylelint configuration', () => {
      const packagePath = path.join(templatePath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      expect(packageJson.stylelint).toBeDefined();
      expect(packageJson.stylelint.extends).toContain('stylelint-config-godaddy');
    });
  });

  describe('ESLint Configuration', () => {
    it('should have TypeScript-aware ESLint', () => {
      const packagePath = path.join(templatePath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      expect(packageJson.eslintConfig.parser).toBe('@typescript-eslint/parser');
      expect(packageJson.eslintConfig.extends).toContain('godaddy-react');
    });
  });

  describe('OpenTelemetry Configuration', () => {
    it('should have OTEL in start scripts', () => {
      const packagePath = path.join(templatePath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      expect(packageJson.scripts.start).toMatch(/@godaddy\/gasket-otel/);
      expect(packageJson.scripts.start).toMatch(/NEXT_OTEL_VERBOSE/);
    });
  });

  describe('Template Integrity', () => {
    it('should not contain template placeholders', () => {
      const filesToCheck = [
        'package.json',
        'README.md',
        'gasket.ts'
      ];

      filesToCheck.forEach(file => {
        const filePath = path.join(templatePath, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          // Check for common template placeholders
          expect(content).not.toMatch(/__.*__/);
          expect(content).not.toMatch(/\$\{.*\}/);
        }
      });
    });
  });
});
