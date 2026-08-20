# CHANGELOG

## 3.6.0

### Minor Changes

- 9ea0ba4: Add makeAuthFetch to customize the SSO redirect URL with AuthProps

## 3.5.5

### Patch Changes

- 7813841: Actively call `window.heartbeat.dispatch()` on stale-VAT 401 to force an immediate token refresh, then re-validate and dispatch a fresh auth state, eliminating the race window where a second validation cycle would still fail.

## 3.5.4

### Patch Changes

- 9410aa8: Bridge a stale-vat 401 so a heartbeat-driven token refresh isn't seen as a
  logout. A `/api/auth/validate` 401 with `authReason: 3` means the vat
  (validation token) is merely stale, not that the session expired — the
  out-of-band browser heartbeat refreshes it within seconds. On a reconnect or
  window-refocus burst (every React Query refetch firing at once), the validate
  could momentarily return that stale-vat 401 before the heartbeat caught up,
  flipping `AuthRequired` to the SSO prompt for an already-authenticated user
  (the "Welcome" modal that a refresh clears).

  `ClientHandler.getAuthState` now preserves a previously-valid session across a
  single stale-vat 401 (fresh timestamp → re-validates on the next cycle, by
  which point the heartbeat has refreshed the vat). The bridge is bounded by a
  `staleVatRecovered` flag to one recovery: if the next validation is still a
  stale-vat 401, the state is replaced and the redirect proceeds. Genuine
  rejections (real expiry — `authReason` 1/2) are unchanged and redirect
  immediately. Complements the network-error classification fix.

## 3.5.3

### Patch Changes

- 5895f91: Do not treat a transient network/connectivity failure as a logout. Previously a
  failed `/api/auth/validate` request (offline, DNS, abort — the request never
  reached the server) was collapsed into the same `ERROR` state as a real 401, so
  `AuthRequired` would redirect an already-authenticated user to SSO (or render
  its `alt`), producing a stuck login screen on a brief network blip.

  The client and server handlers now flag connectivity failures with
  `networkError: true`. On a network error the SSO redirect/alt is suppressed
  (the loading fallback renders instead), and a previously-valid session is
  preserved and re-validated once connectivity returns. A genuine auth rejection
  (non-ok response / real 401) is unchanged and still redirects.

## 3.5.2

### Patch Changes

- 10e40e3: Extract `Ux` as a named global interface to allow declaration merging in other projects

## 3.5.1

### Patch Changes

- 3e2d457: Include port in redirect URL if in visitor.host

## 3.5.0

### Minor Changes

- 8e2abc2: - **[BREAKING]** Default `use12HourExpiration` to `true` for new 12h/30d expiration policy
  - Level 1/2 (low/medium): 30 days persistent / 12 hours non-persistent
  - Level 3 (high): 1 hour (unchanged)
  - Set `use12HourExpiration: false` in auth config to use legacy policy- Updated auth-lib-wrapper to pass `useNewExpiration` to both legacy and FFI auth libraries
  - Upgraded `gd-auth` dependency from `^1.4.1` to `^1.5.0` for `verifyNewExpiration` support
  - Upgraded `@godaddy/gd-auth-lib` dependency from `^0.7.0` to `^0.11.0`
  - Updated to use `SecurityLevel` instead of deprecated `RiskLevel` from gd-auth-lib 0.11.0

## 3.4.7

### Patch Changes

- b52f485: Add vitest coverage for spaq quality metrics

## 3.4.6

### Patch Changes

- 673903c: Align TypeScript exports with package exports

## 3.4.5

### Patch Changes

- 7a7132e: SSO redirects now use the app's configured auth.appName

## 3.4.4

### Patch Changes

- 35b407a: fix double basepath with nextjs apps

## 3.4.3

### Patch Changes

- 789e475: Skip wrapped getInitialProps when redirecting

## 3.4.2

### Patch Changes

- 69efa9c: Update deps

## 3.4.1

### Patch Changes

- dfa21b7: React 19 & NextJS 16

## 3.4.0

### Minor Changes

- 2c4f63d: ESM Port

## 3.3.18

### Patch Changes

- fc8c8f5: Update OTel dependencies, add service environment env var, adjust docs to reference metrics lib
- 5bb2c00: Add example for app router with auth components

