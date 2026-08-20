import packageJson from '../package.json' with { type: 'json' };
const { name, version } = packageJson;

/** @type {import('@gasket/core').HookHandler<'create'>} */
export default function create(gasket, context) {
  context.gasketConfig.addPlugin('pluginSharedHeader', name);
  context.pkg.add('dependencies', {
    [name]: `^${version}`
  });
}
