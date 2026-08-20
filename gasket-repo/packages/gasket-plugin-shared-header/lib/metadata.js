/** @type {import('@gasket/core').HookHandler<'metadata'>} */
export default function metadata(gasket, meta) {
  return {
    ...meta,
    actions: [
      {
        name: 'getSharedHeader',
        description: 'Get shared headers',
        link: 'README.md#getSharedHeader'
      }
    ],
    lifecycles: [
      {
        method: 'exec',
        name: 'sharedHeader',
        description: 'Access the shared header service',
        link: 'README.md#sharedHeader',
        parent: 'middleware'
      }
    ]
  };
}
