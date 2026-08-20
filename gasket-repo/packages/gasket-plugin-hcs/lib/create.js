/// <reference types="create-gasket-app" />

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import packageJson from '../package.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { name, version, devDependencies } = packageJson;

const ADD_DEV_DEPENDENCIES = [
  '@testing-library/react',
  'eslint-config-godaddy-react',
  'babel-eslint',
  'babel-loader',
  '@babel/preset-env',
  '@babel/preset-react'
];

const ADD_DEPENDENCIES = [
  '@godaddy/gasket-hcs',
  'react',
  'react-dom',
  'react-intl',
  'babel-loader'
];

const CREATE_ENVIRONMENT_CONFIGS = [
  {
    env: 'local',
    pcsUrl: 'https://uxp-platform-content-service-dev.uxp-dev.prod.onkatana.net/v1'
  },
  {
    env: 'development',
    pcsUrl: 'https://uxp-platform-content-service-dev.uxp-dev.prod.onkatana.net/v1'
  },
  {
    env: 'test',
    pcsUrl: 'https://uxp-platform-content-service-test.uxp-test.prod.onkatana.net/v1'
  },
  {
    env: 'production',
    pcsUrl: 'https://uxp-platform-content-service-prod.uxp-prod.prod.onkatana.net/v1'
  }
];


/**
 * Create hook
 * @type {import('@gasket/core').HookHandler<'create'>}
 */
async function create(gasket, { files, pkg, gasketConfig, testPlugins, nextSteps = [], packageManager = 'npm' }) {
  files.add(
    path.join(__dirname, '..', 'generator', '.*'),
    path.join(__dirname, '..', 'generator', '*'),
    path.join(__dirname, '..', 'generator', '!(mocha|jest|vitest)', '**')
  );

  ['jest', 'mocha', 'vitest'].forEach(tester => {
    if (testPlugins && testPlugins.some(pluginName => pluginName.includes(tester))) {
      files.add(
        path.join(__dirname, '..', 'generator', `${tester}`, '*'),
        path.join(__dirname, '..', 'generator', `${tester}`, '**', '*')
      );
    }
  });

  pkg.add('dependencies', {
    [name]: `^${version}`
  });

  pkg.add('scripts', {
    'build:watch': `nodemon --exec "${packageManager} run build" --ignore ./build/* --ignore intl.js --ignore swagger.json`
  });

  ADD_DEV_DEPENDENCIES.forEach(devDependency => {
    pkg.add('devDependencies', { [devDependency]: devDependencies[devDependency] });
  });

  ADD_DEPENDENCIES.forEach(devDependency => {
    pkg.add('dependencies', { [devDependency]: devDependencies[devDependency] });
  });

  pkg.add('eslintConfig', {
    extends: [
      'godaddy-react'
    ]
  });

  CREATE_ENVIRONMENT_CONFIGS.forEach(({ env, pcsUrl }) => {
    gasketConfig.add('environments', {
      [env]: {
        hcs: {
          pcsUrl,
          pcsOverrideQuery: {},
          defaultCacheMaxAge: 600 // 10 minutes
        }
      }
    });
  });

  nextSteps.push('Run `npm test` to verify HCS initialization');

  gasketConfig.addPlugin('pluginHcs', '@godaddy/gasket-plugin-hcs');
  gasketConfig.extend((current) => {
    return {
      intl: {
        ...current.intl,
        experimentalImportAttributes: true
      }
    };
  });
}


export default create;
