/** @type {import('@gasket/core').HookHandler<'metadata'>} */
export default function metadata(gasket, meta) {
  return {
    ...meta,
    actions: [
      {
        name: 'getVisitor',
        description: 'Get visitor details',
        link: 'README.md#getVisitor'
      }
    ],
    lifecycles: [
      {
        method: 'execWaterfall',
        name: 'visitor',
        description: 'Allows overriding detected visitor details',
        link: 'README.md#visitor',
        parent: 'middleware'
      }
    ],
    configurations: [
      {
        name: 'visitor.priority',
        link: 'README.md#configuring-resolver-priority',
        description: 'Adjust resolve order for properties',
        type: 'object'
      }
    ]
  };
}
