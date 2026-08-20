# CHANGELOG

## 3.9.0

### Minor Changes

- 26eb156: Add oauth support

## 3.8.5

### Patch Changes

- b86b17c: Update lodash to ^4.18.1 to fix CVE-2026-4800 (code injection via `_.template`) and CVE-2026-2950 (prototype pollution via `_.unset`/`_.omit`). Added pnpm-workspace.yaml override to align all transitive lodash instances.

## 3.8.4

### Patch Changes

- 9b9fff7: Restore `AuthRealm`, `AuthRisk`, `AuthIdp` as named exports. ESM port dropped them to default-export props while `.d.ts` still declared them as named exports, so `import { AuthRealm } from '@godaddy/gasket-plugin-auth'` resolved undefined. Also add missing `AuthIdp` runtime const.

## 3.8.3

### Patch Changes

- 95afda4: Forward pcpId and client from gasket config to FFI wrapper to resolve "not configured" warnings

## 3.8.2

### Patch Changes

- da9627b: Fix compatibility with @godaddy/gd-auth-lib v0.13.2+ nested options structure

  - Upgraded `@godaddy/gd-auth-lib` dependency from `^0.11.0` to `^0.13.2`
  - Fixed authentication to use nested `{ godaddySso: {...} }` structure required by v0.13.2+
  - Added backward compatibility for `riskLevel` config with deprecation warning
  - Fixed nullish coalescing to properly handle `SecurityLevel.NONE (0)`

  Note: This bumps the minimum gd-auth-lib version from 0.11.x to 0.13.2 due to breaking API changes in the library.

## 3.8.1

### Patch Changes

- Updated auth-lib-wrapper to use correct nested options structure for @godaddy/gd-auth-lib >= 0.13.2
  - Fixed `authenticate()` to pass `{ godaddySso: {...} }` instead of flat options
  - Upgraded `@godaddy/gd-auth-lib` dependency from `^0.11.0` to `^0.13.2`
  - Maps config `riskLevel` to internal `securityLevel` field for compatibility with updated library
  - Fixed nullish coalescing to properly handle `SecurityLevel.NONE (0)`

## 3.8.0

### Minor Changes

- 8e2abc2: - **[BREAKING]** Default `use12HourExpiration` to `true` for new 12h/30d expiration policy
  - Level 1/2 (low/medium): 30 days persistent / 12 hours non-persistent
  - Level 3 (high): 1 hour (unchanged)
  - Set `use12HourExpiration: false` in auth config to use legacy policy- Updated auth-lib-wrapper to pass `useNewExpiration` to both legacy and FFI auth libraries
  - Upgraded `gd-auth` dependency from `^1.4.1` to `^1.5.0` for `verifyNewExpiration` support
  - Upgraded `@godaddy/gd-auth-lib` dependency from `^0.7.0` to `^0.11.0`
  - Updated to use `SecurityLevel` instead of deprecated `RiskLevel` from gd-auth-lib 0.11.0

## 3.7.3

### Patch Changes

- 673903c: Align TypeScript exports with package exports

## 3.7.2

### Patch Changes

- 7a7132e: SSO redirects now use the app's configured auth.appName

## 3.7.1

### Patch Changes

- 86d29c0: bump godaddy/gd-auth-lib version
- dfa21b7: React 19 & NextJS 16

## 3.7.0

### Minor Changes

- 0c9ffa8: additon of ffi authlibrary support

## 3.6.2

### Patch Changes

- 5f45e5e: Port HCS package to ESM

## 3.6.1

### Patch Changes

- 0e6878c: Fix runtime error when visitor.hostname is undefined

## 3.6.0

### Minor Changes

- 2c4f63d: ESM Port

## 3.5.3

### Patch Changes

- b36e026: Adjust auth route protection with local development improvements

## 3.5.2

### Patch Changes

- fc8c8f5: Update OTel dependencies, add service environment env var, adjust docs to reference metrics lib

## 3.5.1

### Patch Changes

- cd49f16: add ability to lock routes behind auth
- fa92eca: Include EXAMPLES.md when publishing

