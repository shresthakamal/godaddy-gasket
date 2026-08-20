# @godaddy/gasket-plugin-security-auth-logging

Writes auth logs for GoDaddy Gasket apps based on `@godaddy/gasket-plugin-auth`.

## Installation

#### New apps

``` sh
gasket create <app-name> --plugins @godaddy/gasket-plugin-security-auth-logging
```

#### Existing apps

``` sh
npm i @godaddy/gasket-plugin-security-auth-logging
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginSecurityAuthLogging from '@godaddy/gasket-plugin-security-auth-logging';

export default makeGasket({
  plugins: [
+   pluginSecurityAuthLogging
  ]
});
```

## Configuration

This plugin uses the configuration from `@godaddy/gasket-plugin-security-logger`
but has no configuration of its own.

It will respect the `securityLogger.disabled` configuration, which will cause
this plugin to essentially no-op.

It observes the `@godaddy/gasket-plugin-auth`'s `authChecked` gasket lifecycle
event and logs it according to the [application security logging standard][security-logging].

<!-- LINKS -->
[security-logging]: https://github.com/gdcorp-engineering/cto-guidelines/blob/main/Standards-Best-Practices/Security/Application-Security-Logging-Standard.md
