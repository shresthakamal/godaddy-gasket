# @godaddy/gasket-plugin-visitor

Plugin for gathering visitor info (plid, market, etc) and making it available to
server code and Gasket data.

## Installation

This plugin is already included by [@godaddy/gasket-preset-webapp]. The
following steps are only necessary if that preset is not used.

### New apps

```
gasket create <app-name> --plugins @godaddy/gasket-plugin-visitor
```

### Existing apps

```
npm i @godaddy/gasket-plugin-visitor
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginVisitor from '@godaddy/gasket-plugin-visitor';

export default makeGasket({
  plugins: [
+   pluginVisitor
  ]
});
```

## Configuration

To be set under `visitor` in the `gasket` config:

- `debug` - (boolean) Enable visitor debug output (default: `false`).
  Useful for tracking how the visitor values were derived.
  Automatically enabled in `local` env.

## Configuring resolver priority

By default, each visitor field is resolved by trying its source resolvers in a
fixed order — the first to find a value wins. To change the order an app can set
`visitor.priority` in `makeGasket`. The following example shows the default
order for each field (omitting `visitor.priority` entirely is equivalent):

```js
export default makeGasket({
  visitor: {
    priority: {
      hostname:    ['x-dsa-host', 'x-forwarded', 'host'],
      plid:        ['query', 'cookie', 'hostname'],
      market:      ['cookie', 'header', 'query', 'accept-language'],
      currency:    ['cookie', 'header', 'query'],
      visitorGuid: ['header', 'cookie']
    }
  }
});
```

`priority` is optional, and so is each field within it. A partial array works
too — listed keys go first; unlisted keys keep their default order behind them:

```js
visitor: {
  priority: {
    hostname: ['x-forwarded'] // x-forwarded first, then x-dsa-host, then host
  }
}
```

### Allowed keys per field

| Field | Allowed keys | Default order |
|---|---|---|
| `hostname` | `x-dsa-host`, `x-forwarded`, `host` | same |
| `plid` | `query`, `cookie`, `hostname` | same |
| `market` | `cookie`, `header`, `query`, `accept-language` | same |
| `currency` | `cookie`, `header`, `query` | same |
| `visitorGuid` | `header`, `cookie` | same |

Unknown field names, unknown source keys, duplicate keys, or non-array values
throw at server startup.

## Usage

The below info will be gathered and assigned to the visitor object.
The order of resolution priority is indicated for each property.

- `plid` - Private Label Id assigned from:
  - Query parameters (`plid`, `pl_id`, `privateLabelId`, `privatelabelid`)
  - Cookies (`privateLabelId`, `privatelabelid`, `info_idp`)
  - Brand resolution based on hostname
  - Default fallback (`noBrandPlId = 3153`)
- `host` - Hostname with port, assigned from:
  - `x-dsa-host` header
  - `x-forwarded-host` header
  - `host` header
- `hostname` - Hostname without port, assigned from same sources as `host`
- `market` - A user's market assigned from:
  - `market` cookie
  - `x-market-id` header
  - `market` query parameter
  - `Accept-Language` header negotiation
  - Brand default market
- `locale` - Derived from `market` but used for translations
- `currency` - Currency code assigned from:
  - `currency` cookie
  - `x-currency-id` header
  - `currency` query parameter
  - Market's default currency
- `visitorGuid` - Unique identifier for a visitor parsed from:
  - `visitor` cookie
- `visitorId` - Same as `visitorGuid` (alias for compatibility)
- `visitGuid` - Unique identifier for a GoDaddy session from:
  - `pathway` cookie
- `sessionId` - Same as `visitGuid` (alias for compatibility)
- `debug` - Debug object (when debug mode enabled) containing source tracking for each property

## Actions

### getVisitor

These are made available to server code using the `getVisitor` GasketAction.

```js
import gasket from '../gasket';

// ./plugins/routes-plugin.js
export default {
  name: 'routes-plugin',
  hooks: {
    express(gasket, app) {
      app.get('/api/welcome', async (req, res) => {
        const visitor = await gasket.actions.getVisitor(req);
        if(visitor.plid === '1') {
          res.send('Welcome to GoDaddy!');
        } else {
          res.send('Welcome');  // Reseller
        }
      });
    }
  }
}
```

### Browser

For webapps, this info will be available from `@gasket/data`.

```js
import gasketData from '@gasket/data';

export function logWelcome() {
  if(gasketData.visitor.plid === '1') {
    console.log('Welcome to GoDaddy!');
  } else {
    console.log('Welcome'); // Reseller
  }
}
```

## Lifecycles

### visitor

The `visitor` lifecycle enables you to modify the visitor details derived by the plugin. Hooks receive the gasket object, current visitor details, and a context object containing the web request and response objects (`req` and `res` properties). Hook functions may be asynchronous.

```js
// gasket-plugin-example.js
export default {
  name: 'gasket-plugin-example',
  hooks: {
    visitor(gasket, visitor, { req }) {
      return {
        ...visitor,
        market: req.query.mkt
      };
    }
  }
}
```

<!-- LINKS -->

[@godaddy/gasket-preset-webapp]:/packages/gasket-preset-webapp/README.md