## 3.5.0

### Minor Changes

- fa0a6b1: Add new getAuthToken Gasket Action to extract authentication tokens

## 3.4.3

### Patch Changes

- 1889c33: move esm packages to vitest

## 3.4.2

### Patch Changes

- 35ce873: Add examples

## 3.4.1

### Patch Changes

- 556d9e9: A minor bug fix in node-gd-auth with 1.4.1

## 3.4.0

### Minor Changes

- c914a91: WHAT the change is
  Adding new 12 hour expiration policy flag from connect-gd-auth

  WHY the change was made
  To expose the connect-gd-auth new version changes

  HOW a consumer should update their code
  Optional. Setting `use12HourExpiration` option to true will use new 12 hour token expiration policy

### Patch Changes

- a72a8fe: Fix generated styles for new webapps

## 3.3.9

### Patch Changes

- fe92d45: Eslint9 upgrade
- 2af6f1c: Add 's2snpr' and 'e2s2snpr' types to checkShopperAuth action
- Updated dependencies [fe92d45]
  - @godaddy/gasket-plugin-visitor@3.4.2

## 3.3.8

### Patch Changes

- Updated dependencies [2f37840]
  - @godaddy/gasket-plugin-visitor@3.4.0

## 3.3.7

### Patch Changes

- 265ea31: Update workspace dependencies from workspace:\* to workspace:^.
- Updated dependencies [265ea31]
  - @godaddy/gasket-plugin-visitor@3.3.5

## 3.3.6

### Patch Changes

- b13bc4f: Update @gasket packages, fix type issues
- Updated dependencies [b13bc4f]
  - @godaddy/gasket-plugin-visitor@3.3.4

## 3.3.5

### Patch Changes

- 8ace9b6: Fix to set auth.basePath in public gasketData
- 7cbbab5: Adjust package main field

## 3.3.4

### Patch Changes

- fca013d: Add support for payload.plt as privateLabelType

## 3.3.3

### Patch Changes

- 836d079: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [836d079]
  - @godaddy/gasket-plugin-visitor@3.3.3

## 3.3.2

### Patch Changes

- a3d6689: Updates to support using syncpack.
- Updated dependencies [a3d6689]
  - @godaddy/gasket-plugin-visitor@3.3.2

## 3.3.1

### Patch Changes

- 8c11c94: Fix to use base Request type for route handler

## 3.3.0

### Minor Changes

- 0b33139: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [0b33139]
  - @godaddy/gasket-plugin-visitor@3.3.0

## 3.2.6

