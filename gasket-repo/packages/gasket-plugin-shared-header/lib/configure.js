/** @type {import('@gasket/core').HookHandler<'configure'>} */
export default function configure(gasket, config) {
  return {
    ...config,
    presentationCentral: {
      ...config.presentationCentral,
      disabled: true
    }
  };
}
