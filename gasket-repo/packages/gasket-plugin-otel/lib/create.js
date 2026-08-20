/// <reference types="create-gasket-app" />

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import packageJson from '../package.json' with { type: 'json' };
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { name, version, dependencies } = packageJson;

/** @type {import('@gasket/core').HookWithTimings<'create'>} */
export default {
  timing: {
    after: ['@gasket/plugin-nextjs', '@gasket/plugin-express']
  },
  handler: function create(gasket, {
    pkg,
    gasketConfig,
    files,
    apiApp,
    nextServerType,
    typescript
  }) {
    const isNextApp = !apiApp && nextServerType;
    gasketConfig.addPlugin('pluginOtel', name);
    files.add(join(__dirname, '..', 'generator', '.*'));

    pkg.add('dependencies', {
      [name]: `^${version}`
    });

    if (isNextApp) {
      pkg.add('dependencies', {
        '@vercel/otel': dependencies['@vercel/otel']
      });

      const generatorPath = typescript ? 'typescript' : '';
      files.add(join(__dirname, '..', 'generator', generatorPath, '*'));
    }

    const nextOtelVerboseFlag = isNextApp ? 'NEXT_OTEL_VERBOSE=1 ' : '';

    pkg.extend((current) => {
      return {
        scripts: {
          start: `NODE_OPTIONS='--import @godaddy/gasket-otel/register' ${nextOtelVerboseFlag}${current.scripts.start}`
        }
      };
    });
  }
};
