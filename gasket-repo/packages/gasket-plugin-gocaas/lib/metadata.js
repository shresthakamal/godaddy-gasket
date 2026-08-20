/// <reference types="@gasket/plugin-metadata"/>

/** @type {import('@gasket/core').HookHandler<'metadata'>} */
export default function metadata(gasket, meta) {
  return {
    ...meta,
    actions: [
      {
        name: 'getGoCaasClient',
        description: 'Get the GoCaas client',
        link: 'README.md#getGoCaasClient'
      }
    ]
  };
}