## 3.3.17

### Patch Changes

- fa92eca: Include EXAMPLES.md when publishing

## 3.3.16

### Patch Changes

- 1889c33: move esm packages to vitest

## 3.3.15

### Patch Changes

- 35ce873: Add examples

## 3.3.14

### Patch Changes

- a72a8fe: Fix generated styles for new webapps

## 3.3.13

### Patch Changes

- fe92d45: Eslint9 upgrade
- Updated dependencies [fe92d45]
- Updated dependencies [2af6f1c]
  - @godaddy/gasket-plugin-auth@3.3.9

## 3.3.12

### Patch Changes

- 93541bd: Use standardized CJS output
  - @godaddy/gasket-plugin-auth@3.3.8

## 3.3.11

### Patch Changes

- @godaddy/gasket-plugin-auth@3.3.8

## 3.3.10

### Patch Changes

- 1b640eb: Upgrade @gasket dependencies
  - @godaddy/gasket-plugin-auth@3.3.7

## 3.3.9

### Patch Changes

- 265ea31: Update workspace dependencies from workspace:\* to workspace:^.
- Updated dependencies [265ea31]
  - @godaddy/gasket-plugin-auth@3.3.7

## 3.3.8

### Patch Changes

- d0e2301: missing await on gsp getRedirectUrl
  - @godaddy/gasket-plugin-auth@3.3.6

## 3.3.7

### Patch Changes

- b13bc4f: Update @gasket packages, fix type issues
- Updated dependencies [b13bc4f]
  - @godaddy/gasket-plugin-auth@3.3.6

## 3.3.6

### Patch Changes

- 84965c4: Add basePath support to auth redirects

  - Add @gasket/plugin-data dependency
  - Add getPublicGasketData to get basePath from gasket data
  - Update redirect URL construction to include basePath
  - Add tests for basePath functionality
  - @godaddy/gasket-plugin-auth@3.3.5

## 3.3.5

### Patch Changes

- 25f18e6: Add CJS transpile to ESM-only packages
- Updated dependencies [8ace9b6]
- Updated dependencies [7cbbab5]
  - @godaddy/gasket-plugin-auth@3.3.5

## 3.3.4

### Patch Changes

- 65170e0: Fix typo in documentation
  - @godaddy/gasket-plugin-auth@3.3.4

## 3.3.3

### Patch Changes

- Updated dependencies [fca013d]
  - @godaddy/gasket-plugin-auth@3.3.4

## 3.3.2

### Patch Changes

- 836d079: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [836d079]
  - @godaddy/gasket-plugin-auth@3.3.3

## 3.3.1

### Patch Changes

- a3d6689: Updates to support using syncpack.
- Updated dependencies [a3d6689]
  - @godaddy/gasket-plugin-auth@3.3.2

## 3.3.0

### Minor Changes

- 0b33139: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [0b33139]
  - @godaddy/gasket-plugin-auth@3.3.0

## 3.2.3

