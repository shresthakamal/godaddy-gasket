# HCS Plugin Examples

This document provides working examples for all the methods, HOCs, and functions available in the HCS plugin ecosystem.

## Lifecycle Hooks

### wrhsPackageRequests

Specify assets that need to be fetched from warehouse.

```js
// gasket-plugin-example.js
export default {
  name: 'wrhs-plugin',
  hooks: {
    async wrhsPackageRequests(gasket, { params, locale }) {
      return [{
        name: '@ux/my-package',
        env: 'production',
        version: '1.0.0',
        acceptedVariants: ['en-US', 'es-ES'],
        ttl: 300000 // 5 minutes
      }];
    }
  }
};
```

### hcsHints

Add hint tags to manifest for performance optimization.

```js
// gasket-plugin-example.js
export default {
  name: 'hcs-hints-plugin',
  hooks: {
    hcsHints(gasket, hintsManager, packages, props) {
      const pkg = packages['@ux/my-package'];

      if (pkg) {
        pkg.files.forEach(file => {
          if (file.url.endsWith('.js')) {
            hintsManager.addJsPreloadHint({ href: file.url });
          } else if (file.url.endsWith('.css')) {
            hintsManager.addCssPreloadHint({ href: file.url }, { prepend: true });
          }
        });
      }

      // Add DNS prefetch for external domains
      hintsManager.addDnsPrefetchHint({ href: 'https://cdn.example.com' });

      // Add preconnect for critical resources
      hintsManager.addPreconnectHint({ href: 'https://fonts.googleapis.com' });
    }
  }
};
```

### hcsScripts

Add script tags to the manifest.

```js
// gasket-plugin-example.js
export default {
  name: 'hcs-scripts-plugin',
  hooks: {
    hcsScripts(gasket, scriptsManager, packages, props) {
      const pkg = packages['@ux/my-package'];

      if (pkg) {
        pkg.files.forEach(({ url, metadata, name }) => {
          if (url.endsWith('.js')) {
            if (metadata.isChunk) {
              scriptsManager.addChunk({ name, src: url });
            } else {
              scriptsManager.addScript(
                { src: url },
                { prepend: metadata.bootstrap }
              );
            }
          }
        });
      }

      // Add inline script
      scriptsManager.addInlineScript(`
        window.APP_CONFIG = {
          version: '${props.shared.version}',
          debug: ${process.env.NODE_ENV === 'development'}
        };
      `);
    }
  }
};
```

### hcsCss

Add style tags to the manifest.

```js
// gasket-plugin-example.js
export default {
  name: 'hcs-css-plugin',
  hooks: {
    hcsCss(gasket, cssManager, packages, props) {
      const pkg = packages['@ux/my-package'];

      if (pkg) {
        pkg.files.forEach(file => {
          if (file.url.endsWith('.css')) {
            cssManager.addCss({ href: file.url });
          }
        });
      }

      // Add inline CSS
      cssManager.addInlineCss(`
        body {
          background-color: ${props.shared.theme === 'dark' ? '#333' : '#fff'};
        }
        h1 {
          color: ${props.shared.primaryColor || '#000'};
          margin-left: 20px;
        }
      `);

      // Add inline font CSS
      cssManager.addInlineFontCss(`
        @font-face {
          font-family: 'CustomFont';
          src: url('https://fonts.example.com/custom.woff2') format('woff2');
        }
      `);
    }
  }
};
```

### hcsProps

Adjust the props derived from the Platform Content Service (PCS).

```js
// gasket-plugin-example.js
export default {
  name: 'hcs-props-plugin',
  hooks: {
    async hcsProps(gasket, existingProps, req) {
      const { market } = await gasket.actions.getVisitor(req);

      return {
        // Fields within the `header` object will only be passed to the Header React component
        header: {
          customHeaderProp: 'header-specific value',
          navigation: await fetchHeaderNavigation(market)
        },
        // Fields within the `footer` object will only be passed to the Footer React component
        footer: {
          customFooterProp: 'footer-specific value',
          links: await fetchFooterLinks(market)
        },
        // Any other fields will be passed to both Header and Footer
        theme: req.query.theme || 'default',
        market: market,
        // Override existing props if needed
        urls: {
          ...existingProps.urls,
          account: {
            href: 'https://custom-account.godaddy.com'
          }
        }
      };
    }
  }
};

async function fetchHeaderNavigation(market) {
  // Mock async call
  return [
    { caption: 'Home', href: '/' },
    { caption: 'Products', href: '/products' }
  ];
}

async function fetchFooterLinks(market) {
  // Mock async call
  return [
    { caption: 'Privacy', href: '/privacy' },
    { caption: 'Terms', href: '/terms' }
  ];
}
```

### hcsParams

Mutate request parameters before calling Platform Content Service (PCS).

```js
// gasket-plugin-example.js
export default {
  name: 'hcs-params-plugin',
  hooks: {
    hcsParams(gasket, params) {
      // Default the `foo` parameter to false for this HCS
      if (!('foo' in params)) {
        params.foo = 'false';
      }

      // Add additional parameters based on environment
      if (process.env.NODE_ENV === 'development') {
        params.debug = 'true';
      }

      // Override parameters based on request
      if (params.market === 'en-US') {
        params.variant = 'default';
      }

      return params;
    }
  }
};
```

## React Components and HOCs

### withManifest

HOC that wraps components with manifest functionality and provides header/footer data.

