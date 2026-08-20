# @godaddy/gasket-private-labels Examples

This document provides working examples for all exported functions and interfaces from the `@godaddy/gasket-private-labels` package.

## Installation

```bash
npm install @godaddy/gasket-private-labels
```

## getEnvPlids

Get a plid picker object for a given environment.

```js
import { getEnvPlids } from '@godaddy/gasket-private-labels';

// Production environment
const prodPlids = getEnvPlids('prod');
console.log(prodPlids.godaddy); // 1
console.log(prodPlids.reamaze); // 579333

// Development environment
const devPlids = getEnvPlids('dev');
console.log(devPlids.godaddy); // 1
console.log(devPlids.reamaze); // 443755

// Test environment
const testPlids = getEnvPlids('test');
console.log(testPlids.godaddy); // 1
console.log(testPlids.reamaze); // 276950

// Environment variations
const prodPlids2 = getEnvPlids('production'); // same as 'prod'
const stgPlids = getEnvPlids('staging'); // same as 'prod'
const devPlids2 = getEnvPlids('development'); // same as 'dev'
const devPlids3 = getEnvPlids('local'); // same as 'dev'
```

## getPlidFromHost

Get a plid for a given hostname including env variants.

```js
import { getPlidFromHost } from '@godaddy/gasket-private-labels';

// Production hosts
console.log(getPlidFromHost('www.godaddy.com')); // 1
console.log(getPlidFromHost('reamaze.com')); // 579333
console.log(getPlidFromHost('123-reg.co.uk')); // 587240

// Development hosts
console.log(getPlidFromHost('local.dev-godaddy.com:8080')); // 1
console.log(getPlidFromHost('dev-reamaze.com')); // 443755
console.log(getPlidFromHost('test-123-reg.co.uk')); // 587240

// With subdomains and ports
console.log(getPlidFromHost('api.godaddy.com')); // 1
console.log(getPlidFromHost('test.reamaze.com:3000')); // 276950
```

## getPlidFromDomain

Get a plid using a base domain and environment.

```js
import { getPlidFromDomain } from '@godaddy/gasket-private-labels';

// Production
console.log(getPlidFromDomain('godaddy.com', 'prod')); // 1
console.log(getPlidFromDomain('reamaze.com', 'production')); // 579333

// Development
console.log(getPlidFromDomain('godaddy.com', 'dev')); // 1
console.log(getPlidFromDomain('reamaze.com', 'development')); // 443755

// Test
console.log(getPlidFromDomain('123-reg.co.uk', 'test')); // 587240
console.log(getPlidFromDomain('reamaze.com', 'test')); // 276950

// OTE
console.log(getPlidFromDomain('mediatemple.net', 'ote')); // 1001776
console.log(getPlidFromDomain('hosteurope.es', 'ote')); // 1002767
```

## getProdPlidFromOte

Get a production plid from an OTE plid, or fallback to provided id if not found.

```js
import { getProdPlidFromOte } from '@godaddy/gasket-private-labels';

// Valid OTE to production mappings
console.log(getProdPlidFromOte(1002767)); // 525849 (Host Europe ES)
console.log(getProdPlidFromOte(1001776)); // 495469 (Media Temple)
console.log(getProdPlidFromOte(1002762)); // 587240 (123 Reg)

// Unknown OTE plid - returns the same value
console.log(getProdPlidFromOte(12345)); // 12345
console.log(getProdPlidFromOte(999999)); // 999999
```

## isPrivateLabelHost

Check if a hostname is a private label.

```js
import { isPrivateLabelHost } from '@godaddy/gasket-private-labels';

// Private label hosts
console.log(isPrivateLabelHost('www.godaddy.com')); // true
console.log(isPrivateLabelHost('reamaze.com')); // true
console.log(isPrivateLabelHost('123-reg.co.uk')); // true
console.log(isPrivateLabelHost('dev-mediatemple.net')); // true
console.log(isPrivateLabelHost('api.hosteurope.de')); // true

// Non-private label hosts
console.log(isPrivateLabelHost('example.com')); // false
console.log(isPrivateLabelHost('google.com')); // false
console.log(isPrivateLabelHost('microsoft.com')); // false
```

