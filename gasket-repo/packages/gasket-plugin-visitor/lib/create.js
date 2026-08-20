/// <reference types="create-gasket-app" />

import packageJson from '../package.json' with { type: 'json' };
const { name, version } = packageJson;

/** @type {import('@gasket/core').HookHandler<'create'>} */
export default function createHook(gasket, { messages, gasketConfig, pkg }) {
  gasketConfig.addPlugin('pluginVisitor', name);

  pkg.add('dependencies', {
    [name]: `^${version}`
  });

  messages.push('Thank you for using Gasket!');
}
