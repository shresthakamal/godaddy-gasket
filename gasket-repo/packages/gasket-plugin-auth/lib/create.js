/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-nextjs" />

import packageJson from '../package.json' with { type: 'json' };
const { name, version, devDependencies } = packageJson;

/** @type {import('@gasket/core').HookHandler<'create'>} */
export default function create(gasket, context) {
  context.gasketConfig.addPlugin('pluginAuth', name);
  context.pkg.add('dependencies', {
    [name]: `^${version}`
  });

  // Skip further additions for APIs
  if (context.apiApp) return;

  context.pkg.add('dependencies', {
    '@godaddy/gasket-auth': devDependencies['@godaddy/gasket-auth']
  });

  // Skip file generation if not using the default server
  if (context.nextServerType === 'customServer') return;

  const {
    files,
    typescript,
    useAppRouter
  } = context;

  // Add /api/auth/validate.js to expose client auth endpoint
  const generatorDir = `${import.meta.dirname}/../generator`;
  const appType = useAppRouter ? 'app-router' : 'page-router';
  const globIgnore = typescript ? '!(*.js)' : '!(*.ts)';
  files.add(`${generatorDir}/${appType}/**/${globIgnore}`);
}
