/* eslint-disable no-sync */
const fs = require('fs');
const path = require('path');

const withPatchSpinner = require('../with-patch-spinner');

const content = `import gasket from './gasket.mjs';
gasket.actions.startServer();`;

/**
 * Ensure nodemon is added to devDependencies in package.json
 *
 * @param {object} pkg - The parsed package.json content
 * @param {function} updateContent - Transform content
 */
function ensureNodemonDevDependency(pkg, updateContent) {
  if (!pkg.devDependencies) {
    pkg.devDependencies = {};
  }

  if (!pkg.devDependencies.nodemon) {
    updateContent('package.json', (pkgContent) => {
      pkgContent.devDependencies = {
        ...pkgContent.devDependencies,
        nodemon: '^3.1.0'
      };
      return pkgContent;
    });
  }
}

async function addServer(cwd) {
  const server = path.join(cwd, 'server.mjs');

  if (!fs.existsSync(server)) {
    await fs.promises.writeFile(server, content, 'utf8');
  }
}

/**
 * Update scripts in package.json
 *
 * - Replace "--env=local" with "GASKET_ENV=local" in any script
 * - Update specific scripts: build, local, docs, start, and analyze
 * - Ensure nodemon is added to devDependencies
 *
 * @param {Map} files - Collection of filePaths to content
 * @param {function} updateContent - Transform content
 */
function updateScripts({ updateContent, files, cwd }) {
  const pkg = files.get('package.json');

  if (!pkg || !pkg.scripts) {
    return;
  }

  const scriptTransformers = [
    {
      condition: (name, command) => command.includes('--env=local') || command.includes('--env local'),
      transform: (name, command) => command.replace('--env=local', 'GASKET_ENV=local').replace('--env local', 'GASKET_ENV=local')
    },
    {
      condition: (name, command) => command.includes('gasket build'),
      transform: (name, command) => command.replace('gasket build', 'next build')
    },
    {
      condition: (name, command) => command.includes('gasket local'),
      transform: (name, command) => command.replace('gasket local', 'GASKET_DEV=1 nodemon server.mjs')
    },
    {
      condition: (name, command) => command.includes('gasket analyze'),
      transform: (name, command) => command.replace('gasket analyze', 'ANALYZE=true next build')
    },
    {
      condition: (name, command) => command.includes('gasket docs'),
      transform: (name, command) => command.replace('gasket docs', 'node ./gasket.mjs docs')
    },
    {
      condition: (name, command) => command.includes('gasket start'),
      transform: (name, command) => command.replace('gasket start', 'node server.mjs')
    }
  ];

  const updates = Object.entries(pkg.scripts).reduce((acc, [name, command]) => {
    let updatedCommand = command;

    for (const { condition, transform } of scriptTransformers) {
      if (condition(name, updatedCommand)) {
        updatedCommand = transform(name, updatedCommand);
      }
    }

    if (updatedCommand !== command) {
      acc[name] = updatedCommand;
    }

    return acc;
  }, {});

  if (Object.keys(updates).length > 0) {
    updateContent('package.json', (pkgContent) => {
      Object.assign(pkgContent.scripts, updates);
      return pkgContent;
    });
  }

  ensureNodemonDevDependency(pkg, updateContent);
  addServer(cwd);
}

module.exports = withPatchSpinner('Update scripts in package.json and ensure nodemon is added to devDependencies', updateScripts);
