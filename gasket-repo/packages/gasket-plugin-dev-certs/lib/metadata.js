/// <reference types="@gasket/plugin-metadata"/>

/** @type {import('@gasket/core').HookHandler<'metadata'>} */
export default function metadata(gasket, meta) {
  return {
    ...meta,
    actions: [
      {
        name: 'getDevCert',
        description: 'Get the development certificate',
        link: 'README.md#getDevCert'
      },
      {
        name: 'installDevCerts',
        description: 'Install development certificates',
        link: 'README.md#installDevCerts'
      }
    ]
  };
}
