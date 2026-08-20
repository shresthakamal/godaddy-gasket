# CHANGELOG

## 3.7.1

### Patch Changes

- bbdc404: Point `exports.require` at `./cjs/index.cjs` so CJS `require()` consumers work. The package already builds and ships `cjs/` via `gasket-cjs`, but `require` incorrectly targeted the ESM `./lib/index.js`. Leave `default` on `./lib/index.js` (ESM-first), matching auth/visitor/otel.

## 3.7.0

### Minor Changes

- 4610a67: Support the OAuth Bearer token auth modes added in `@switchboard/client`. The `switchboard.auth` config now accepts the `oauth_manual`, `oauth_client_credentials`, `oauth_iam_exchange`, `oauth_cert_exchange`, and `oauth_cert_path_exchange` modes (discriminated by their `type` field), with relative `certPath`/`keyPath` values for `oauth_cert_path_exchange` resolved against the Gasket root. Bumps the `@switchboard/client` dependency to `^2.8.1`, whose `ClientOptions['auth']` (`ClientAuthOptions`) now includes these modes.

## 3.6.4

### Patch Changes

- 9f59b62: Await `gasket.isReady` in switchboard actions so config, public config, experiment cohorts, and client initialization do not run until the Gasket instance has finished its prepare lifecycle.

## 3.6.3

### Patch Changes

- b86b17c: Update lodash to ^4.18.1 to fix CVE-2026-4800 (code injection via `_.template`) and CVE-2026-2950 (prototype pollution via `_.unset`/`_.omit`). Added pnpm-workspace.yaml override to align all transitive lodash instances.

## 3.6.2

### Patch Changes

- 5ebce4d: Remove dependency on the UXP plugin

## 3.6.1

### Patch Changes

- b52f485: Add vitest coverage for spaq quality metrics

## 3.6.0

### Minor Changes

- 2c4f63d: ESM Port

## 3.5.11

### Patch Changes

- 71da7a3: Tune switchboard with gasketData docs

## 3.5.10

### Patch Changes

- fa92eca: Include EXAMPLES.md when publishing

## 3.5.9

### Patch Changes

- 1889c33: move esm packages to vitest

## 3.5.8

### Patch Changes

- 35ce873: Add examples

## 3.5.7

### Patch Changes

- a72a8fe: Fix generated styles for new webapps

## 3.5.6

### Patch Changes

- fe92d45: Eslint9 upgrade

## 3.5.5

### Patch Changes

- 01cbbf8: Bump @switchboard/client dependency to ^2.5.2

## 3.5.4

### Patch Changes

- fbe622e: Fix bug where normalized configuration was not properly utilized when getting Switchboard data
- 265ea31: Update workspace dependencies from workspace:\* to workspace:^.

## 3.5.3

### Patch Changes

- 3671fe6: Apply overrides for `getExperimentCohorts`

## 3.5.2

### Patch Changes

- 8877f66: Fix missing action type and config passing bug

## 3.5.1

### Patch Changes

- b13bc4f: Update @gasket packages, fix type issues

## 3.5.0

### Minor Changes

- 9caedc0: Add getExperimentCohorts action

### Patch Changes

- bf5bccc: Bump deps

## 3.4.0

### Minor Changes

- 5a727ed: Bump `@switchboard/client`

## 3.3.4

### Patch Changes

- 7cbbab5: Adjust package main field

## 3.3.3

### Patch Changes

- eebf421: Pass shopperId and customerId if available by default

## 3.3.2

### Patch Changes

- 836d079: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.

## 3.3.1

### Patch Changes

- a3d6689: Updates to support using syncpack.

## 3.3.0

### Minor Changes

- 0b33139: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 3.2.11

