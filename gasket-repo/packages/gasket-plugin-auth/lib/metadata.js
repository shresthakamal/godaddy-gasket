/// <reference types="@gasket/plugin-metadata" />

/** @type {import('@gasket/core').HookHandler<'metadata'>} */
export default function metadata(gasket, meta) {
  return {
    ...meta,
    actions: [
      {
        name: 'getCheckAuth',
        description: 'Get the checkAuth function',
        link: 'README.md#getCheckAuth'
      },
      {
        name: 'checkAuth',
        description: 'Check the authentication status',
        link: 'README.md#checkAuth'
      },
      {
        name: 'checkShopperAuth',
        description: 'Check the shopper authentication status',
        link: 'README.md#checkShopperAuth'
      }
    ],
    guides: [
      {
        name: 'Authentication Guide',
        description: 'Securing parts of your app with GoDaddy SSO',
        link: 'docs/authentication.md'
      },
      {
        name: 'Authenticated Fetch Guide',
        description: 'Fetching data from secure services',
        link: 'docs/fetch.md'
      }
    ],
    modules: [
      {
        name: '@godaddy/gasket-auth',
        link: 'README.md'
      }
    ],
    configurations: [
      {
        name: 'auth',
        link: 'README.md#configuration',
        description: 'Configure the auth plugin',
        type: 'object'
      },
      {
        name: 'auth.appName',
        link: 'README.md#configuration',
        description: 'Name of app',
        type: 'string'
      },
      {
        name: 'auth.basePath',
        link: 'README.md#configuration',
        description: 'Set if the app is served under a path from the domain',
        type: 'string'
      },
      {
        name: 'auth.realm',
        link: 'README.md#configuration',
        description: 'Target token type for the app',
        type: 'string',
        default: 'idp'
      },
      {
        name: 'auth.allowHeartbeat',
        link: 'README.md#configuration',
        description: 'Perform heartbeat request when VAT is expired',
        type: 'boolean',
        default: 'true'
      },
      {
        name: 'auth.use12HourExpiration',
        link: 'README.md#configuration',
        description: 'Use the new 12-hour expiration policy for IDP tokens with `per=true` at security levels 1-3',
        type: 'boolean',
        default: 'false'
      },
      {
        name: 'auth.apiProxy',
        link: 'README.md#configuration',
        description: 'Set if the app requires going through an API proxy for SSO',
        type: 'object'
      },
      {
        name: 'auth.host',
        link: 'README.md#configuration',
        description: 'Manually configure the auth host',
        type: 'string[]'
      }
    ]
  };
}
