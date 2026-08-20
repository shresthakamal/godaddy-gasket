# @godaddy/gasket-plugin-atlas

Gasket plugin for integrating Atlas brand and market configuration data into
Gasket applications.

## Installation

### New apps

```
gasket create <app-name> --plugins @godaddy/gasket-plugin-atlas
```

### Existing apps

```
npm i @godaddy/gasket-plugin-atlas
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginAtlas from '@godaddy/gasket-plugin-atlas';

export default makeGasket({
  plugins: [
+   pluginAtlas
  ]
});
```

## Configuration

The Atlas plugin provides access to brand and market configuration data through
the Atlas library. It automatically configures an Atlas instance based on your
Gasket environment and optional custom settings.

By default, the plugin uses the Gasket environment (`gasket.config.env`) to
determine the Atlas environment. You can customize the Atlas configuration
through the `atlas` configuration object:

- `env` - (string) Override the Atlas environment; defaults to the Gasket environment
- `version` - (string) Custom Atlas version; defaults to environment-based version
- `url` - (string) Custom Atlas definitions URL for testing purposes
- `updateInterval` - (number) Update interval in milliseconds; set to `0` to disable updates; defaults to 10 minutes (600000ms)
- `logger` - (object) Custom logger object; defaults to the Gasket logger
- `json` - (object) Custom Atlas JSON data; bypasses remote fetching when provided

```javascript
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // ...
  ],
  atlas: {
    updateInterval: 300000, // 5 minutes
  },
  environments: {
    local: {
      atlas: {
        env: 'prod',  // typically dev in local, but you can override as needed
        updateInterval: 0 // Disable updates in local development
      }
    },
    test: {
      atlas: {
        json: mockAtlasData // Use mock data for testing
      }
    }
  }
});
```

## Actions

### getAtlas

Use this to retrieve the configured Atlas instance for accessing brand and market data.

**Signature**

- `gasket.actions.getAtlas(): Promise<Atlas>`

```js
const atlas = await gasket.actions.getAtlas();

// Example usage
const brand = atlas.resolveBrandByPlid(1);
const market = brand.findMarketByLocale('en-US');
const currency = atlas.findCurrencyByCode('USD');
```



## Usage Examples

### Basic Atlas Integration

```js
// In a middleware or route handler
export async function handler(req, res, gasket) {
  const atlas = await gasket.actions.getAtlas();
  
  // Get brand information
  const brand = atlas.resolveBrandByPlid(req.plid);
  
  // Get market data
  const market = brand.findMarketByLocale('en-US');
  
  // Use the data in your application
  res.json({
    brandName: brand.name,
    marketLocale: market.marketLocale,
    currency: market.defaultCurrency
  });
}
```

### Testing with Mock Data

```js
// In your test setup
const mockAtlasData = {
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
};

const gasket = makeGasket({
  plugins: [pluginAtlas],
  atlas: {
    json: mockAtlasData
  }
});
```
