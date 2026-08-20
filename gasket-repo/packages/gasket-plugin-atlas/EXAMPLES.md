# @godaddy/gasket-plugin-atlas Examples

This document provides working examples for all exported methods and interfaces from the `@godaddy/gasket-plugin-atlas` package.

## Plugin Installation

```js
// gasket.js
import pluginAtlas from '@godaddy/gasket-plugin-atlas';

export default makeGasket({
  plugins: [
    pluginAtlas
  ]
});
```

## Configuration

### Basic Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginAtlas
  ],
  atlas: {
    env: 'prod',
    updateInterval: 300000 // 5 minutes
  }
});
```

### Advanced Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginAtlas
  ],
  atlas: {
    env: 'prod',
    version: '2.1.0',
    updateInterval: 600000, // 10 minutes
    logger: {
      info: (msg) => console.log(`[Atlas] ${msg}`),
      warn: (msg) => console.warn(`[Atlas] ${msg}`),
      error: (msg) => console.error(`[Atlas] ${msg}`)
    }
  }
});
```

### Testing Configuration with Mock Data

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginAtlas
  ],
  environments: {
    test: {
      atlas: {
        json: {
          version: '1.0.0',
          brands: [
            {
              plid: 1,
              name: 'Test Brand',
              markets: [
                {
                  marketLocale: 'en-US',
                  defaultCurrency: 'USD'
                }
              ]
            }
          ]
        }
      }
    }
  }
});
```

### Disable Updates (Development Mode)

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginAtlas
  ],
  environments: {
    local: {
      atlas: {
        updateInterval: 0 // Disable automatic updates
      }
    }
  }
});
```

## Actions

### getAtlas

Retrieves the Atlas instance with brand, market, and currency data.

```js
// In a middleware or route handler
export async function handler(req, res, gasket) {
  const atlas = await gasket.actions.getAtlas();

  // Get brand information by PLID
  const brand = atlas.resolveBrandByPlid(1);

  // Get brand by domain
  const brandByDomain = atlas.findBrandByDomain('godaddy.com');

  // Get market data from brand
  const market = brand.findMarketByLocale('en-US');

  // Get currency data
  const currency = atlas.findCurrencyByCode('USD');

  res.json({
    brand: brand.name,
    market: market.marketLocale,
    defaultCurrency: market.defaultCurrency
  });
}
```

### Using getAtlas in Express Middleware

```js
// gasket.js plugin
export default {
  name: 'atlas-middleware',
  hooks: {
    express(gasket, app) {
      app.use(async (req, res, next) => {
        try {
          const atlas = await gasket.actions.getAtlas();
          // Do stuff with atlas
          next();
        } catch (error) {
          next(error);
        }
      });
    }
  }
};
```

### Using getAtlas with Next.js getServerSideProps

```js
// pages/brand-info.js
import gasket from '../gasket.js';

export async function getServerSideProps({ req, query }) {
  const atlas = await gasket.actions.getAtlas();

  const { plid } = query;
  const brand = atlas.resolveBrandByPlid(parseInt(plid));

  return {
    props: {
      brand: {
        name: brand.name,
        markets: brand.markets
      }
    }
  };
}

export default function BrandPage({ brand }) {
  return (
    <div>
      <h1>{brand.name}</h1>
      <h2>Available Markets:</h2>
      <ul>
        {brand.markets.map(market => (
          <li key={market.marketLocale}>
            {market.marketLocale} - {market.defaultCurrency}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Using getAtlas in a Custom Hook

```js
// hooks/useAtlas.js
import { useState, useEffect } from 'react';
import gasket from '../gasket.js';

export function useAtlas() {
  const [atlas, setAtlas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAtlas() {
      try {
        const atlasInstance = await gasket.actions.getAtlas();
        setAtlas(atlasInstance);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAtlas();
  }, []);

  return { atlas, loading, error };
}
```

### Error Handling with getAtlas

```js
// utils/atlas-helper.js
export async function getBrandSafely(gasket, plid) {
  try {
    const atlas = await gasket.actions.getAtlas();
    return atlas.resolveBrandByPlid(plid);
  } catch (error) {
    console.error('Failed to load Atlas data:', error);
    return {
      name: 'Unknown Brand',
      markets: []
    };
  }
}
```

## Plugin Lifecycle Integration

### Integrating with Other Plugins

```js
// custom-brand-plugin.js
export default {
  name: 'custom-brand-plugin',
  hooks: {
    async middleware(gasket) {
      return async function brandMiddleware(req, res, next) {
        try {
          const atlas = await gasket.actions.getAtlas();
          const hostname = req.get('host');
          const brand = atlas.findBrandByDomain(hostname);

          // Do things with Atlas data

          next();
        } catch (error) {
          next(error);
        }
      };
    }
  }
};
```

### Using Atlas with Visitor Plugin

```js
// visitor-atlas-plugin.js
export default {
  name: 'visitor-atlas-plugin',
  hooks: {
    async visitor(gasket, visitor, { req }) {
      try {
        const atlas = await gasket.actions.getAtlas();
        const brand = atlas.resolveBrandByPlid(visitor.plid);

        return {
          ...visitor,
          brandName: brand.name,
          availableMarkets: brand.markets.map(m => m.marketLocale)
        };
      } catch (error) {
        gasket.logger.warn('Failed to enhance visitor with Atlas data:', error);
        return visitor;
      }
    }
  }
};
```

## TypeScript Usage

### Type-Safe Configuration

```typescript
// gasket.ts
import { makeGasket } from '@gasket/core';
import pluginAtlas from '@godaddy/gasket-plugin-atlas';

export default makeGasket({
  plugins: [
    pluginAtlas
  ],
  atlas: {
    env: 'prod',
    version: '2.0.0',
    updateInterval: 300000,
    logger: {
      info: (msg: string) => console.log(msg),
      warn: (msg: string) => console.warn(msg),
      error: (msg: string) => console.error(msg)
    }
  }
});
```

### Type-Safe Action Usage

```typescript
// utils/atlas.ts
import type { Atlas } from '@godaddy/atlas';
import type { Gasket } from '@gasket/core';

export async function getAtlasInstance(gasket: Gasket): Promise<Atlas> {
  return await gasket.actions.getAtlas();
}

export async function getBrandInfo(gasket: Gasket, plid: number) {
  const atlas = await gasket.actions.getAtlas();
  return atlas.resolveBrandByPlid(plid);
}
```