- Expose auth IDP type ([#1709])

## 3.2.0

- Allow performing heartbeat request when VAT is expired ([#1665])

## 3.1.0

- Updates for normalized GasketRequest ([#1642])

## 3.0.5

- Handle undefined window object ([#1620])

## 3.0.4

- Handle scenario when ssoUrl is null ([#1610])

## 3.0.2

- Auth type fixes ([#1595])

## 3.0.0

- See [Upgrade Guide] for overall changes
- Add console.log for SSO redirects ([#1421])
- Removed deprecated `authStatus` (now `AuthStatus`) ([#1347])

## 2.15.4

- Fix Realm and Risk types for AuthRequired ([#1411])

## 2.15.0

- Upgrade dependencies ([#1328])

## 2.14.1

- Fix to capture sso login url when PresentationCentral manifest is v3 ([#1323])

## 2.13.1

- Fix bug with trying to set a header when they are already sent

## 2.13.0

- [FOSS-378] Update react and react-dom to 18 ([#1294])

## 2.12.5

- Fix to only return redirect URL if not authenticated ([#1265])

## 2.12.0

- Utilize hostname captured by visitor plugin for sso redirect ([#1240])

## 2.11.3

- capture correct subdomain for .co.uk ([#1237])

## 2.10.0

- remove experimental notices ([#1208])

## 2.9.0

- Export InjectedDetails type and document ([#1199])

## 2.8.0

- Support `idp_int` auth realm.

## 2.7.2

- Support branded sso redirects ([#832])
- upgrade godaddy eslint-config versions ([#882])

## 2.6.0

- Change resolved value of `authFetch` so it is a `Response` object,
- making it more of a viable drop-in replacement where `fetch` would
- otherwise be used. ([#394])

## 2.5.2

- Fix incorrect usage of some React types ([#17])

## 2.5.1

- Add TypeScript types ([#3], [#8])
- Remove legacy reducers files ([#7])

## 2.5.0

- [SYNTH-644] Updates to support React 17 ([#324])

## 2.2.1

- Fix crash when no `host` header is present in a request. ([#310])

## 2.2.0

- [SYNTH-557] Fix consistent authStateKey ([#301])
- Add `authGetInitialProps` ([#302])

## 2.1.0

- Disable caching for pages/apps that require auth ([#268])

## 2.0.2

- Ensure clean build before publishing ([#211])

## 2.0.1

- Update Afternic login URLs ([#196])

## 2.0.0

- Decoupled from Redux ([#98])
- Support for getServerSideProps with Next v10 ([#98])
- Fix to avoid cannot update a component while rendering a different component warning. ([#108])

## 1.4.2

-[UXP-5125] SSO url should work with v3 headers ([#152])

## 1.4.1

- Add support for transforming Afternic login URLs ([#90])

## 1.4.0

- [UXP-1431] Add support for `authFetch` ([#68])

## 1.3.1

- Fix Check if headers are already sent ([#61])

## 1.3.0

- Support for customizing or disabling sso subdomain ([#48])

## 1.2.0

- [[UXP-1515]] Check for mismatch plids from PC and JWT ([#28])

## 1.0.0

- Initial rename release.

[Upgrade Guide]: /docs/upgrade-to-7.md
[#3]: https://github.com/gdcorp-uxp/gasket/pull/3
[#7]: https://github.com/gdcorp-uxp/gasket/pull/7
[#8]: https://github.com/gdcorp-uxp/gasket/pull/8
[#17]: https://github.com/gdcorp-uxp/gasket/pull/17
[#394]: https://github.com/gdcorp-uxp/gasket/pull/394
[#832]: https://github.com/gdcorp-uxp/gasket/pull/832
[#882]: https://github.com/gdcorp-uxp/gasket/pull/882
[#1199]: https://github.com/gdcorp-uxp/gasket/pull/1199
[#1208]: https://github.com/gdcorp-uxp/gasket/pull/1208
[#1237]: https://github.com/gdcorp-uxp/gasket/pull/1237
[#1240]: https://github.com/gdcorp-uxp/gasket/pull/1240
[#1265]: https://github.com/gdcorp-uxp/gasket/pull/1265
[#1294]: https://github.com/gdcorp-uxp/gasket/pull/1294
[#1323]: https://github.com/gdcorp-uxp/gasket/pull/1323
[#1328]: https://github.com/gdcorp-uxp/gasket/pull/1328
[#1347]: https://github.com/gdcorp-uxp/gasket/pull/1347
[#1411]: https://github.com/gdcorp-uxp/gasket/pull/1411
[#1421]: https://github.com/gdcorp-uxp/gasket/pull/1421
[#1595]: https://github.com/gdcorp-uxp/gasket/pull/1595
[#1610]: https://github.com/gdcorp-uxp/gasket/pull/1610
[#1620]: https://github.com/gdcorp-uxp/gasket/pull/1620
[#1642]: https://github.com/gdcorp-uxp/gasket/pull/1642
[#1665]: https://github.com/gdcorp-uxp/gasket/pull/1665
[#1709]: https://github.com/gdcorp-uxp/gasket/pull/1709
[UXP-1515]: https://jira.godaddy.com/browse/UXP-1515
[UXP-1431]: https://jira.godaddy.com/browse/UXP-1431
[UXP-5125]: https://jira.godaddy.com/browse/UXP-5125
[SYNTH-557]: https://jira.godaddy.com/browse/SYNTH-557
[SYNTH-644]: https://jira.godaddy.com/browse/SYNTH-644
[FOSS-378]: https://godaddy-corp.atlassian.net/browse/FOSS-378