- Expose auth IDP type ([#1709])

## 3.2.5

- fix to Add ucid details w/o groups check ([#1694])

## 3.2.4

- Return `ucid` with auth details if set ([#1691])

## 3.2.2

- Add `@godaddy/gasket-plugin-visitor` as a peer dependency ([#1674])

## 3.2.0

- Allow performing heartbeat request when VAT is expired ([#1665])

## 3.1.0

- Updates for normalized GasketRequest ([#1642])
  - Refactored to use `gd-auth` directly
- Out of box support for AppRouter ([#1646])

## 3.0.3

- Auth type fixes ([#1595])

## 3.0.0

- See [Upgrade Guide] for overall changes

## 2.24.1

- Bump `connect-gd-auth` ([#1330])

## 2.24.0

- Make AD group checks case-insensitive ([#1334])

## 2.23.0

- Upgrade dependencies ([#1328])

## 2.22.0

- Reuse identical auth checks within the same HTTP request ([#1305])

## 2.20.0

- Allow AD group checks when IDP type is e2s or e2s2s ([#1262])

## 2.19.4

- Improve documentation and types for the `checkAuth` function. ([#1259])

## 2.19.2

- Use auth token from gdAuth if available ([#1248])

## 2.19.0

- Only check for mismatch plids on secureserver.net ([#1238])

## 2.18.0

- Add support for realm `awsiam` and optionally `roles` whitelist ([#1229])

## 2.17.0

- Add `customerId` property to visitor ([#1213])

## 2.15.0

- Support `idp_int` auth realm.
- Auto-correct erroneous `sso.` host prefixes. ([#1197])

## 2.12.2

- upgrade godaddy eslint-config versions ([#882])

## 2.10.0

- [AUTH-10925] add realm pass for check auth ([#159])

## 2.9.1

- Add TypeScript types ([#3], [#8])
- Allow `auth.host` to be configured ([#10])

## 2.9.0

- Support `cert` authentication/authorization ([#347])

## 2.8.0

- [SYNTH-644] Updates to support React 17 ([#324])

## 2.5.1

- Fix crash when no `host` header is present in a request. ([#310])

## 2.5.0

- Bump connect-gd-auth to ^13.0.0 ([#303])

## 2.4.1

- Default realm to `idp` ([#300])

## 2.4.0

- Filter auth tokens from Elastic APM logging ([#299])

## 2.3.0

- Hook `visitor` lifecycle for auth-related details ([#290])

## 2.0.3

- Add fastify lifecycle hook ([#212])

## 2.0.1

- Add module metadata for `@godaddy/gasket-auth` ([#171])

## 2.0.0

- [[UXP-3759]] Updated zone config to base path config. ([#99])
- Decoupled from Redux ([#98])
  - Request-based settings moved to gasketData in response object
- [[STGLS-130]] Normalize plid as number ([#138])

## 1.3.0

- [[UXP-388]] Added ability to consume zones gasket config ([#63])

## 1.2.0

- [[UXP-1515]] Check for mismatch plids from PC and JWT ([#28])

## 1.1.0

- Add support for enabling API Proxy for SSO ([#24])

## 1.0.0

- Initial rename release.

[Upgrade Guide]: /docs/upgrade-to-7.md
[#3]: https://github.com/gdcorp-uxp/gasket/pull/3
[#8]: https://github.com/gdcorp-uxp/gasket/pull/8
[#10]: https://github.com/gdcorp-uxp/gasket/pull/10
[#159]: https://github.com/gdcorp-uxp/gasket/pull/159
[#882]: https://github.com/gdcorp-uxp/gasket/pull/882
[#1197]: https://github.com/gdcorp-uxp/gasket/pull/1197
[#1213]: https://github.com/gdcorp-uxp/gasket/pull/1213
[#1229]: https://github.com/gdcorp-uxp/gasket/pull/1229
[#1238]: https://github.com/gdcorp-uxp/gasket/pull/1238
[#1248]: https://github.com/gdcorp-uxp/gasket/pull/1248
[#1259]: https://github.com/gdcorp-uxp/gasket/pull/1259
[#1262]: https://github.com/gdcorp-uxp/gasket/pull/1262
[#1305]: https://github.com/gdcorp-uxp/gasket/pull/1305
[#1328]: https://github.com/gdcorp-uxp/gasket/pull/1328
[#1330]: https://github.com/gdcorp-uxp/gasket/pull/1330
[#1334]: https://github.com/gdcorp-uxp/gasket/pull/1334
[#1642]: https://github.com/gdcorp-uxp/gasket/pull/1642
[#1646]: https://github.com/gdcorp-uxp/gasket/pull/1646
[#1665]: https://github.com/gdcorp-uxp/gasket/pull/1665
[#1674]: https://github.com/gdcorp-uxp/gasket/pull/1674
[#1691]: https://github.com/gdcorp-uxp/gasket/pull/1691
[#1694]: https://github.com/gdcorp-uxp/gasket/pull/1694
[#1709]: https://github.com/gdcorp-uxp/gasket/pull/1709
[UXP-1515]: https://jira.godaddy.com/browse/UXP-1515
[UXP-388]: https://jira.godaddy.com/browse/UXP-388
[UXP-3759]: https://jira.godaddy.com/browse/UXP-3759
[STGLS-130]: https://jira.godaddy.com/browse/STGLS-130
[SYNTH-644]: https://jira.godaddy.com/browse/SYNTH-644
[AUTH-10925]: https://jira.godaddy.com/browse/AUTH-10925
