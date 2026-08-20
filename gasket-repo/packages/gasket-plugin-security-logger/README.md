# @godaddy/gasket-plugin-security-logger

Adds a security logger for GoDaddy Gasket apps using [`@godaddy/security-logger`].

## Installation

#### New apps

``` sh
gasket create <app-name> --plugins @godaddy/gasket-plugin-security-logger
```

#### Existing apps

``` sh
npm i @godaddy/gasket-plugin-security-logger @godaddy/security-logger
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginSecurityLogger from '@godaddy/gasket-plugin-security-logger';

export default makeGasket({
  plugins: [
+   pluginSecurityLogger
  ]
});
```

## Configuration

This plugin sets up a `security` logging level that can be used to log security
events. It can be configured by setting the `securityLogger` property in the
`gasket.js`. Configuration setting will be passed through to
[`@godaddy/security-logger`]. You need to provide _at least_ your aws account
information and the name of your service.

```js
// gasket.js
import { makeGasket } from '@gasket/core';

export default makeGasket({
  plugins: [
    // ...
  ],
  securityLogger: {
    aws: {
      accountId: '123456789',
      accountName: 'gd-aws-usa-gpd-myteam-prod'
    },
    serviceFullName: 'prefixed-name-of-my-service'
  }
});
```

## Usage

This plugin will add a `security` level to your applications gasket.logger instance.
You can use this to have your logs picked up for
[application security logging][security-logging].

```js
// Log a database update
gasket.logger.security('A Record was changed', {
  transaction: { id: req.id },
  domain_name: req.domain,
  new_ip: req.body.ip,
  event: {
      kind: 'event'
      category: 'database',
      type: ['change'],
      outcome:'success',
      action: 'dns_record_change'
    }
});
```

<!-- LINKS -->

[`@godaddy/security-logger`]: https://github.com/gdcorp-engineering/node-security-logger
[security-logging]: https://github.com/gdcorp-engineering/cto-guidelines/blob/main/Standards-Best-Practices/Security/Application-Security-Logging-Standard.md