## isSecureServerHost

Check if a hostname is a secureserver.net host.

```js
import { isSecureServerHost } from '@godaddy/gasket-private-labels';

// Secure server hosts
console.log(isSecureServerHost('www.secureserver.net')); // true
console.log(isSecureServerHost('api.secureserver.net')); // true
console.log(isSecureServerHost('test.secureserver.net')); // true

// Non-secure server hosts
console.log(isSecureServerHost('godaddy.com')); // false
console.log(isSecureServerHost('reamaze.com')); // false
console.log(isSecureServerHost('example.com')); // false
```

## PlidPicker Interface

The `PlidPicker` object returned by `getEnvPlids` provides property accessors for all brand keys.

```js
import { getEnvPlids } from '@godaddy/gasket-private-labels';

const plids = getEnvPlids('prod');

// Access by brand key
console.log(plids.godaddy); // 1
console.log(plids.reamaze); // 579333
console.log(plids.mediatemple); // 495469
console.log(plids.afternic); // 497036
console.log(plids.starfieldtech); // 504762
console.log(plids.hosteurope); // 525847
console.log(plids.hosteuropees); // 525849
console.log(plids.heartinternet); // 525848
console.log(plids.domainfactory); // 525845
console.log(plids.domainbox); // 525850
console.log(plids.donhost); // 525851
console.log(plids.webfusion); // 525852
console.log(plids.webhuset); // 536004
console.log(plids.meshmedia); // 540723
console.log(plids.velia); // 541136
console.log(plids.mrsite); // 542167
console.log(plids.server4you); // 549227
console.log(plids.sucuri); // 565123
console.log(plids.uniregistry); // 566574

// Special accessors for 123reg
console.log(plids['123reg']); // 587240
console.log(plids.oneTwoThreeReg); // 587240 (same value)

// Deprecated brand (still accessible)
console.log(plids.bluerazor); // 2

// Wildwest and domains-related brands
console.log(plids.wildwestdomains); // 1387
console.log(plids.maddogdomains); // 1941
console.log(plids.domainspricedright); // 1592
console.log(plids.domainsbyproxy); // 1695

// GD Corp tools
console.log(plids.gdcorp); // 1
```

## Practical Usage Examples

### Express Middleware

```js
import express from 'express';
import { getPlidFromHost, isPrivateLabelHost } from '@godaddy/gasket-private-labels';

const app = express();

app.use((req, res, next) => {
  const host = req.get('host');

  if (isPrivateLabelHost(host)) {
    req.plid = getPlidFromHost(host);
    req.isPrivateLabel = true;
  } else {
    req.plid = 1; // Default to GoDaddy
    req.isPrivateLabel = false;
  }

  next();
});
```

### Environment-Based Configuration

```js
import { getEnvPlids, getPlidFromDomain } from '@godaddy/gasket-private-labels';

function getAppConfig(env) {
  const plids = getEnvPlids(env);

  return {
    godaddy: {
      plid: plids.godaddy,
      apiUrl: env === 'prod' ? 'https://api.godaddy.com' : 'https://api.dev-godaddy.com'
    },
    reamaze: {
      plid: plids.reamaze,
      apiUrl: env === 'prod' ? 'https://api.reamaze.com' : 'https://api.dev-reamaze.com'
    }
  };
}

// Usage
const prodConfig = getAppConfig('prod');
const devConfig = getAppConfig('dev');
```

### OTE to Production Mapping

```js
import { getProdPlidFromOte, getEnvPlids } from '@godaddy/gasket-private-labels';

function migrateOteData(otePlid, data) {
  const prodPlid = getProdPlidFromOte(otePlid);

  if (prodPlid !== otePlid) {
    console.log(`Migrating data from OTE PLID ${otePlid} to Production PLID ${prodPlid}`);
    // Perform migration logic here
    return { ...data, plid: prodPlid };
  }

  console.log(`PLID ${otePlid} is not an OTE PLID, no migration needed`);
  return data;
}

// Usage
const migratedData = migrateOteData(1002767, { name: 'Host Europe ES' });
```
