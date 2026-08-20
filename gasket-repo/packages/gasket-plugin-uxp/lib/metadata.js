/** @type {import('@gasket/core').HookHandler<'metadata'>} */
export default function metadata(gasket, meta) {
  return {
    ...meta,
    actions: [
      {
        name: 'getPresentationCentral',
        description: 'Get the presentation central content',
        link: 'README.md#getPresentationCentral'
      }
    ],
    guides: [
      {
        name: 'White Labeling Guide',
        description: 'Tips for making apps ready for resellers',
        link: 'docs/white-labeling.md'
      },
      {
        name: 'Dynamic Imports Guide',
        description: 'Techniques for loading and rendering React components',
        link: 'docs/static-assets.md'
      },
      {
        name: 'RTL Guide',
        description: 'Setup and support for right-to-left languages',
        link: 'docs/rtl-css.md'
      }
    ],
    structures: [
      {
        name: 'manifest.xml',
        description: 'GoDaddy Localization Framework (GoLF) configuration',
        link: 'https://godaddy-corp.atlassian.net/l/cp/JWXbymUG'
      }
    ],
    lifecycles: [
      {
        method: 'exec',
        name: 'presentationCentral',
        description: 'Modify params for requests for Presentation Central',
        link: 'README.md#presentationCentral',
        parent: 'middleware'
      },
      {
        method: 'execWaterfall',
        name: 'headerContent',
        description: 'Provide or customize header content',
        link: 'README.md#headerContent',
        parent: 'middleware'
      }
    ],
    modules: [
      {
        name: '@godaddy/gasket-next',
        link: 'README.md'
      }
    ],
    configurations: [
      {
        name: 'presentationCentral',
        link: 'README.md#configuration',
        description: 'Configure the UXP plugin',
        type: 'object'
      },
      {
        name: 'presentationCentral.fsCachePath',
        link: 'README.md#configuration',
        description: 'Enable persisting cache to disk',
        type: 'string'
      },
      {
        name: 'presentationCentral.env',
        link: 'README.md#configuration',
        description: 'The environment that we need to run in',
        type: 'string'
      },
      {
        name: 'presentationCentral.version',
        link: 'README.md#configuration',
        description: 'Which API version of presentation-central we should use',
        type: 'string',
        default: '2.0'
      },
      {
        name: 'presentationCentral.disableRTL',
        link: 'README.md#configuration',
        description: 'Enable to manually override and disable RTL for all markets',
        type: 'boolean'
      },
      {
        name: 'presentationCentral.timeout',
        link: 'README.md#configuration',
        description: 'Maximum time we allow a presentation-central request to take',
        type: 'number',
        default: 10000
      },
      {
        name: 'presentationCentral.maxStaleness',
        link: 'README.md#configuration',
        description: 'maxStaleness + maxAge is the maximum age of a single cache item that we are allowed to use',
        type: 'number',
        default: 5
      },
      {
        name: 'presentationCentral.maxAge',
        link: 'README.md#configuration',
        description: 'Max age of presentation-central response before it should automatically refresh',
        type: 'number',
        default: 30
      },
      {
        name: 'presentationCentral.params',
        link: 'README.md#configuration',
        description: 'Presentation Central API params',
        type: 'object'
      },
      {
        name: 'presentationCentral.enablePartnersHeaderOverride',
        link: 'README.md#configuration',
        description: 'Enable Partners Sidebar',
        type: 'boolean'
      }
    ]
  };
}
