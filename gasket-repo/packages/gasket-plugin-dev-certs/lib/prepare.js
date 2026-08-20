/** @type {import('@gasket/core').HookHandler<'prepare'>} */
export default async function prepare(gasket, config) {
  if (config.env.startsWith('local')) {
    await gasket.actions.installDevCerts();
  }

  return config;
}
