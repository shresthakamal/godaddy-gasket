# CHANGELOG

## 4.14.1

### Patch Changes

- 5f6efeb: Gracefully handle missing WRHS assets: skip asset registration when packages[name] is undefined, and log a warning instead of throwing when a WRHS fetch fails

## 4.14.0

### Minor Changes

- b3bca75: add flag to externalize jsx-runtime for hcs builds

## 4.13.3

### Patch Changes

- 0d271f7: Add configurable chunk exclusions via `hcs.excludeChunks` for default HCS asset registration

## 4.13.2

### Patch Changes

- 274d0e9: Delete unnecessary plugin

## 4.13.1

### Patch Changes

- 3e02d71: Bump @ux/react-bundle and conditionally externalize `react/jsx-runtime` and `react/jsx-dev-runtime` only for React 19+ apps

## 4.13.0

### Minor Changes

- a9fbde8: Remove SSOLinks logic from Gasket-Plugin-HCS, including venture-redirector link overriding and the `usedVentureRedirector` flag.

## 4.12.2

### Patch Changes

- b52f485: Add vitest coverage for spaq quality metrics

## 4.12.1

### Patch Changes

- 7db70ee: bump header-util for x-app-key header

## 4.12.0

### Minor Changes

- 0f3a698: Add tracing and logging for operations happening in gasket-plugin-hcs

## 4.11.3

### Patch Changes

- 985d5ed: bumping react-bundle to return to prior functionality

## 4.11.2

### Patch Changes

- 69efa9c: Update deps

## 4.11.1

### Patch Changes

- 96edfc5: Various template fixes
- 8e08725: Update deps
- 1814392: Pin @ux/react-bundle to known working version

## 4.11.0

### Minor Changes

- 4d5a096: Update @ux/react-bundle to v1.3.0

### Patch Changes

- 36cf824: bump react-bundle for expected client externalize
- dfa21b7: React 19 & NextJS 16

## 4.10.1

### Patch Changes

- 73d4c76: Fix mode in build command

## 4.10.0

### Minor Changes

- 8f92b63: check for venture redirector opt out before hcsProps

## 4.9.0

### Minor Changes

- 2c4f63d: ESM Port

## 4.8.0

### Minor Changes

- 2bfcd6a: Upgrade Uxcore to 2500

## 4.7.0

### Minor Changes

- f915986: port changes from lts to main

## 4.6.3

### Patch Changes

- 85d2c53: feat(hcs-plugin): Header/Footer Replacement Tags in HCS Plugin (CMS-31713)

## 4.6.2

### Patch Changes

- fa92eca: Include EXAMPLES.md when publishing

## 4.6.1

### Patch Changes

- 47db080: fix apps client get all to include market param

## 4.6.0

### Minor Changes

- d512d93: consolidate SSO link configuration for venture redirector

## 4.5.6

### Patch Changes

- 1889c33: move esm packages to vitest

## 4.5.5

### Patch Changes

- 35ce873: Add examples

## 4.5.4

### Patch Changes

- a72a8fe: Fix generated styles for new webapps

## 4.5.3

### Patch Changes

- 193719b: Remove unused markets dependency

## 4.5.2

### Patch Changes

- fe92d45: Eslint9 upgrade

## 4.5.1

### Patch Changes

- ac014b0: Pass params to hcsHints, hcsScripts, hcsCss

## 4.5.0

### Minor Changes

- 2f37840: Upgrade @godaddy/markets backed by Atlas

## 4.4.2

### Patch Changes

- 1b640eb: Upgrade @gasket dependencies

## 4.4.1

### Patch Changes

- 265ea31: Update workspace dependencies from workspace:\* to workspace:^.

## 4.4.0

### Minor Changes

- bc64c3c: include vitest in presets and generated code

## 4.3.7

### Patch Changes

- b13bc4f: Update @gasket packages, fix type issues

## 4.3.6

### Patch Changes

