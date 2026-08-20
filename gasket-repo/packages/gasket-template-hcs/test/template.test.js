import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.join(__dirname, '../template');

describe('@godaddy/gasket-template-hcs', () => {
  describe('Template Structure', () => {
    const expectedFiles = [
      'package.json',
      'gasket.js',
      'gasket-data.js',
      'intl.js',
      'babel.config.cjs',
      'vitest.config.js',
      '.eslintrc.cjs',
      '.gitignore',
      'README.md'
    ];

    expectedFiles.forEach(file => {
      it(`should have ${file}`, () => {
        expect(fs.existsSync(path.join(templatePath, file))).toBe(true);
      });
    });

    const expectedDirectories = [
      'components',
      'plugins',
      'locales',
      'test'
    ];

    expectedDirectories.forEach(dir => {
      it(`should have ${dir} directory`, () => {
        expect(fs.existsSync(path.join(templatePath, dir))).toBe(true);
      });
    });
  });

  describe('HCS Components', () => {
    it('should have header component', () => {
      const headerPath = path.join(templatePath, 'components/header.jsx');
      expect(fs.existsSync(headerPath)).toBe(true);

      const content = fs.readFileSync(headerPath, 'utf8');
      expect(content).toMatch(/withManifest/);
      expect(content).toMatch(/export.*Header/);
    });

    it('should have footer component', () => {
      const footerPath = path.join(templatePath, 'components/footer.jsx');
      expect(fs.existsSync(footerPath)).toBe(true);

      const content = fs.readFileSync(footerPath, 'utf8');
      expect(content).toMatch(/withManifest/);
      expect(content).toMatch(/export.*Footer/);
    });

    it('should have components index', () => {
      const indexPath = path.join(templatePath, 'components/index.js');
      expect(fs.existsSync(indexPath)).toBe(true);

      const content = fs.readFileSync(indexPath, 'utf8');
      expect(content).toMatch(/export.*Header/);
      expect(content).toMatch(/export.*Footer/);
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

    it('should have HCS-specific dependencies', () => {
      const requiredDeps = [
        '@gasket/core',
        '@gasket/plugin-command',
        '@gasket/plugin-express',
        '@gasket/plugin-intl',
        '@gasket/plugin-logger',
        '@gasket/plugin-webpack',
        '@gasket/plugin-winston',
        '@gasket/react-intl',
        '@godaddy/gasket-plugin-hcs',
        '@godaddy/gasket-plugin-visitor',
        '@godaddy/gasket-hcs',
        'express',
        'react',
        'react-dom',
        'react-intl',
        'winston'
      ];

      requiredDeps.forEach(dep => {
        expect(packageJson.dependencies).toHaveProperty(dep);
      });
    });

    it('should have required dev dependencies', () => {
      const requiredDevDeps = [
        '@babel/core',
        '@babel/preset-env',
        '@babel/preset-react',
        '@gasket/plugin-docs',
        '@vitest/coverage-v8',
        'babel-loader',
        'eslint',
        'eslint-config-godaddy-react',
        'vitest',
        'webpack'
      ];

      requiredDevDeps.forEach(dep => {
        expect(packageJson.devDependencies).toHaveProperty(dep);
      });
    });

    it('should have HCS build scripts', () => {
      const requiredScripts = [
        'build',
        'build:watch',
        'start',
        'local',
        'test',
        'test:watch',
        'test:coverage',
        'lint',
        'lint:fix',
        'docs'
      ];

      requiredScripts.forEach(script => {
        expect(packageJson.scripts).toHaveProperty(script);
      });

      // Check HCS-specific script patterns
      expect(packageJson.scripts.build).toMatch(/node gasket.js build/);
    });

    it('should have eslint configuration', () => {
      expect(packageJson.eslintConfig).toBeDefined();
      expect(packageJson.eslintConfig.extends).toContain('godaddy-react');
    });
  });

  describe('Gasket Configuration', () => {
    it('should have valid gasket.js', () => {
      const gasketPath = path.join(templatePath, 'gasket.js');
      const content = fs.readFileSync(gasketPath, 'utf8');

      expect(content).toMatch(/makeGasket/);
      expect(content).toMatch(/pluginHcs/);
      expect(content).toMatch(/export default/);
    });

    it('should have gasket-data.js', () => {
      const gasketDataPath = path.join(templatePath, 'gasket-data.js');
      const content = fs.readFileSync(gasketDataPath, 'utf8');

      expect(content).toMatch(/export default/);
      expect(content).toMatch(/examplePrivateSetting/);
      expect(content).toMatch(/public/);
    });

    it('should have intl.js configuration', () => {
      const intlPath = path.join(templatePath, 'intl.js');
      const content = fs.readFileSync(intlPath, 'utf8');

      expect(content).toMatch(/makeIntlManager/);
      expect(content).toMatch(/export default/);
    });
  });

  describe('Build Configuration', () => {
    it('should have vitest.config.js', () => {
      const vitestPath = path.join(templatePath, 'vitest.config.js');
      expect(fs.existsSync(vitestPath)).toBe(true);

      const content = fs.readFileSync(vitestPath, 'utf8');
      expect(content).toMatch(/defineConfig/);
      expect(content).toMatch(/vitest/);
    });

    it('should have babel.config.cjs', () => {
      const babelPath = path.join(templatePath, 'babel.config.cjs');
      expect(fs.existsSync(babelPath)).toBe(true);

      const content = fs.readFileSync(babelPath, 'utf8');
      expect(content).toMatch(/@babel\/preset-env/);
      expect(content).toMatch(/@babel\/preset-react/);
    });
  });

  describe('Plugin Structure', () => {
    it('should have routes plugin', () => {
      const routesPluginPath = path.join(templatePath, 'plugins/routes-plugin.js');
      expect(fs.existsSync(routesPluginPath)).toBe(true);

      const content = fs.readFileSync(routesPluginPath, 'utf8');
      expect(content).toMatch(/defaultHandler/);
      expect(content).toMatch(/hooks/);
    });

    it('should have plugins README', () => {
      const readmePath = path.join(templatePath, 'plugins/README.md');
      expect(fs.existsSync(readmePath)).toBe(true);
    });
  });

  describe('Localization', () => {
    it('should have locale files', () => {
      const localesDir = path.join(templatePath, 'locales');
      expect(fs.existsSync(localesDir)).toBe(true);

      expect(fs.existsSync(path.join(localesDir, 'en-US.json'))).toBe(true);
      expect(fs.existsSync(path.join(localesDir, 'fr-FR.json'))).toBe(true);
    });

    it('should have valid locale JSON', () => {
      const enPath = path.join(templatePath, 'locales/en-US.json');
      const frPath = path.join(templatePath, 'locales/fr-FR.json');

      const enMessages = JSON.parse(fs.readFileSync(enPath, 'utf8'));
      const frMessages = JSON.parse(fs.readFileSync(frPath, 'utf8'));

      expect(typeof enMessages).toBe('object');
      expect(typeof frMessages).toBe('object');

      // Check for common message keys
      expect(enMessages).toHaveProperty('gasket_welcome');
      expect(frMessages).toHaveProperty('gasket_welcome');
    });
  });

  describe('Test Setup', () => {

    it('should have vitest config', () => {
      const vitestPath = path.join(templatePath, 'vitest.config.js');
      expect(fs.existsSync(vitestPath)).toBe(true);

      const content = fs.readFileSync(vitestPath, 'utf8');
      expect(content).toMatch(/defineConfig/);
      expect(content).toMatch(/vitest\/config/);
    });
  });

  describe('HCS Environment Configuration', () => {
    it('should have environment-specific HCS config', () => {
      const gasketPath = path.join(templatePath, 'gasket.js');
      const content = fs.readFileSync(gasketPath, 'utf8');

      expect(content).toMatch(/environments/);
      expect(content).toMatch(/local/);
      expect(content).toMatch(/development/);
    });
  });

  describe('ESLint Configuration', () => {
    it('should have React-aware ESLint', () => {
      const eslintPath = path.join(templatePath, '.eslintrc.cjs');
      expect(fs.existsSync(eslintPath)).toBe(true);

      const content = fs.readFileSync(eslintPath, 'utf8');
      expect(content).toMatch(/godaddy-react/);
    });
  });

  describe('Template Integrity', () => {
    it('should not contain template placeholders', () => {
      const filesToCheck = [
        'package.json',
        'README.md',
        'gasket.js'
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
