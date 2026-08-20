import packageJson from '../package.json' with { type: 'json' };
const { name, version } = packageJson;

/**
 * create hook
 * @type {import('@gasket/core').HookHandler<'create'>}
 */
export default function create(gasket, context) {
  const { gasketConfig, pkg } = context;

  gasketConfig.addPlugin('pluginSecurity', name);

  pkg.add('dependencies', {
    [name]: `^${version}`
  });
}