- bf5bccc: Bump deps

## 4.3.5

### Patch Changes

- f3a6892: Fix issues with testing tool

## 4.3.4

### Patch Changes

- e6080b2: fix(vendor): ensure vendor scripts load first

## 4.3.3

### Patch Changes

- f9ca316: type check for plugin imports
- 836d079: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.

## 4.3.2

### Patch Changes

- a3d6689: Updates to support using syncpack.

## 4.3.1

### Patch Changes

- 8c11c94: Use workspace version of gasket-hcs

## 4.3.0

### Minor Changes

- 0b33139: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 4.1.0

- Remove isomorphic-style-loader, bump style-loader version ([#1634])

## 4.0.9

- Tune create hook to add itself as dep and import in the gasket file ([#1632])
- Intl action will be async, adjust timing for create hook, move generated files to capture dirs
- Opt to define flag in HCS plugin for experimental import attributes

## 4.0.7

- Fix default css preload crossorigin to anonymous ([#1615])

## 4.0.6

- Allow optional intl support with fixes for .cjs builds ([#1622])

## 4.0.5

- Add webpack plugin to enable displayName ([#1619])

## 4.0.3

- Merge icon selectors for local/DEV builds ([#1611])

## 4.0.0

- See [Upgrade Guide] for overall changes

## 3.13.1

- Update css build don't set dir ltr attribute ([#1552])

## 3.13.0

- [UXP-10301] HCS opt into out of band cache module for PCS calls ([#1521])

## 3.12.0

- [UXP-10309] Set `crossorigin="anonymous"` for header assets ([#1532])

## 3.11.1

- Use the `@godaddy/cssnano-preset` that inherits the `cssnano-preset-default` settings ([#1546])

## 3.11.0

- Introduce custom cssnano preset to apply PostCSS transformation on a bundle level ([#1544])

## 3.8.5

- chore(upgrade):[UXP-9952] Upgrade to UXcore 2400 ([#1481])

## 3.8.2

- chore(dependencies): [UXP-9743] bump postcss-rtlcss to fix rtl icons ([#1451])

## 3.8.0

- hydrateRoot change re-enabled ([#1452])

## 3.7.4

- Add memoizeHashes option to enable/disable memoization of content hashing to save memory ([#1436])

## 3.7.2

- fix(sass): update prependData to additionalData ([#1428])

## 3.7.1

- Add deprecation notice for `dangerouslyModifyManifest` lifecycle ([#1412])

## 3.7.0

- Remove `@ux/webpack-config` externals and use `@ux/react-bundle` externals ([#1422])

## 3.6.0

- [UXP-9881] wrap loader scripts with GAS async api ([#1404])

## 3.5.0

- [UXP-9856] register default HCS scripts as deferjs when deferjs=true ([#1415])

## 3.4.0

- [UXP-9901] change externals to vendorExternals to externalize react and react-dom and bundle ([#1418])

## 3.3.5

- do not send importer for sass if in devMode - allows us to override components css in webpack of HCS headers ([#1398])

## 3.2.0

- Add css-minimizer-webpack-plugin to reduce CSS file sizes for prod builds ([#1337])

## 3.1.0

- Upgrade dependencies ([#1328])

## 3.0.0

- BREAKING CHANGE (gasket-hcs):[UXP-9338] Add consent manager gtm_privacy
  div ([#1303])

## 2.40.0

- fix(build): [UXP-8089] use deterministic chunkIds to avoid overly long filepaths ([#1297])
- [FOSS-378] Update react and react-dom to 18 ([#1294])

## 2.39.3

- fix(css build): [UXP-8089] remove mini css extract plugin runtime

## 2.39.2

- fix:[AFTERNICCO-2862] Fix extensions array to use .tsx ([#1288])

## 2.36.5

- fix(format): [UXP-8851] Allow format='raw' to yield original raw response from PCS ([#1261])

## 2.36.4

- Update wrhs-publish - remove get object ([#1256])

## 2.36.3

- Revert wrhs-publish to use -a option ([#1255])
- ''

## 2.36.2

- Update wrhs-publish to use --variant option ([#1254])

## 2.36.0

- Allow `_default` variant HCS assets ([#1250])

## 2.35.0

- Uxcore2 2300 beta to stable ([#1247])

## 2.34.5

- [UXP-7941] set -e for wrhs-publish errors ([#1245])

## 2.34.4

- Support devServer settings via webpackConfig lifecycle ([#1244])

## 2.34.0

- [UXP-8464] UXcore 2300 upgrade ([#1198])

## 2.33.0

- [UXP-8334] Consume new <SkipNavigation/> component in gasket-hcs ([#1062])

## 2.32.0

- Add `hcsParams` lifecycle ([#970])

## 2.31.4

- upgrade godaddy eslint-config versions ([#882])

## 2.31.2

- [UXP-8212] remove type module from hydrate script tag ([#745])

## 2.31.1

- [UXP-8089] chunk loading edit to ux.data instead of ux.\_config. ([#714])

## 2.31.0

- [UXP-8089] Allow chunk loading in PCS headers. ([#672])

## 2.30.2

- Removed RTLMarkets and isRTLMarket from build.js ([#521])

## 2.30.1

- [UXP-7798] fix addCss call with correct attribute for css

## 2.30.0

- [UXP-7798] add css from the default bundle to the asset manager
- [UXP-7665] update from UXCore2 2201 beta to stable

## 2.62.4

- [UXP-7455] fix wrhs publish script to release after all locale variants are
  uploaded ([#287])

## 2.26.2

- Remove `inline` and add `allowHosts: all` for webpack-dev-server ([#199])

## 2.26.1

- [UXP-7455] change wrhs-publish script shebang to bash for gasket-plugin-hcs ([#186])

## 2.26.0

- [SYNTH-839] Remove unused lifecycles ([#137])

## 2.25.0

- [UXP-7455] Support locale builds for `wrhs-publish` in gasket-plugin-hcs

## 2.24.3

- [SYNTH-829] Add types ([#34])

## 2.24.0

- [UXP-6991] Pass hivemind client ([#353])

## 2.23.0

- [UXP-6332] expose appconfig to `hcsProps` ([#345])

## 2.22.0

- [UXP-6302] Add Skip to Main content in gasket-hcs. ([#308])

## 2.21.1

- Prevent duplicate `acceptedVariants` in wrhs requests ([#342])

## 2.21.0

- [SYNTH-644] Updates to support React 17 ([#324])

## 2.20.0

- Remove `@ux/webpack-config` method resolve ([#339])

## 2.19.0

- [UXP-7122] add hcs config for skipSSR and not skip SSR for devmode
- [UXP-7023] fix hcs plugin build config to support chunk loading

## 2.18.0

- Upgrade and prefer installed `@ux/webpack-config` ([#332])

## 2.17.0

- fast follow for [UXP-6184] ([#329])
- [UXP-7233] Install correct dependencies ([#325])
- [UXP-6184] default wrhsPackageRequests ([#319])

## 2.14.4

- [UXP-7059] Cleanup wrhs cache data for testing ([#317])

## 2.14.3

- [UXP-6465] Update intl locale hook to set correct locale ([#307])

## 2.13.1

- [UXP-7058] Add default variants for WRHS assets ([#298])

## 2.12.1

- [STGLS-1304] Enable prepend of scripts ([#292])

## 2.12.0

- [UXP-6282] Add TTL for warehouse requests ([#281])

## 2.11.4

- Update immer to address critical vuln in app-sidebar ([#286])

## 2.11.2

- [UXP-6321] Add default env value for WRHS assets ([#278])
- [UXP-6373] migrate hcsScripts to plugin and refactor

## 2.11.0

- [UXP-6373] migrate hcsScripts to plugin and refactor ([#274])

## 2.10.2

- [UXP-6395] return props from hcsProps even when PCS is down

## 2.10.1

- [UXP-6488] Fix chunk loading & webpack manifest generation ([#269])

## 2.10.0

- [UXP-6372] Move HCS to single bundle ([#262])

## 2.9.0

- [UXP-5061] Add CSP directives for HCS ([#259])

## 2.8.1

- Update PCS integration docs ([#264])

## 2.8.0

- [STGLS-719] Update to use the latest `wrhs` and relocate publish script ([#253])

## 2.7.2

- Move requires into lifecycle functions ([#263])

## 2.7.1

- Update to mock the execWaterfallSync method. ([#261])

## 2.7.0

- [UXP-6348] Update PCS config and dependencies in create lifecycle ([#257])

## 2.6.0

- [UXP-6141] Add new `wrhsObjectRequests` ([#250])
  - BREAKING: `wrhsAssets` lifecycle removed

## 2.5.0

- [UXP-5524] check PCS_HOST for pcsUrl ([#252])

## 2.3.3

- Small tweak to use only chunks that are true for isChunk and false for
  isInitial.

## 2.3.2

- make webpack-manifest-plugin a direct dependency

## 2.3.1

- [UXP-5562] Use webpack-manifest-plugin
- [UXP-5805] Support Webpack chunks async loading

## 2.3.0

- [UXP-5575] **BREAKING:** Load props via new async `hcsProps` lifecycle, remove
  `props.js` support
  - See [README](./README.md) for usage instructions

## 2.2.2

- Load webpack mode from `@ux/webpack-config` helper, enable source-maps
  ([#210])

## 2.2.1

- [#208] Add `target: 'node'` back

## 2.2.0

- Move HCS React components to [@godaddy/gasket-hcs] and add during create
  ([#202])
- [STGLS-331] Externalize node modules ([#199])
- Expose url on 404 ([#198])

## 2.1.4

- [UXP-5316] Pass through `requestedHeader` ([#186])

## 2.1.3

- Added `wrhsAssets` lifecycle and pass results to hcs lifecycles ([#189])

## 2.0.3

- [[UXP-5319]] Use locales map for hcs plugin ([#180])

## 2.0.2

- Adjust peerDependencies ([#176])

## 2.0.1

- Upgrade `@ux` dependencies ([#169])

## 2.0.0

- Update `@gasket` packages and align dependency versions

## 0.2.0

- Enable intl ([#147])
- [UXP-4944] bump `@ux/header-util` to `9.2.1` in `gasket-hcs-plugin` ([#150])

## 0.1.6

- [PCX-613] Create `dangerouslyModifyManifest` lifecycle ([#140])

## 0.1.5

- Upgrade account-delegation to latest ([#123])

## 0.1.4

- [PCX-426] Rendering `<AccountDelegation />` only if we have a customer
  instance ([#131])

## 0.1.1

- [UXP-2734] Lazy load browser-deprecation-banner
  - Use `react-test-renderer@16` with `react@16`

## 0.1.0

- [PCXSPA-222] Make assetManager.merge an immutable operation ([#118])
- [UXP-4336] Merge custom HCS and default PCS props before rendering ([#107])

[Upgrade Guide]: /docs/upgrade-to-7.md
[#34]: https://github.com/gdcorp-uxp/gasket/pull/34
[#137]: https://github.com/gdcorp-uxp/gasket/pull/137
[#186]: https://github.com/gdcorp-uxp/gasket/pull/186
[#199]: https://github.com/gdcorp-uxp/gasket/pull/199
[#287]: https://github.com/gdcorp-uxp/gasket/pull/287
[#521]: https://github.com/gdcorp-uxp/gasket/pull/521
[#672]: https://github.com/gdcorp-uxp/gasket/pull/672
[#714]: https://github.com/gdcorp-uxp/gasket/pull/714
[#745]: https://github.com/gdcorp-uxp/gasket/pull/745
[#882]: https://github.com/gdcorp-uxp/gasket/pull/882
[#970]: https://github.com/gdcorp-uxp/gasket/pull/970
[#1062]: https://github.com/gdcorp-uxp/gasket/pull/1062
[#1198]: https://github.com/gdcorp-uxp/gasket/pull/1198
[#1244]: https://github.com/gdcorp-uxp/gasket/pull/1244
[#1245]: https://github.com/gdcorp-uxp/gasket/pull/1245
[#1247]: https://github.com/gdcorp-uxp/gasket/pull/1247
[#1250]: https://github.com/gdcorp-uxp/gasket/pull/1250
[#1254]: https://github.com/gdcorp-uxp/gasket/pull/1254
[#1255]: https://github.com/gdcorp-uxp/gasket/pull/1255
[#1256]: https://github.com/gdcorp-uxp/gasket/pull/1256
[#1261]: https://github.com/gdcorp-uxp/gasket/pull/1261
[#1288]: https://github.com/gdcorp-uxp/gasket/pull/1288
[#1294]: https://github.com/gdcorp-uxp/gasket/pull/1294
[#1297]: https://github.com/gdcorp-uxp/gasket/pull/1297
[#1303]: https://github.com/gdcorp-uxp/gasket/pull/1303
[#1328]: https://github.com/gdcorp-uxp/gasket/pull/1328
[#1337]: https://github.com/gdcorp-uxp/gasket/pull/1337
[#1398]: https://github.com/gdcorp-uxp/gasket/pull/1398
[#1404]: https://github.com/gdcorp-uxp/gasket/pull/1404
[#1412]: https://github.com/gdcorp-uxp/gasket/pull/1412
[#1415]: https://github.com/gdcorp-uxp/gasket/pull/1415
[#1418]: https://github.com/gdcorp-uxp/gasket/pull/1418
[#1422]: https://github.com/gdcorp-uxp/gasket/pull/1422
[#1428]: https://github.com/gdcorp-uxp/gasket/pull/1428
[#1436]: https://github.com/gdcorp-uxp/gasket/pull/1436
[#1452]: https://github.com/gdcorp-uxp/gasket/pull/1452
[#1451]: https://github.com/gdcorp-uxp/gasket/pull/1451
[#1481]: https://github.com/gdcorp-uxp/gasket/pull/1481
[#1521]: https://github.com/gdcorp-uxp/gasket/pull/1521
[#1544]: https://github.com/gdcorp-uxp/gasket/pull/1544
[#1546]: https://github.com/gdcorp-uxp/gasket/pull/1546
[#1532]: https://github.com/gdcorp-uxp/gasket/pull/1532
[#1552]: https://github.com/gdcorp-uxp/gasket/pull/1552
[#1611]: https://github.com/gdcorp-uxp/gasket/pull/1611
[#1615]: https://github.com/gdcorp-uxp/gasket/pull/1615
[#1619]: https://github.com/gdcorp-uxp/gasket/pull/1619
[#1622]: https://github.com/gdcorp-uxp/gasket/pull/1622
[#1632]: https://github.com/gdcorp-uxp/gasket/pull/1632
[#1634]: https://github.com/gdcorp-uxp/gasket/pull/1634
[PCXSPA-222]: https://jira.godaddy.com/browse/PCXSPA-222
[PCX-426]: https://jira.godaddy.com/browse/PCX-426
[PCX-613]: https://jira.godaddy.com/browse/PCX-613
[UXP-2734]: https://jira.godaddy.com/browse/UXP-2734
[UXP-4336]: https://jira.godaddy.com/browse/UXP-4336
[UXP-4944]: https://jira.godaddy.com/browse/UXP-4944
[UXP-5316]: https://jira.godaddy.com/browse/UXP-5316
[UXP-5319]: https://jira.godaddy.com/browse/UXP-5319
[UXP-5562]: https://jira.godaddy.com/browse/UXP-5562
[UXP-5575]: https://jira.godaddy.com/browse/UXP-5575
[UXP-5805]: https://jira.godaddy.com/browse/UXP-5805
[UXP-6141]: https://jira.godaddy.com/browse/UXP-6141
[UXP-5524]: https://jira.godaddy.com/browse/UXP-5524
[UXP-6348]: https://jira.godaddy.com/browse/UXP-6348
[UXP-5061]: https://jira.godaddy.com/browse/UXP-5061
[UXP-6184]: https://jira.godaddy.com/browse/UXP-6184
[UXP-6282]: https://jira.godaddy.com/browse/UXP-6282
[UXP-6302]: https://jira.godaddy.com/browse/UXP-6302
[UXP-6321]: https://jira.godaddy.com/browse/UXP-6321
[UXP-6332]: https://jira.godaddy.com/browse/UXP-6332
[UXP-6372]: https://jira.godaddy.com/browse/UXP-6372
[UXP-6373]: https://jira.godaddy.com/browse/UXP-6373
[UXP-6395]: https://jira.godaddy.com/browse/UXP-6395
[UXP-6488]: https://jira.godaddy.com/browse/UXP-6488
[UXP-6465]: https://jira.godaddy.com/browse/UXP-6465
[UXP-6991]: https://jira.godaddy.com/browse/UXP-6991
[UXP-7023]: https://jira.godaddy.com/browse/UXP-7023
[UXP-7058]: https://jira.godaddy.com/browse/UXP-7058
[UXP-7059]: https://jira.godaddy.com/browse/UXP-7059
[UXP-7122]: https://jira.godaddy.com/browse/UXP-7122
[UXP-7233]: https://jira.godaddy.com/browse/UXP-7233
[UXP-7455]: https://jira.godaddy.com/browse/UXP-7455
[UXP-7665]: https://jira.godaddy.com/browse/UXP-7665
[UXP-7798]: https://jira.godaddy.com/browse/UXP-7798
[UXP-7941]: https://godaddy-corp.atlassian.net/browse/UXP-7941
[UXP-8089]: https://godaddy-corp.atlassian.net/browse/UXP-8089
[UXP-8212]: https://jira.godaddy.com/browse/UXP-8212
[UXP-8464]: https://godaddy-corp.atlassian.net/browse/UXP-8464
[UXP-8851]: https://godaddy-corp.atlassian.net/browse/UXP-8851
[UXP-9338]: https://godaddy-corp.atlassian.net/browse/UXP-9338
[UXP-9743]: https://godaddy-corp.atlassian.net/browse/UXP-9743
[UXP-9856]: https://godaddy-corp.atlassian.net/browse/UXP-9856
[UXP-9881]: https://godaddy-corp.atlassian.net/browse/UXP-9881
[UXP-9901]: https://godaddy-corp.atlassian.net/browse/UXP-9901
[UXP-9952]: https://godaddy-corp.atlassian.net/browse/UXP-9952
[UXP-10301]: https://godaddy-corp.atlassian.net/browse/UXP-10301
[UXP-10309]: https://godaddy-corp.atlassian.net/browse/UXP-10309
[STGLS-331]: https://jira.godaddy.com/browse/STGLS-331
[STGLS-719]: https://jira.godaddy.com/browse/STGLS-719
[STGLS-1304]: https://jira.godaddy.com/browse/STGLS-1304
[SYNTH-644]: https://jira.godaddy.com/browse/SYNTH-644
[SYNTH-829]: https://jira.godaddy.com/browse/SYNTH-829
[SYNTH-839]: https://jira.godaddy.com/browse/SYNTH-839
[AFTERNICCO-2862]: https://godaddy-corp.atlassian.net/browse/AFTERNICCO-2862
[@godaddy/gasket-hcs]: /packages/gasket-hcs/README.md
[FOSS-378]: https://godaddy-corp.atlassian.net/browse/FOSS-378
