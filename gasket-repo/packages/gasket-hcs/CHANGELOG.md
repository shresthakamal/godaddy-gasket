# CHANGELOG

## 3.7.4

### Patch Changes

- 53765dd: Bump Skip-Navigation

## 3.7.3

### Patch Changes

- cb74a55: Wrap delay-loaded components in `withManifest` with `ErrorBoundary` so chunk load failures render null instead of crashing the header.

## 3.7.2

### Patch Changes

- 4b993c0: Bump @ux/account-delegation to ^17.0.0 and add @godaddy/react-mintl as a peerDependency (UXP-10503).

  @ux/account-delegation v17 removes the inner IntlProvider wrap that was creating
  a duplicate provider under withManifest's own IntlProvider. Add @godaddy/react-mintl
  as a peerDependency since with-manifest.jsx imports IntlProvider directly from it.

## 3.7.1

### Patch Changes

- b52f485: Add vitest coverage for spaq quality metrics
- 0f96c25: Fix jsx imports in lib

## 3.7.0

### Minor Changes

- 7db70ee: bump header-util for x-app-key header

## 3.6.3

### Patch Changes

- 69efa9c: Update deps

## 3.6.2

### Patch Changes

- 96edfc5: Various template fixes

## 3.6.1

### Patch Changes

- dfa21b7: React 19 & NextJS 16

## 3.6.0

### Minor Changes

- 5f45e5e: Port HCS package to ESM

## 3.5.0

### Minor Changes

- 2bfcd6a: Upgrade Uxcore to 2500

## 3.4.0

### Minor Changes

- f915986: port changes from lts to main

## 3.3.7

### Patch Changes

- fa92eca: Include EXAMPLES.md when publishing

## 3.3.6

### Patch Changes

- 1889c33: move esm packages to vitest

## 3.3.5

### Patch Changes

- 35ce873: Add examples

## 3.3.4

### Patch Changes

- a72a8fe: Fix generated styles for new webapps

## 3.3.3

### Patch Changes

- fe92d45: Eslint9 upgrade

## 3.3.2

### Patch Changes

- 836d079: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.

## 3.3.1

### Patch Changes

- a3d6689: Updates to support using syncpack.

## 3.3.0

### Minor Changes

- 0b33139: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 3.2.1

- [UXP-10704] Fix array issue with Skip navigation

## 3.1.0

- Aligned version releases across all packages

## 3.0.0

- See [Upgrade Guide] for overall changes

## 2.25.3

