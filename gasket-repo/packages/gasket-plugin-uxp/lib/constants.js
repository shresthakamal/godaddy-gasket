const headerDetails = [
  {
    value: 'internal-header',
    name: 'internal',
    description: 'Tools and apps not used by shoppers'
  },
  {
    value: 'internal-sidebar',
    name: 'internal sidebar',
    description: 'Tools and apps not used by shoppers'
  },
  {
    value: 'application-header',
    name: 'application',
    description: 'For apps used by logged in shoppers'
  },
  {
    value: 'brand-header',
    name: 'brand',
    description: 'Simple with logo and copyright footer'
  },
  {
    value: 'language-header',
    name: 'language',
    description: 'Basic with language selector and contact tray'
  },
  {
    value: 'pass-header',
    name: 'pass',
    description: 'Productivity apps for PASS users'
  },
  {
    value: 'investors-header',
    name: 'investors',
    description: 'App-sidebar; Used by Investors'
  },
  {
    value: 'independents-header',
    name: 'independents',
    description: 'App-sidebar; Used by US Independents (USI)'
  },
  {
    value: 'partners-header',
    name: 'partners',
    description: 'App-sidebar; Used by Partners and PRO teams'
  },
  {
    value: 'no-header',
    name: 'no header',
    description: 'Provides scripts and bundles without UI'
  },
  {
    value: 'reseller-sales-header',
    name: 'reseller sales',
    description: 'Private label sales variation for storefronts'
  },
  {
    value: 'payment-header',
    name: 'payment',
    description: 'Basic with sales footer for cart',
    version: 2
  },
  {
    value: 'sales-header',
    name: 'sales',
    description: 'Detailed with sales footer for front of site',
    version: 2
  },
  {
    value: 'storefront-header',
    name: 'storefront',
    description: 'Marketing nav with cart and notifications',
    uxcore: 2301
  }
];

const internalHeaders = [
  'internal-header',
  'internal-sidebar',
  'no-header'
];

const version2Headers = headerDetails.filter(h => h.version === 2).map(h => h.value);

export {
  headerDetails,
  internalHeaders,
  version2Headers
};
