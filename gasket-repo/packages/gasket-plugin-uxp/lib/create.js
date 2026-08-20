/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-nextjs" />
/// <reference types="@gasket/plugin-https-proxy" />

import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { getPackageLatestVersion } from '@gasket/utils';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, devDependencies } = packageJson;
const require = createRequire(import.meta.url);
const generatorDir = fileURLToPath(new URL('../generator', import.meta.url));
const { bold, gray } = require('chalk');

/** @type {import('@gasket/core').HookHandler<'create'>} */
async function createHook(gasket, context) {
  const {
    appName,
    uxp,
    pkg,
    files,
    gasketConfig,
    gitInit,
    relDest,
    nextSteps,
    useAppRouter,
    nextDevProxy,
    nextServerType,
    typescript,
    hasGasketIntl,
    localCmd
  } = context;

  if (hasGasketIntl) {
    // Use @godaddy/react-mintl in templates instead of react-intl
    context.reactIntlPkg = '@godaddy/react-mintl';
  }

  const { app, header, isGoDark } = uxp;
  const hasNext = pkg.has('dependencies', 'next');
  const headerDef = require('./constants').headerDetails.find(h => h.value === header);
  gasketConfig.add('uxp', {
    useMintl: true
  });

  gasketConfig.addPlugin('pluginUxp', name);

  if (hasNext) {
    files.add(
      path.join(generatorDir, 'shared', '**', '*'),
      path.join(generatorDir, 'shared', '.*')
    );

    const appStructure = useAppRouter ? 'app-router' : 'pages-router';
    const glob = typescript ? '*.{ts,tsx}' : '*.{js,jsx}';

    files.add(
      path.join(generatorDir, appStructure, '**', glob)
    );

    if (appStructure === 'pages-router' && nextServerType !== 'customServer') {
      files.add(
        path.join(generatorDir, 'pages-router-default-server', '**', glob)
      );
    }

    files.add(
      path.join(generatorDir, 'vitest', appStructure, '**', glob)
    );
  }

  if (hasGasketIntl) {
    files.add(
      path.join(generatorDir, 'intl', '**', '*')
    );
    gasketConfig.add('intl', { nextRouting: false });
  }

  await updatePackage({ pkg, uxp });

  /** @type {import('.').PCConfig } */
  const presentationCentralConfig = {
    params: {
      app: app || appName,
      manifest: header,
      ...(isGoDark && { theme: 'go-dark:brand' })
    }
  };

  if (headerDef.version === 2) {
    presentationCentralConfig.version = '2.0';
    presentationCentralConfig.params.header = header;
    delete presentationCentralConfig.params.manifest;
  }

  if (useAppRouter) {
    gasketConfig.add('uxp', {
      externals: false
    });
  }

  gasketConfig.add('presentationCentral', presentationCentralConfig);

  if (nextDevProxy && nextServerType !== 'customServer') {
    gasketConfig.extend((current) => {
      return {
        httpsProxy: {
          ...current.httpsProxy,
          protocol: 'https',
          hostname: 'local.gasket.dev-godaddy.com',
          port: 8443
        }
      };
    });
  }

  const msg = `
${bold('First time using gasket?')}
Configure your /etc/hosts:
${gray(`
sudo tee -a /etc/hosts << END
# Gasket
127.0.0.1  local.gasket.dev-godaddy.com         # godaddy
127.0.0.1  local.gasket.dev-secureserver.net    # private label
127.0.0.1  local.gasket.dev-gdcorp.tools        # godaddy corporate tools
127.0.0.1  local.gasket.int.dev-gdcorp.tools    # internal godaddy corporate tools
END
`)}
${bold('Going to production?')}
Create an appcode in GoDaddy Cloud UI:
${gray(`
open https://cloud.int.godaddy.com/grouping/appregs/new
`)}
${bold('Give your code a home on Github Enterprise:')}
${gray(`
cd ${relDest}${!gitInit ? '\n  git init' : ''}
git remote add origin git@github.com:YOURORG/YOUR-REPO.git
`)}
${bold('Build your app with a local dev server:')}
${gray(`
cd ${relDest}
${localCmd}
`)}
`;

  nextSteps.push(msg);
}

/**
 * Update package.json with the latest versions of dependencies
 * @type {import('./internal').updatePackage}
 */
async function updatePackage({ pkg, uxp }) {
  const [pivot, uxicon, uxbox, uxcard, uxintents, uxtext] = await Promise.all(
    // @ts-ignore - TS doesn't know about these packages
    ['@ux/pivot', '@ux/icon', '@ux/box', '@ux/card', '@ux/intents', '@ux/text'].map(getPackageLatestVersion)
  );

  pkg.add('dependencies', {
    [name]: `^${version}`,
    '@godaddy/browserslist-config': devDependencies['@godaddy/browserslist-config'],
    '@godaddy/gasket-next': devDependencies['@godaddy/gasket-next'],
    '@ux/pivot': `^${pivot}`,
    '@ux/icon': `^${uxicon}`,
    '@ux/box': `^${uxbox}`,
    '@ux/card': `^${uxcard}`,
    '@ux/intents': `^${uxintents}`,
    '@ux/text': `^${uxtext}`,
    'react-transition-group': devDependencies['react-transition-group'],
    '@godaddy/react-mintl': devDependencies['@godaddy/react-mintl']
  });

  // Remove the default react-intl dependency since we are using @godaddy/react-mintl instead.
  pkg.remove(['dependencies', 'react-intl']);

  pkg.add('dependencies', {
    'react': devDependencies.react,
    'react-dom': devDependencies['react-dom']
  }, { force: true });

  pkg.add('devDependencies', {
    '@testing-library/react': '^14.0.0'
  }, { force: true });

  pkg.add('browserslist', ['extends @godaddy/browserslist-config']);

  pkg.add('devDependencies', {
    'url-loader': devDependencies['url-loader'],
    'file-loader': devDependencies['file-loader'],
    'sass': devDependencies.sass,
    'postcss': devDependencies.postcss
  });

  //
  // Add the PostCSS plugins that Next.js normally provides to your project.
  // Their default configuration and the used plugins can be found on their
  // documentation page:
  //
  // https://nextjs.org/docs/pages/building-your-application/configuring/post-css#customizing-plugins
  //
  pkg.add('devDependencies', {
    '@godaddy/postcss-merge-selectors': devDependencies['@godaddy/postcss-merge-selectors'],
    'postcss-flexbugs-fixes': devDependencies['postcss-flexbugs-fixes'],
    'postcss-preset-env': devDependencies['postcss-preset-env']
  });

  const plugins = {
    'postcss-flexbugs-fixes': {},
    'postcss-preset-env': {
      autoprefixer: {
        flexbox: 'no-2009'
      },
      stage: 3,
      features: {
        'custom-properties': false
      }
    },
    '@godaddy/postcss-merge-selectors': {
      matchers: [
        '^\\*$'
      ]
    }
  };

  if (uxp.useRtl) {
    pkg.add('devDependencies', {
      'postcss-rtlcss': devDependencies['postcss-rtlcss']
    });

    plugins['postcss-rtlcss'] = {};
  }

  pkg.add('postcss', { plugins });
}

export default {
  timing: {
    after: ['@gasket/plugin-nextjs']
  },
  handler: createHook
};
