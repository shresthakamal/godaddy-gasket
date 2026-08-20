/// <reference types="@gasket/plugin-metadata"/>

/** @type {import('@gasket/core').HookHandler<'metadata'>} */
export default function metadata(gasket, meta) {
  return {
    ...meta,
    actions: [
      {
        name: 'getJwt',
        description: 'Get the JWT',
        link: 'README.md#getJwt'
      }
    ]
  };
}