- [UXP-10441] Account delegation should not be present for internal-header preset ([#1577])

## 2.25.0

- Introduce custom cssnano preset to apply PostCSS transformation on a bundle level ([#1544])

## 2.24.0

- bump `@ux/header-util` to `13.0.6`
- [UXP-10287] use fixGuiUrl utility function to fix the gui url before configuring shopper data

## 2.23.6

- Fix broken TypeScript types ([#1501])

## 2.23.5

- fix(account-delegation): [UXP-10008] pass the correct logged-in status to header when delegation is active

## 2.23.0

- [UXP-10081] Addresses Hydration issues that are introduced by conditionally introducing new content based on DOM availability ([#1433])

## 2.22.0

- [UXP-10038] Update HCL components with latest major versions ([#1420])

## 2.21.0

- [UXP-9880] Bump `@ux/header-util` to `^12.3.0`

## 2.20.4

- [UXP-9873] fast follow: bump header-util to fix employee initialization and display username

## 2.20.3

- [UXP-9815] Pass preset to header-util to initialize customer as an Employee for internal-header manifest

## 2.20.2

- [UXP-9651] Bump `@ux/header-util` to `^12.1.3` ([#1351])

## 2.20.1

- [UXP-9651] Bump `@ux/header-util` to `^12.1.2`

## 2.20.0

- [UXP-9651] Bump `@ux/header-util` to `^12.1.1`

## 2.19.3

- [UXP-9651] Bump `@ux/header-util` to `^12.0.0` and refactor for new options param in calls of `useCustomerDetails` and `useTraffic` hooks. ([#1346])
- update other dependencies

## 2.19.0

- chore(deps): [UXP-8671] bumps for UXCore2 2301 ([#1298])

## 2.18.0

- chore(deps): bump `@ux/hivemind-provider` to `^1.2.0` ([#1296])
- [FOSS-378] Update react and react-dom to 18 ([#1294])

## 2.17.0

- feature(account-delegation): [UXP-8995] Add ability to opt out of account delegation banner ([#1284])

## 2.15.0

- fix(skip-navigation): [UXP-8814] fix server browser html mis-match
- [FOSS-277] Add optional attributes to SkipNavigation in HCS ([#1273])

## 2.13.0

- Uxcore2 2300 beta to stable ([#1247])

## 2.12.3

- [UXP-8688] Fix double loading of BrowserDeprecationBanner ([#1223])

## 2.12.2

- [UXP-8464] UXcore 2300 upgrade ([#1198])

## 2.12.1

- [UXP-8564] add `componentName` to options to differentiate header mount event from footer ([#1194])

## 2.12.0

- [UXP-8334] Consume new <SkipNavigation/> component in gasket-hcs ([#1062])

## 2.11.3

- upgrade godaddy eslint-config versions ([#882])

## 2.11.2

- [UXP-8344] Bump `@ux/header-util` and deps, add `@ux/header-util` as a peer dep
- [UXP-7665] update components that have UXCore2 2201 upgraded from beta to stable

## 2.9.5

- [UXP-7616] Fix Skip Nav spacing div ([#243])

## 2.9.4

- [UXP-7523] Fix bug where Skip Nav link flashes on page load ([#161])

## 2.9.3

- [SYNTH-829] Add types ([#34])

## 2.9.1

- [UXP-6783] Fix prop types mismatch warning for skip to main

## 2.9.0

- [UXP-6991] Pass hivemind client ([#353])

## 2.8.1

- Added Skip to main readme section

## 2.8.0

- [UXP-6302] Add Skip to Main content ([#308])

## 2.7.0

- [SYNTH-644] Updates to support React 17 ([#324])

##

- [UXP-6552] Bump `@ux/browser-deprecation-banner` to `^10.1.3`

## 2.5.1

- [UXP-6552] Bump `@ux/browser-deprecation-banner` to `^10.1.2` ([#277])

## 2.5.0

- [UXP-6372] Move HCS to single bundle ([#262])

## 2.4.0

- [UXP-6158] Update withManifest method to include additionalHeaderMethods. ([#258])
- Add `mergeProps` global function

## 2.2.2

- Use navigation from page config ([#206]).

## 2.2.0

- Initial rename release.

[Upgrade Guide]: /docs/upgrade-to-7.md
[#34]: https://github.com/gdcorp-uxp/gasket/pull/34
[#161]: https://github.com/gdcorp-uxp/gasket/pull/161
[#243]: https://github.com/gdcorp-uxp/gasket/pull/243
[#882]: https://github.com/gdcorp-uxp/gasket/pull/882
[#1062]: https://github.com/gdcorp-uxp/gasket/pull/1062
[#1194]: https://github.com/gdcorp-uxp/gasket/pull/1194
[#1198]: https://github.com/gdcorp-uxp/gasket/pull/1198
[#1223]: https://github.com/gdcorp-uxp/gasket/pull/1223
[#1247]: https://github.com/gdcorp-uxp/gasket/pull/1247
[#1273]: https://github.com/gdcorp-uxp/gasket/pull/1273
[#1284]: https://github.com/gdcorp-uxp/gasket/pull/1284
[#1294]: https://github.com/gdcorp-uxp/gasket/pull/1294
[#1296]: https://github.com/gdcorp-uxp/gasket/pull/1296
[#1298]: https://github.com/gdcorp-uxp/gasket/pull/1298
[#1346]: https://github.com/gdcorp-uxp/gasket/pull/1346
[#1351]: https://github.com/gdcorp-uxp/gasket/pull/1351
[#1420]: https://github.com/gdcorp-uxp/gasket/pull/1420
[#1433]: https://github.com/gdcorp-uxp/gasket/pull/1433
[#1501]: https://github.com/gdcorp-uxp/gasket/pull/1501
[#1544]: https://github.com/gdcorp-uxp/gasket/pull/1544
[#1577]: https://github.com/gdcorp-uxp/gasket/pull/1577
[UXP-6158]: https://jira.godaddy.com/browse/UXP-6158
[UXP-6372]: https://jira.godaddy.com/browse/UXP-6372
[UXP-6552]: https://jira.godaddy.com/browse/UXP-6552
[UXP-6302]: https://jira.godaddy.com/browse/UXP-6302
[UXP-6783]: https://jira.godaddy.com/browse/UXP-6783
[UXP-6991]: https://jira.godaddy.com/browse/UXP-6991
[UXP-7523]: https://jira.godaddy.com/browse/UXP-7523
[UXP-7616]: https://jira.godaddy.com/browse/UXP-7616
[UXP-7665]: https://jira.godaddy.com/browse/UXP-7665
[UXP-8334]: https://godaddy-corp.atlassian.net/browse/UXP-8334
[UXP-8344]: https://jira.godaddy.com/browse/UXP-8344
[UXP-8464]: https://godaddy-corp.atlassian.net/browse/UXP-8464
[UXP-8564]: https://godaddy-corp.atlassian.net/browse/UXP-8564
[UXP-8671]: https://godaddy-corp.atlassian.net/browse/UXP-8671
[UXP-8814]: https://godaddy-corp.atlassian.net/browse/UXP-8814
[UXP-8995]: https://godaddy-corp.atlassian.net/browse/UXP-8995
[UXP-9815]: https://godaddy-corp.atlassian.net/browse/UXP-9815
[UXP-9873]: https://godaddy-corp.atlassian.net/browse/UXP-9873
[UXP-9880]: https://godaddy-corp.atlassian.net/browse/UXP-9880
[UXP-10038]: https://godaddy-corp.atlassian.net/browse/UXP-10038
[UXP-10081]: https://godaddy-corp.atlassian.net/browse/UXP-10038
[UXP-10008]: https://godaddy-corp.atlassian.net/browse/UXP-10008
[UXP-10287]: https://godaddy-corp.atlassian.net/browse/UXP-10287
[UXP-10441]: https://godaddy-corp.atlassian.net/browse/UXP-10441
[UXP-10704]: https://godaddy-corp.atlassian.net/browse/UXP-10704
[SYNTH-644]: https://jira.godaddy.com/browse/SYNTH-644
[SYNTH-829]: https://jira.godaddy.com/browse/SYNTH-829
[FOSS-277]: https://godaddy-corp.atlassian.net/browse/FOSS-277
[FOSS-378]: https://godaddy-corp.atlassian.net/browse/FOSS-378