```jsx
// components/MyHeader.js
import React from 'react';
import { withManifest } from '@godaddy/gasket-hcs';

function MyHeader({
  customer,
  navigation,
  navigationRight,
  headerMethods,
  urls,
  market,
  messages
}) {
  const handleNavUpdate = () => {
    headerMethods.updateNavigation([
      { caption: 'New Item', href: '/new' }
    ]);
  };

  return (
    <header>
      <h1>Welcome {customer?.loggedIn ? customer.customer.name : 'Guest'}</h1>
      <nav>
        {navigation.map((item, index) => (
          <a key={index} href={item.href}>{item.caption}</a>
        ))}
      </nav>
      <button onClick={handleNavUpdate}>
        Update Navigation
      </button>
    </header>
  );
}

export default withManifest(MyHeader, {
  renderAccountDelegation: true,
  initCustomerState: true,
  initTraffic: true,
  additionalHeaderMethods: {
    customMethod: () => console.log('Custom header method'),
    updateTheme: (theme) => {
      document.body.className = `theme-${theme}`;
    }
  },
  componentName: 'header'
});
```

### withManifest for Footer

```jsx
// components/MyFooter.js
import React from 'react';
import { withManifest } from '@godaddy/gasket-hcs';

function MyFooter({
  customer,
  urls,
  market,
  messages,
  customFooterProp // from hcsProps lifecycle
}) {
  return (
    <footer>
      <div>
        <p>© 2024 Example Company</p>
        <p>Market: {market}</p>
        {customer?.loggedIn && (
          <p>Thank you, {customer.customer.name}!</p>
        )}
      </div>
      <div>
        {customFooterProp && <span>{customFooterProp}</span>}
      </div>
    </footer>
  );
}

export default withManifest(MyFooter, {
  renderAccountDelegation: false,
  initCustomerState: false,
  initTraffic: false,
  componentName: 'footer'
});
```

### withManifest Advanced Usage

```jsx
// components/AdvancedComponent.js
import React from 'react';
import { withManifest } from '@godaddy/gasket-hcs';

function AdvancedComponent({
  customer,
  navigation,
  headerMethods,
  shouldAuthenticate,
  target,
  hivemind,
  enableHivemindProvider,
  skipToMainContentLink,
  blacklistedBrowsers,
  supportMatrix
}) {
  const handleHivemindExperiment = () => {
    if (hivemind?.experimentData) {
      console.log('Experiment cohort:', hivemind.experimentData.cohortId);
    }
  };

  return (
    <div>
      <h1>Advanced HCS Component</h1>

      {customer?.loggedIn && (
        <div>
          <h2>Customer Info</h2>
          <p>Name: {customer.customer.name}</p>
          <p>ID: {customer.customer.customerId}</p>
        </div>
      )}

      {hivemind && (
        <button onClick={handleHivemindExperiment}>
          Check Experiment
        </button>
      )}

      {supportMatrix && (
        <div>
          <p>Browser support information available</p>
        </div>
      )}
    </div>
  );
}

export default withManifest(AdvancedComponent, {
  renderAccountDelegation: true,
  initCustomerState: true,
  initTraffic: true,
  additionalHeaderMethods: {
    trackEvent: (eventName, data) => {
      console.log('Tracking:', eventName, data);
    },
    showNotification: (message) => {
      alert(message);
    }
  },
  componentName: 'advanced'
});
```

## CLI Commands

### wrhs-publish

Publish HCS assets to Warehouse.

```bash
# Basic usage - publish to development environment
npx wrhs-publish development

# Publish to test environment
npx wrhs-publish test

# Publish to production environment
npx wrhs-publish production
```

### package.json Configuration for wrhs-publish

```json
{
  "name": "@example/my-hcs",
  "version": "1.0.0",
  "locales": [
    "en-US",
    "es-ES",
    "fr-FR",
    "de-DE"
  ],
  "scripts": {
    "build": "webpack --mode=production",
    "publish:dev": "wrhs-publish development",
    "publish:test": "wrhs-publish test",
    "publish:prod": "wrhs-publish production"
  }
}
```

### Environment Variables for wrhs-publish

```bash
# Set custom warehouse config
export WRHS_NEXT_CONFIG=/path/to/custom/.wrhs

# Run publish with custom config
wrhs-publish production

# CI environment (skips confirmation prompt)
CI=1 wrhs-publish production
```

## Configuration Examples

### Gasket Config for HCS Plugin

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginHcs from '@godaddy/gasket-plugin-hcs';

export default makeGasket({
  plugins: [
    pluginHcs
  ],
  hcs: {
    pcsUrl: 'https://uxp-platform-content-service-dev.uxp-dev.prod.onkatana.net/v1',
    pcsOverrideQuery: {
      appdata: false,
      debug: true
    },
    defaultCacheMaxAge: 600, // 10 minutes
    devMode: true,
    enableBundleAnalyzer: false,
    webpackDevServer: {
      port: 9212,
      host: 'localhost'
    },
    removeManifest: true,
    useOutOfBandCache: true,
    fsCachePath: './.cache',
    maxStaleness: 6000,
    memoryCacheMax: 1000
  },
  wrhs: {
    baseUrl: 'https://warehouse.example.com',
    fsCachePath: './.wrhs-cache'
  }
});
```

### Complete HCS Application Example

```jsx
// pages/_app.js
import { withManifest } from '@godaddy/gasket-hcs';
import { createApp } from '@godaddy/gasket-next';

function Layout({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

const App = createApp({ Layout });

export default withManifest(App, {
  renderAccountDelegation: true,
  initCustomerState: true,
  initTraffic: true,
  additionalHeaderMethods: {
    trackPageView: (page) => {
      console.log('Page view:', page);
    }
  },
  componentName: 'app'
});
```
