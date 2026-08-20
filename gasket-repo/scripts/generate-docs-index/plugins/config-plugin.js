/* eslint-disable no-console */
import { readdirSync, existsSync, readFileSync } from 'fs';
import { mkdir, copyFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..', '..');
const packagesDir = path.join(projectRoot, 'packages');

/** @type {import('@gasket/core').HookHandler<'metadata'>} */
async function metadata(gasket, data) {
  const allDirs = readdirSync(packagesDir, { withFileTypes: true });

  const filteredDirs = allDirs.filter(dirent => dirent.isDirectory() &&
    !dirent.name.startsWith('gasket-plugin-') &&
    !dirent.name.startsWith('gasket-preset-') &&
    dirent.name !== 'gasket-typescript-tests' // Skip test-only package
  );

  const modules = filteredDirs.map(dirent => {
    try {
      const mod = require(path.join(packagesDir, dirent.name, 'package.json'));
      return {
        name: mod.name,
        version: mod.version,
        description: mod.description,
        metadata: {
          path: path.join(packagesDir, dirent.name),
          link: 'README.md'
        }
      };
    } catch (err) {
      console.error('Error reading package.json', dirent.name, err);
      return null;
    }
  })
    .filter(Boolean);

  return {
    ...data,
    modules
  };
}

export default {
  name: 'config-plugin',
  hooks: {
    metadata,
    // Keeps the generator app readme out of the index
    docsSetup: () => {
      // Register docsSetup for local modules that need it
      const moduleSetups = {};

      const localModules = readdirSync(packagesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() &&
          dirent.name !== 'gasket-typescript-tests'
        );

      localModules.forEach(dirent => {
        try {
          const pkgPath = path.join(packagesDir, dirent.name, 'package.json');
          const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
          const examplesPath = path.join(packagesDir, dirent.name, 'EXAMPLES.md');
          const hasExamples = existsSync(examplesPath);
          const isTemplate = dirent.name.startsWith('gasket-template-');

          // Skip templates - they'll be handled in docsGenerate
          if (isTemplate) return;

          // Only include non-templates that have EXAMPLES.md
          if (hasExamples) {
            const files = ['README.md', 'docs/**/*', 'EXAMPLES.md'];
            moduleSetups[pkg.name] = {
              link: 'README.md',
              files
            };
          }
        } catch {
          // ignore if package.json can't be read
        }
      });

      return { modules: moduleSetups };
    },
    // Add repo-level docs to the top of the guides section
    docsGenerate: {
      timing: {
        first: true
      },
      handler: async function docsGenerate(gasket, docsConfigSet) {
        const docs = [
          {
            name: 'Quick Start Guide',
            description: 'Get up and running building GoDaddy apps with Gasket',
            link: '/docs/quick-start.md',
            targetRoot: docsConfigSet.docsRoot
          },
          {
            name: 'Releases Guide',
            description: 'Details on the Active and LTS package versions',
            link: '/docs/server-features.md',
            targetRoot: docsConfigSet.docsRoot
          },
          {
            name: 'Server Features Guide',
            description: 'How to pick which Next server approach to use',
            link: '/docs/server-features.md',
            targetRoot: docsConfigSet.docsRoot
          },
          {
            name: 'Start to Finish Guide',
            description: 'Overview of developing and deploying an app',
            link: '/docs/start-to-finish.md',
            targetRoot: docsConfigSet.docsRoot
          },
          {
            name: 'Debugging Guide',
            description: 'Common issues and approach to debugging',
            link: '/docs/debugging.md',
            targetRoot: docsConfigSet.docsRoot
          },
          {
            name: 'Architecture Layers',
            description: 'Planning your products for scale and maintenance',
            link: '/docs/architecture-layers.md',
            targetRoot: docsConfigSet.docsRoot
          },
          {
            name: 'GoDaddy System Integrations',
            description: 'How Gasket integrates with GoDaddy systems',
            link: '/docs/system-integrations.md',
            targetRoot: docsConfigSet.docsRoot
          },
          {
            name: 'Tech Stack',
            description: 'Aligning tech choices for web apps at GoDaddy',
            link: '/docs/tech-stack.md',
            targetRoot: docsConfigSet.docsRoot
          },
          {
            name: 'Upgrade Guide',
            description: 'Keeping apps current with the latest packages',
            link: '/docs/upgrades.md',
            targetRoot: docsConfigSet.docsRoot
          },
          {
            name: 'Migration Guide',
            description: 'Approaches to migrate existing apps over to Gasket',
            link: '/docs/migration.md',
            targetRoot: docsConfigSet.docsRoot
          }
        ];

        // Generate template docs in custom directory
        const { docsRoot } = docsConfigSet;
        const templatesDir = path.join(docsRoot, 'templates');

        const templateModules = readdirSync(packagesDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('gasket-template-'));

        for (const dirent of templateModules) {
          try {
            const pkgPath = path.join(packagesDir, dirent.name, 'package.json');
            const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
            const sourcePath = path.join(packagesDir, dirent.name);
            const targetPath = path.join(templatesDir, ...pkg.name.split('/'));

            // Copy README.md
            const readmePath = path.join(sourcePath, 'README.md');
            if (existsSync(readmePath)) {
              const targetReadmePath = path.join(targetPath, 'README.md');
              await mkdir(path.dirname(targetReadmePath), { recursive: true });
              await copyFile(readmePath, targetReadmePath);
            }

            // Copy EXAMPLES.md if it exists
            const examplesPath = path.join(sourcePath, 'EXAMPLES.md');
            if (existsSync(examplesPath)) {
              const targetExamplesPath = path.join(targetPath, 'EXAMPLES.md');
              await copyFile(examplesPath, targetExamplesPath);
            }

            docs.push({
              name: pkg.name,
              version: pkg.version,
              description: pkg.description || `Gasket template: ${pkg.name}`,
              link: `/templates/${pkg.name.split('/').join('/')}/README.md`,
              targetRoot: docsRoot
            });
          } catch (error) {
            gasket.logger?.warn(`Failed to process template ${dirent.name}:`, error.message);
          }
        }

        return docs;
      }
    }
  }
};
