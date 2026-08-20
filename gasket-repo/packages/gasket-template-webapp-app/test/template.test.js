import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.join(__dirname, '../template');

describe('@godaddy/gasket-template-webapp-app', () => {
  describe('Template Structure', () => {
    const expectedFiles = [
      'package.json',
      'gasket.ts',
      'gasket.edge.ts',
      'gasket-data.ts',
      'next.config.js',
      'middleware.ts',
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
      'app',
      'locales',
      'styles',
      'test'
    ];

    expectedDirectories.forEach(dir => {
      it(`should have ${dir} directory`, () => {
        expect(fs.existsSync(path.join(templatePath, dir))).toBe(true);
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

  describe('App Router Structure', () => {
    const appDir = path.join(templatePath, 'app');

    it('should have root layout.tsx', () => {
      const layoutPath = path.join(appDir, 'layout.tsx');
      expect(fs.existsSync(layoutPath)).toBe(true);

      const content = fs.readFileSync(layoutPath, 'utf8');
      expect(content).toMatch(/export default function RootLayout/);
    });

    it('should have root page.tsx', () => {
      const pagePath = path.join(appDir, 'page.tsx');
      expect(fs.existsSync(pagePath)).toBe(true);
    });

    it('should have error.tsx', () => {
      const errorPath = path.join(appDir, 'error.tsx');
      expect(fs.existsSync(errorPath)).toBe(true);

      const content = fs.readFileSync(errorPath, 'utf8');
      expect(content).toMatch(/'use client'/);
    });

    it('should have dynamic routes structure', () => {
      const dynamicPath = path.join(appDir, '[plid]', '[market]', '[currency]');
      expect(fs.existsSync(dynamicPath)).toBe(true);

      expect(fs.existsSync(path.join(dynamicPath, 'layout.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(dynamicPath, 'page.tsx'))).toBe(true);
    });

    it('should have API route structure', () => {
      const apiPath = path.join(appDir, 'api', 'auth', 'validate');
      expect(fs.existsSync(apiPath)).toBe(true);
      expect(fs.existsSync(path.join(apiPath, 'route.ts'))).toBe(true);
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
        '@gasket/plugin-https-proxy',
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

    it('should have proper test setup', () => {
      expect(packageJson.scripts).toHaveProperty('test');
      expect(packageJson.scripts).toHaveProperty('test:watch');
      expect(packageJson.devDependencies).toHaveProperty('vitest');
      expect(packageJson.devDependencies).toHaveProperty('@vitejs/plugin-react');
    });

    it('should have TSX for development', () => {
      expect(packageJson.dependencies).toHaveProperty('tsx');
    });

    it('should have concurrently for development', () => {
      expect(packageJson.devDependencies).toHaveProperty('concurrently');
    });
  });

  describe('Gasket Configuration', () => {
    it('should have valid gasket.ts', () => {
      const gasketPath = path.join(templatePath, 'gasket.ts');
      const content = fs.readFileSync(gasketPath, 'utf8');

      expect(content).toMatch(/makeGasket/);
      expect(content).toMatch(/pluginNextjs/);
      expect(content).toMatch(/export default/);
    });

    it('should have gasket.edge.ts for middleware', () => {
      const gasketEdgePath = path.join(templatePath, 'gasket.edge.ts');
      const content = fs.readFileSync(gasketEdgePath, 'utf8');

      expect(content).toMatch(/makeGasket/);
      expect(content).toMatch(/pluginVisitor/);
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
    it('should have server.ts for proxy server', () => {
      const serverPath = path.join(templatePath, 'server.ts');
      expect(fs.existsSync(serverPath)).toBe(true);

      const content = fs.readFileSync(serverPath, 'utf8');
      expect(content).toMatch(/startProxyServer/);
    });

    it('should have instrumentation.ts for OpenTelemetry', () => {
      const instrumentPath = path.join(templatePath, 'instrumentation.ts');
      expect(fs.existsSync(instrumentPath)).toBe(true);

      const content = fs.readFileSync(instrumentPath, 'utf8');
      expect(content).toMatch(/register/);
    });
  });

  describe('Middleware Configuration', () => {
    it('should have middleware.ts', () => {
      const middlewarePath = path.join(templatePath, 'middleware.ts');
      expect(fs.existsSync(middlewarePath)).toBe(true);

      const content = fs.readFileSync(middlewarePath, 'utf8');
      expect(content).toMatch(/NextRequest/);
      expect(content).toMatch(/NextResponse/);
    });
  });

  describe('Internationalization', () => {
    it('should have locale files', () => {
      const localesDir = path.join(templatePath, 'locales');

      expect(fs.existsSync(path.join(localesDir, 'en-US.json'))).toBe(true);
      expect(fs.existsSync(path.join(localesDir, 'fr-FR.json'))).toBe(true);
    });
  });

  describe('Styling', () => {
    it('should have PostCSS setup', () => {
      const stylesDir = path.join(templatePath, 'styles');
      expect(fs.existsSync(stylesDir)).toBe(true);

      const globalPath = path.join(stylesDir, 'global.css');
      expect(fs.existsSync(globalPath)).toBe(true);
    });

    it('should have postcss configuration', () => {
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

  describe('Next.js Configuration', () => {
    it('should have next.config.js with TypeScript support', () => {
      const nextConfigPath = path.join(templatePath, 'next.config.js');
      expect(fs.existsSync(nextConfigPath)).toBe(true);

      const content = fs.readFileSync(nextConfigPath, 'utf8');
      expect(content).toMatch(/getNextConfig/);
    });
  });
});
