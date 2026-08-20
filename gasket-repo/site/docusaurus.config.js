const { themes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
module.exports = {
  title: 'Internal Gasket',
  staticDirectories: ['static'],
  tagline: 'Internal Gasket Plugins and Packages',
  favicon: 'img/favicon.ico',
  url: 'https://godaddy.gasket.dev',
  baseUrl: '/',
  trailingSlash: true,
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/', // Serve docs at the root path
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        docsRouteBasePath: '/',
        docsDir: 'docs',
        indexDocs: true,
        indexBlog: false,
        indexPages: true,
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/socialpreview.png',
      metadata: [
        { name: 'twitter:card', content: 'summary_large_image' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Internal Gasket - Internal Gasket Plugins and Packages' },
        { property: 'og:description', content: 'Documentation for internal GoDaddy Gasket plugins and packages. Build powerful web applications with our internal Gasket framework.' },
        { property: 'og:image', content: 'https://godaddy.gasket.dev/img/socialpreview.png' },
        { property: 'og:url', content: 'https://godaddy.gasket.dev' },
        { name: 'twitter:title', content: 'Internal Gasket - Internal Gasket Plugins and Packages' },
        { name: 'twitter:description', content: 'Documentation for internal GoDaddy Gasket plugins and packages. Build powerful web applications with our internal Gasket framework.' },
        { name: 'twitter:image', content: 'https://godaddy.gasket.dev/img/socialpreview.png' },
      ],
      navbar: {
        title: '',
        logo: {
          alt: 'Gasket Framework Logo',
          src: 'img/logo-docs.svg',
          srcDark: 'img/logo-docs-dark.svg',
          href: '/',
          className: 'gasket-navbar-logo',
        },
        items: [
          {
            to: '/#lifecycles',
            label: 'Lifecycles',
            position: 'left',
          },
          {
            to: '/#actions',
            label: 'Actions',
            position: 'left',
          },
          {
            to: '/plugins',
            label: 'Plugins',
            position: 'left',
          },
          {
            to: '/presets',
            label: 'Presets',
            position: 'left',
          },
          {
            to: '/templates',
            label: 'Templates',
            position: 'left',
          },
          {
            to: '/modules',
            label: 'Modules',
            position: 'left',
          },
          {
            href: 'https://github.com/gdcorp-uxp/gasket',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        copyright: `Copyright (c) 1999 - ${new Date().getFullYear()} GoDaddy Operating Company, LLC.`,
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Overview',
                to: '/',
              },
              {
                label: 'Plugins',
                to: '/plugins',
              },
              {
                label: 'Presets',
                to: '/presets',
              },
            ],
          },
          {
            title: 'Contribute',
            items: [
              {
                label: 'Guidelines',
                to: '/CONTRIBUTING',
              },
              {
                label: 'Github',
                href: 'https://github.com/gdcorp-uxp/gasket/',
              },
            ],
          }
        ]
      },
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      prism: {
        theme: themes.dracula, // Use dark theme for syntax highlighting
        darkTheme: themes.dracula,
      }
    }),
};