- Externalize switchboard client for server-bundles; exclude for client bundles ([#1714])

## 3.2.10

- Reuse existing Switchboard client if already created ([#1712])

## 3.2.7

- Adjust auth conifg flow to `prepare` hook to allow for dynamic configuration ([#1704])
- Fix race condition with starting the switchboard client ([#1705])

## 3.2.1

- Omit `enableRedux` and `enableGasketData` from switchboard client options ([#1680])

## 3.1.0

- Updates for normalized GasketRequest ([#1642])

## 3.0.8

- (feature) Support loading Switchboard config into Gasket data
- (feature) Support loading Switchboard config into Redux state
- (feature) Support overriding Switchboard config
- (fix) Fix bugs with caching
- (fix) Remove some cruft from the Gasket upgrade

## 3.0.5

- Bump `@switchboard/client` to 2.x to fix IAM auth issues ([#1607])

## 3.0.0

- See [Upgrade Guide] for overall changes
- Removed `preboot` and `appRequestConfig` lifecycles. Added `getSwitchboardClient` and `getSwitchboardConfig` Gasket Actions. ([#1438])

## 2.18.7

- Bump `@switchboard/client` in order to use a better-performing top-level API and receive bug fixes. ([#1472])

## 2.18.1

- Bump `@switchboard/client` ([#1403])

## 2.18.0

- Add trace data to standard provided criteria for retrieving values ([#1397])

## 2.17.0

- (feature) support disabling Switchboard entirely ([#1384])

## 2.14.0

- Upgrade dependencies ([#1328])

## 2.13.0

- (feature) support relative paths for certificate files ([#1306])

## 2.10.0

- (chore) bump `@switchboard/client` to stable `1.x` version to facilitate easier upgrades going forward. Version bump is a non-breaking change. ([#1290])

## 2.8.11

- (fix) bump `@switchboard/client` to enable static linking of OpenSSL for Windows

## 2.8.7

- (fix) bump `@switchboard/client` to hopefully eliminate dependencies on dynamic libraries.

## 2.8.1

- (fix) bump `@switchboard/client` to fix error with hivemind event bus error bubbling ([#1218])

## 2.8.0

- Allow Node 14 and update client ([#1214])

## 2.6.0

- (fix) do not load `@switchboard/client` for all gasket commands ([#1205])
- (fix) restrict unwanted consumption of all hivemind experiments ([#1201])

## 2.5.0

- (fix) do not pass new gasket-specific config values to switchboard client ([#1196])

## 2.3.0

- (feature) support labels for fetching settings (supported by Hivemind)
- (feature) support grouping config values by app ID

## 2.2.0

- (feature) add optional enable callback to `switchboard` object in gasket config. ([#1191])
- (fix) help resolve environment config merging issues ([#1193])

## 2.0.0

- Initial release

[Upgrade Guide]: /docs/upgrade-to-7.md
[#1191]: https://github.com/gdcorp-uxp/gasket/pull/1191
[#1193]: https://github.com/gdcorp-uxp/gasket/pull/1193
[#1196]: https://github.com/gdcorp-uxp/gasket/pull/1196
[#1201]: https://github.com/gdcorp-uxp/gasket/pull/1201
[#1205]: https://github.com/gdcorp-uxp/gasket/pull/1205
[#1214]: https://github.com/gdcorp-uxp/gasket/pull/1214
[#1218]: https://github.com/gdcorp-uxp/gasket/pull/1218
[#1290]: https://github.com/gdcorp-uxp/gasket/pull/1290
[#1306]: https://github.com/gdcorp-uxp/gasket/pull/1306
[#1328]: https://github.com/gdcorp-uxp/gasket/pull/1328
[#1384]: https://github.com/gdcorp-uxp/gasket/pull/1384
[#1397]: https://github.com/gdcorp-uxp/gasket/pull/1397
[#1403]: https://github.com/gdcorp-uxp/gasket/pull/1403
[#1472]: https://github.com/gdcorp-uxp/gasket/pull/1472
[#1438]: https://github.com/gdcorp-uxp/gasket/pull/1438
[#1642]: https://github.com/gdcorp-uxp/gasket/pull/1642
[#1680]: https://github.com/gdcorp-uxp/gasket/pull/1680
[#1704]: https://github.com/gdcorp-uxp/gasket/pull/1704
[#1705]: https://github.com/gdcorp-uxp/gasket/pull/1705
[#1712]: https://github.com/gdcorp-uxp/gasket/pull/1712
[#1714]: https://github.com/gdcorp-uxp/gasket/pull/1714
