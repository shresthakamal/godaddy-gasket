import type { HookHandler } from '@gasket/core';

export const metadata: HookHandler<'metadata'> = function metadata(gasket, meta) {
  return {
    ...meta,
    actions: [
      {
        name: 'getGoat',
        description: 'Get a configured GOAT SDK client instance',
        link: 'README.md#getgoat'
      }
    ],
    configurations: [
      {
        name: 'goat',
        link: 'README.md#configuration',
        description: 'GOAT translation plugin configuration',
        type: 'object'
      }
    ]
  };
};
