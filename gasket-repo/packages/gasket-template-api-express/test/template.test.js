import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.join(__dirname, '../template');

describe('@godaddy/gasket-template-api-express', () => {
  describe('Template Structure', () => {
    const expectedFiles = [
      'package.json',
      'gasket.ts',
      'gasket-data.ts',
      'server.ts',
      'swagger.json',
      'vitest.config.js',
      'tsconfig.json',
      'README.md'
    ];

    expectedFiles.forEach(file => {
      it(`should have ${file}`, () => {
        expect(fs.existsSync(path.join(templatePath, file))).toBe(true);
      });
    });

    const expectedDirectories = [
      'plugins',
      'test'
    ];

    expectedDirectories.forEach(dir => {
      it(`should have ${dir} directory`, () => {
        expect(fs.existsSync(path.join(templatePath, dir))).toBe(true);
      });
    });
  });

  describe('TypeScript Configuration', () => {
    let tsconfig;

    beforeAll(() => {
      const tsconfigPath = path.join(templatePath, 'tsconfig.json');
      tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    });

    it('should have proper TypeScript config for Express API', () => {
      expect(tsconfig.compilerOptions.target).toBe('ESNext');
      expect(tsconfig.compilerOptions.module).toBe('NodeNext');
      expect(tsconfig.compilerOptions.moduleResolution).toBe('NodeNext');
      expect(tsconfig.compilerOptions.esModuleInterop).toBe(true);
      expect(tsconfig.compilerOptions.allowSyntheticDefaultImports).toBe(true);
      expect(tsconfig.compilerOptions.strict).toBe(false);
      expect(tsconfig.compilerOptions.skipLibCheck).toBe(true);
    });

    it('should include TypeScript files', () => {
      expect(tsconfig.include).toContain('./plugins');
      expect(tsconfig.include).toContain('gasket.ts');
      expect(tsconfig.include).toContain('server.ts');
    });

    it('should exclude build and node_modules', () => {
      expect(tsconfig.exclude).toContain('node_modules');
    });
  });

  describe('Package.json Validation', () => {
    let packageJson;

    beforeAll(() => {
      const packagePath = path.join(templatePath, 'package.json');
      packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    });

    it('should be configured as ES module', () => {
      expect(packageJson.type).toBe('module');
    });

    it('should have Express API dependencies', () => {
      const requiredDeps = [
        '@gasket/core',
        '@gasket/data',
        '@gasket/plugin-command',
        '@gasket/plugin-data',
        '@gasket/plugin-express',
        '@gasket/plugin-https',
        '@gasket/plugin-logger',
        '@gasket/plugin-swagger',
        '@gasket/plugin-winston',
        '@godaddy/gasket-plugin-dev-certs',
        '@godaddy/gasket-plugin-otel',
        '@godaddy/gasket-plugin-security',
        '@godaddy/gasket-plugin-self-certs',
        '@godaddy/gasket-plugin-visitor',
        'express',
        'winston'
      ];

      requiredDeps.forEach(dep => {
        expect(packageJson.dependencies).toHaveProperty(dep);
      });
    });

    it('should have required dev dependencies', () => {
      const requiredDevDeps = [
        '@typescript-eslint/parser',
        '@vitest/coverage-v8',
        'eslint',
        'eslint-config-godaddy',
        'tsx',
        'typescript',
        'vitest'
      ];

      requiredDevDeps.forEach(dep => {
        expect(packageJson.devDependencies).toHaveProperty(dep);
      });
    });

    it('should have correct scripts', () => {
      const requiredScripts = [
        'build',
        'start',
        'local',
        'test',
        'lint',
        'docs'
      ];

      requiredScripts.forEach(script => {
        expect(packageJson.scripts).toHaveProperty(script);
      });

      // Check specific script patterns
      expect(packageJson.scripts.start).toMatch(/@godaddy\/gasket-otel/);
      expect(packageJson.scripts.local).toMatch(/tsx watch/);
      expect(packageJson.scripts.build).toMatch(/tsc/);
    });

    it('should have TypeScript as dependency and dev dependency', () => {
      expect(packageJson.devDependencies).toHaveProperty('tsx');
      expect(packageJson.devDependencies).toHaveProperty('typescript');
    });
  });

  describe('Gasket Configuration', () => {
    it('should have valid gasket.ts', () => {
      const gasketPath = path.join(templatePath, 'gasket.ts');
      const content = fs.readFileSync(gasketPath, 'utf8');

      expect(content).toMatch(/makeGasket/);
      expect(content).toMatch(/pluginExpress/);
      expect(content).toMatch(/export default/);
    });

    it('should have gasket-data.ts', () => {
      const gasketDataPath = path.join(templatePath, 'gasket-data.ts');
      const content = fs.readFileSync(gasketDataPath, 'utf8');

      expect(content).toMatch(/examplePrivateSetting/);
      expect(content).toMatch(/export default/);
    });
  });

  describe('Express Server Configuration', () => {
    it('should have server.ts', () => {
      const serverPath = path.join(templatePath, 'server.ts');
      expect(fs.existsSync(serverPath)).toBe(true);

      const content = fs.readFileSync(serverPath, 'utf8');
      expect(content).toMatch(/gasket\.actions\.startServer/);
    });
  });

  describe('API Documentation', () => {
    it('should have swagger.json', () => {
      const swaggerPath = path.join(templatePath, 'swagger.json');
      expect(fs.existsSync(swaggerPath)).toBe(true);

      const swagger = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
      expect(swagger.swagger || swagger.openapi).toBeDefined();
      expect(swagger.info).toBeDefined();
    });
  });

  describe('Plugin Structure', () => {
    it('should have routes plugin', () => {
      const routesPluginPath = path.join(templatePath, 'plugins/routes-plugin.ts');
      expect(fs.existsSync(routesPluginPath)).toBe(true);

      const content = fs.readFileSync(routesPluginPath, 'utf8');
      expect(content).toMatch(/defaultHandler/);
      expect(content).toMatch(/hooks:\s*{[\s\S]*express/);
      expect(content).toMatch(/@swagger/);
    });

    it('should have plugins README', () => {
      const readmePath = path.join(templatePath, 'plugins/README.md');
      expect(fs.existsSync(readmePath)).toBe(true);
    });
  });

  describe('Test Setup', () => {
    it('should have test file', () => {
      const testPath = path.join(templatePath, 'test/index.test.ts');
      expect(fs.existsSync(testPath)).toBe(true);

      const content = fs.readFileSync(testPath, 'utf8');
      expect(content).toMatch(/vitest/);
      expect(content).toMatch(/defaultHandler/);
    });

    it('should have vitest config', () => {
      const vitestPath = path.join(templatePath, 'vitest.config.js');
      expect(fs.existsSync(vitestPath)).toBe(true);

      const content = fs.readFileSync(vitestPath, 'utf8');
      expect(content).toMatch(/defineConfig/);
      expect(content).toMatch(/globals.*true/);
    });
  });

  describe('ESLint Configuration', () => {
    it('should have TypeScript-aware ESLint', () => {
      const packagePath = path.join(templatePath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      expect(packageJson.eslintConfig.parser).toBe('@typescript-eslint/parser');
      expect(packageJson.eslintConfig.extends).toContain('godaddy');
    });
  });

  describe('OpenTelemetry Configuration', () => {
    it('should have OTEL in start script', () => {
      const packagePath = path.join(templatePath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      expect(packageJson.scripts.start).toMatch(/@godaddy\/gasket-otel/);
      expect(packageJson.scripts.start).toMatch(/register/);
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
