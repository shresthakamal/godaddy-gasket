# Examples

This document provides practical examples for using the `@godaddy/gasket-plugin-visitor` package.

## Plugin Configuration

### Basic Setup

```js
// gasket.js
import pluginVisitor from '@godaddy/gasket-plugin-visitor';

export default makeGasket({
  plugins: [
    pluginVisitor
  ]
});
```

### With Debug Configuration

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginVisitor
  ],
  visitor: {
    debug: true // Enable debug info in visitor object
  }
});
```

## Actions

### getVisitor

Get visitor details from a request object.

```js
// In a route handler
export default {
  name: 'routes-plugin',
  hooks: {
    express(gasket, app) {
      app.get('/api/welcome', async (req, res) => {
        const visitor = await gasket.actions.getVisitor(req);

        if (visitor.plid === 1) {
          res.send('Welcome to GoDaddy!');
        } else {
          res.send(`Welcome to ${visitor.hostname}!`);
        }
      });
    }
  }
};
```

```js
// In middleware
export default {
  name: 'visitor-middleware',
  hooks: {
    middleware(gasket) {
      return async (req, res, next) => {
        const visitor = await gasket.actions.getVisitor(req);
        // Do something with visitor
        next();
      };
    }
  }
};
```

```js
// In Next.js getServerSideProps
export async function getServerSideProps({ req }) {
  const visitor = await gasket.actions.getVisitor(req);

  return {
    props: {
      market: visitor.market,
      currency: visitor.currency,
      locale: visitor.locale
    }
  };
}
```

## Lifecycle Hooks

### visitor

Modify or enhance visitor details before they're returned.

```js
// Add custom visitor properties
export default {
  name: 'custom-visitor-plugin',
  hooks: {
    visitor(gasket, visitor, { req }) {
      return {
        ...visitor,
        isVip: req.query.vip === 'true',
        customerId: req.headers['x-customer-id']
      };
    }
  }
};
```

## Browser Usage

### With @gasket/data

```js
import { gasketData } from '@gasket/data';

export function useVisitorInfo() {
  const { visitor } = gasketData();

export function useVisitorInfo() {
  const { visitor } = gasketData;

  return {
    isGoDaddy: visitor.plid === 1,
    market: visitor.market,
    currency: visitor.currency,
    locale: visitor.locale
  };
}
```

### Component Example

```jsx
import { useGasketData } from '@gasket/nextjs';
import { useEffect, useState } from 'react';

export function WelcomeMessage() {
  const [visitor, setVisitor] = useState(null);
  const { visitor } = useGasketData();

  if (!visitor) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome!</h1>
      <p>Market: {visitor.market}</p>
      <p>Currency: {visitor.currency}</p>
      {visitor.plid === 1 && <p>You're on GoDaddy!</p>}
    </div>
  );
}
```

## Common Use Cases

### Market-based Routing

```js
export default {
  name: 'market-routing',
  hooks: {
    middleware(gasket) {
      return async (req, res, next) => {
        const visitor = await gasket.actions.getVisitor(req);

        // Redirect to market-specific path
        if (req.path === '/' && visitor.market !== 'en-US') {
          return res.redirect(`/${visitor.market}`);
        }

        next();
      };
    }
  }
};
```

### Currency Display

```js
// In a pricing component
export async function getServerSideProps({ req }) {
  const visitor = await gasket.actions.getVisitor(req);
  const prices = await getPricing(visitor.currency);

  return {
    props: {
      prices,
      currency: visitor.currency
    }
  };
}

export default function PricingPage({ prices, currency }) {
  return (
    <div>
      <h1>Pricing</h1>
      {prices.map(price => (
        <div key={price.id}>
          {price.amount} {currency}
        </div>
      ))}
    </div>
  );
}
```
