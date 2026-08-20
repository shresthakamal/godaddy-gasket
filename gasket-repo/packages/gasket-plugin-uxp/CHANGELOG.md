# CHANGELOG

## 3.12.0

### Minor Changes

- cc53b28: Add opt-in Turbopack support gated on `gasket.config.turbopack` (set via
  `makeGasket({ turbopack: true })`). When enabled, this plugin's `nextConfig`
  hook adds `@godaddy/gasket-plugin-uxp` and `@ux/presentation-central` to
  Next.js `serverExternalPackages` — mirroring the externalization applied on
  the Webpack side.

## 3.11.0

### Minor Changes

- 10f4e3b: Adding hivemind experimentation to gasket-plugin-uxp

## 3.10.0

### Minor Changes

- 48c0e24: Allow `url` and `env` to be set on `params` in the `presentationCentral` lifecycle hook to override the PC request target per-request. Previously these values were forwarded to the API as query parameters (where the client ignored them for routing). Now they are extracted from `params` and passed as top-level options to `client.request()`, which the `@ux/presentation-central` client already supports. This lets hook handlers redirect a single request to a different environment or a locally-running service without creating a fresh client instance.

## 3.9.0

### Minor Changes

- 3e02d71: Bump @ux/react-bundle and conditionally externalize `react/jsx-runtime` and `react/jsx-dev-runtime` only for React 19+ apps

## 3.8.0

### Minor Changes

- ed933c1: feat(gasket-plugin-uxp): add nextConfig hook to transpile @godaddy/antares

## 3.7.5

### Patch Changes

- 55d6bd8: Fix non-normalization of explicitly provided environment name

## 3.7.4

### Patch Changes

- 673903c: Align TypeScript exports with package exports

## 3.7.3

### Patch Changes

- 985d5ed: bumping react-bundle to return to prior functionality

## 3.7.2

### Patch Changes

- f63ec36: Pass the currency value from gasket plugin to hydra

## 3.7.1

### Patch Changes

- 8e08725: Update deps
- 8598552: Fixing types for hooks
- 1814392: Pin @ux/react-bundle to known working version

## 3.7.0

### Minor Changes

- 4d5a096: Update @ux/react-bundle to v1.3.0

### Patch Changes

- 36cf824: bump react-bundle for expected client externalize
- dfa21b7: React 19 & NextJS 16

## 3.6.0

### Minor Changes

- 2c4f63d: ESM Port

### Patch Changes

- Updated dependencies [2c4f63d]
  - @godaddy/gasket-private-labels@3.4.0

## 3.5.2

### Patch Changes

- ec3674c: Fix type issues with pages router
- fa92eca: Include EXAMPLES.md when publishing
- Updated dependencies [fa92eca]
  - @godaddy/gasket-private-labels@3.3.7

## 3.5.1

### Patch Changes

- 1889c33: move esm packages to vitest
- Updated dependencies [1889c33]
  - @godaddy/gasket-private-labels@3.3.6

## 3.5.0

### Minor Changes

- 2a53f24: Use plid 3153 when missing for secureserver.net

## 3.4.6

### Patch Changes

- 227451d: Add tsnocheck to index tsx file
- 35ce873: Add examples
- Updated dependencies [35ce873]
  - @godaddy/gasket-private-labels@3.3.5

## 3.4.5

### Patch Changes

- e9d9770: Fix lint errors on generated files

## 3.4.4

### Patch Changes

- a72a8fe: Fix generated styles for new webapps
- Updated dependencies [a72a8fe]
  - @godaddy/gasket-private-labels@3.3.4

## 3.4.3

### Patch Changes

- fe92d45: Eslint9 upgrade
- 01fcdff: Fix linter errors in generated files
- Updated dependencies [fe92d45]
  - @godaddy/gasket-private-labels@3.3.3

## 3.4.2

### Patch Changes

- 1b640eb: Upgrade @gasket dependencies

## 3.4.1

### Patch Changes

- 265ea31: Update workspace dependencies from workspace:\* to workspace:^.
- 4423b9f: Externalize the plugin for server bundles

## 3.4.0

### Minor Changes

- bc64c3c: include vitest in presets and generated code

## 3.3.9

### Patch Changes

- b13bc4f: Update @gasket packages, fix type issues

## 3.3.8

### Patch Changes

- bf5bccc: Bump deps

## 3.3.7

### Patch Changes

- f3a6892: Fix issues with testing tool

## 3.3.6

### Patch Changes

- ea6d994: Create with nextRouting disabled

## 3.3.5

### Patch Changes

- 69a3502: Added updated jest test files to the generator/ which use the correct filepath to IndexPage.

## 3.3.4

### Patch Changes

- 532c1c2: force next version in uxp plugin
- 9d5958b: Overwrite reactIntlPkg in CreateContext to @godaddy/react-mintl to be used by templates.

## 3.3.3

### Patch Changes

- 836d079: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [836d079]
  - @godaddy/gasket-private-labels@3.3.2

## 3.3.2

### Patch Changes

- c8cf75f: Bump next.js version to latest patch to mitigate critical vulnerability.

## 3.3.1

### Patch Changes

- a3d6689: Updates to support using syncpack.
- Updated dependencies [a3d6689]
  - @godaddy/gasket-private-labels@3.3.1

## 3.3.0

### Minor Changes

- 0b33139: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [0b33139]
  - @godaddy/gasket-private-labels@3.3.0

## 3.2.6

- Updated generated root page and middleware to handle root page ([#1713])

## 3.2.5

- Replace react-intl with react-mintl ([#1699])

## 3.2.3

- Create a `/healthcheck` for apps using Next.js default server ([#1695])

## 3.1.1

- Adjust uxcore PCParam type ([#1656])

## 3.1.0

- Updates for normalized GasketRequest ([#1642])
- Out of box support for AppRouter ([#1646], [#1650])

## 3.0.9

- Fix type errors from the nextjs linter ([#1627])

## 3.0.8

- add missing devDep not being adding to the ending applications. ([#1626])

## 3.0.7

- Introduce the `@godaddy/postcss-merge-selectors` plugin to the PostCSS config ([#1605])

## 3.0.3

- Fix generated index page examples ([#1600])

## 3.0.0

- See [Upgrade Guide] for overall changes
- Remove Linara plugin ([#1483])
- Drop middleware lifecycle and add Action docs ([#1476])
- Add App Router scaffolding ([#1466])
- Add `getPresentationCentral` action ([#1423])
- Added prompt and support for using Redux ([#1377])

- [[UXP-9698]] Allow setting stuntDouble from middleware and gasket config

## 2.44.3

- [[UXP-9698]] Allow setting stuntDouble from middleware and gasket config ([#1568])
- Fix to add default value for `contextUxp` ([#1525])

## 2.42.0

- [[UXP-9998]] Handle `deferjs=true` with PresentationCentral v3 ([#1446])

## 2.41.1

- Fix to remove unused build functions ([#1429])

## 2.41.0

- Remove `@ux/webpack-config` externals and use `@ux/react-bundle` externals ([#1422])

## 2.40.0

- Add `presentationCentral.memoryCacheMax` config option ([#1410])

## 2.39.1

- Fix styles import for jest tests ([#1378])

## 2.38.0

- [BUILD-904] Enable partners header for all markets ([#1344])

## 2.37.1

- Import missing styles for the pivot component in generated page for new apps ([#1338])

## 2.37.0

- Upgrade dependencies ([#1328])
- Update UXCore docs url ([#1329])

## 2.36.3

- Fix to use correct @godaddy/gasket-next range ([#1326])

## 2.36.2

- Merge cache param to request options if set ([#1321])

## 2.36.1

- Set `privateLabelId` for v3 client ([#1319])

## 2.36.0

- [PCXPLA-1504] Enable app-sidebar for partners header ([#1302])

## 2.35.0

- [FOSS-378] Update react and react-dom to 18 ([#1294])

## 2.34.0

- Upgrade dependency with node 20 compatibility issue ([#1285])

## 2.33.0

- Support context answers for prompts ([#1269])

## 2.32.0

- Support es-US for partners header ([#1280])

## 2.31.0

- Upgrade to latest browserslist config

## 2.30.12

- Fix types for the `headerContent` hook ([#1257])

## 2.30.10

- Add missing `semver` dependency ([#1249])

## 2.30.6

- Increase log level for `presentationCentral` failures ([#1232])
- Fix to not generate UXP sw cache key when presentation central is disabled
  ([#1236])

## 2.30.4

- Remove log for partners-header being used ([#1221])

## 2.29.2

- Lock `@testing-library/react` version to v12 ([#1207])

## 2.28.0

- Lazy install dev-tool certs for local env ([#988])

## 2.27.1

- Fix for missing dependencies ([#1170])

## 2.27.0

- Use @godaddy/gasket-private-labels ([#1063])

## 2.26.10

- upgrade godaddy eslint-config versions ([#882])

## 2.26.3

- Tuneups for version bumps in open source packages ([#569])

## 2.26.2

- [PFX-339] Manage `@ux/webpack-config` versions at the app level ([#522])

## 2.25.1

- Add `uxcore` param on create and default at latest version

## 2.25.0

- Update UXCore2 dependencies and move to direct component import on create
- Stop using a deprecated icon on the generated starter homepage

## 2.24.2

- Expand TypeScript config definition to include `uxcore` parameter ([#413])

## 2.24.0

- Support for calling Presentation Central for Next.js static pages ([#392])
- Soft deprecate `palleteId` in favor of `theme` param ([#138])

## 2.22.1

- Fix ignore checks for @ux/\* packages < 1000 ([#91])

## 2.22.0

- [SYNTH-796] Version Check UX Components ([#11])

## 2.21.4

- Add TypeScript types ([#3], [#8])

## 2.21.3

- Fix next dependency check during create command ([#359])

## 2.21.2

- Do not scaffold Next contents for apps not using next dependency ([#357])

## 2.21.1

- [SYNTH-795] Fix for problematic `npm outdated` with `npm@7|8` ([#354])

## 2.21.0

- [SYNTH-41] Add headerContent lifecycle ([#350])

## 2.19.0

- Default new apps to Next 12 ([#331])
- No longer need to force eslint version ([#343])

## 2.18.0

- [SYNTH-644] Updates to support React 17 ([#324])

## 2.16.1

- Fix outdated check handling ([#336])

## 2.16.0

- [SYNTH-612] Graceful UXCore2 version check ([#333])
  - Fix incorrect warning when version is current

## 2.15.0

- Upgrade `@ux/webpack-config` ([#332])
- Auto-set the build exit flag for Next 12 ([#330])
- Create with and prefer installed `@ux/webpack-config` ([#328])

## 2.14.0

- [SYNTH-607] Use webpack-config hook and tweaks for next 12 ([#326])
  - Deprecate static assets guide

## 2.13.0

- [SYNTH-606] Generate PostCSS config for RTL support ([#322])

## 2.11.0

- [SYNTH-551] Create with postcss as dev dep ([#315])

## 2.10.5

- [SYNTH-594] Restrict to use eslint v7 ([#312])

## 2.10.3

- Restrict to use nextjs v10 ([#309])

## 2.7.1

- Fixed sni defaults for local ([#267])

## 2.7.0

- [UXP-5061] Add CSP directives for HCS ([#259])

## 2.4.0

- Add http2 support ([#247])

## 2.3.1

- Remove constraint that middleware must before after redux ([#239])

## 2.2.0

- Added next.js telemetry opt-out ([#218])

## 2.1.6

- `nextConfig` bug fix ([#207])

## 2.1.3

- Prioritize app-level `@ux/webpack-config` for user-selected version ([#190])

## 2.1.1

- Added missing Linaria dep

## 2.1.0

- Added prompt and support for using Linaria ([#179])

## 2.0.7

- Support for reading `idp_info.segopts` to modify theme ([#177])
  - With `godaddy-pxpro` and `godaddy-pxpro-dark` themes

## 2.0.6

- Force `react@16` and `react-dom@16` for alignment with UXCore2 ([#176])

## 2.0.4

- Expose utils in `package.json` exports

## 2.0.3

- Add module metadata for `@godaddy/gasket-next` ([#171])

## 2.0.2

- Do not generate custom postcss config ([#168])
- Upgrade `@ux` dependencies ([#169])

## 2.0.1

- [UXP-3310] Changes for Next.js built-in SCSS ([#75])
- No longer install and configure @godaddy/gasket-cookies by default ([#108])
- [STGLS-130] Normalize plid as number ([#138 archived])
- Generate GoLF manifest at repo root and expect `public/locales/*` ([#157])
- Generate with initialProps for withLocaleRequired ([#163])
- Update `presentationCentral` lifecycle to pass context with `req` + `res`
  ([#126])

## 1.11.1

- [PCX-619] Include all english markets in getting Partners Header override
  sidebar ([#148])

## 1.11.0

- [PCXSPA-19] Force the `partners-header` if opted in ([#115])

## 1.10.0

- upgrade @ux/webpack-config to v2001 ([#96])

## 1.9.2

- Pass registry to npm for uxcore2 version check ([#92])

## 1.9.0

- [UXP-366] Added warning/check for outdated uxcore2 versions. ([#86])

## 1.8.0

- Added prompt for service id and addition to package.json scripts. ([#83])

## 1.7.4

- Fix bug where \* from the accept-language header was being used for the market

## 1.7.3

- Expose getMarket for sharable consumption ([#77])

## 1.7.2

- Get intl market from market id header if exist ([#70])
  - Set `req.market` based on header/cookie

## 1.7.1

- Update to get the market from the request header X-Market-Id if exists ([#69])

## 1.7.0

- Added web vitals to update rum.webvitals properties from next-rum. ([#67])

## 1.6.0

- [UXP-388] Added ability to consume zones gasket config ([#63])

## 1.5.0

- Added ability to disable RTL via gasket config ([#64])

## 1.4.2

- Update `react-intl` version and remove unneeded addLocaleData method calls.
  ([#59])

## 1.4.1

- Add browserslist-config-godaddy to provide standard browser support configs
  ([#49])

## 1.3.0

- Make dark theme opt-in for `*gdcorp.tools` domains ([#46])

## 1.2.4

- Add additional QA locales to generated `/pages/_app.js` ([#42])

## 1.2.1

- Export Presentation class for extending ([#38])

## 1.2.0

- [UXP-2040] Properly parse out market from header when first market has a
  q-value ([#35])
- Default PC app if not specified ([#34])
- [UXP-1876] Properly destructure and log PC client errors. ([#30])
- Support opt-in to Hydra `V3` ([#26])

## 1.1.0

- Attach plid to req ([#28])

## 1.0.2

- Force set react-intl version to v2 ([#25])

## 1.0.1

- Update to `@ux/webpack-plugin@11.0.0` to support `sass-loader@8` ([#23]).
- Correct created dependency versions ([#22]).

## 1.0.0

- Initial rename release.

[Upgrade Guide]: /docs/upgrade-to-7.md
[#3]: https://github.com/gdcorp-uxp/gasket/pull/3
[#8]: https://github.com/gdcorp-uxp/gasket/pull/8
[#11]: https://github.com/gdcorp-uxp/gasket/pull/11
[#91]: https://github.com/gdcorp-uxp/gasket/pull/91
[#392]: https://github.com/gdcorp-uxp/gasket/pull/392
[#138]: https://github.com/gdcorp-uxp/gasket/pull/138
[#413]: https://github.com/gdcorp-uxp/gasket/pull/413
[#522]: https://github.com/gdcorp-uxp/gasket/pull/522
[#569]: https://github.com/gdcorp-uxp/gasket/pull/569
[#882]: https://github.com/gdcorp-uxp/gasket/pull/882
[#988]: https://github.com/gdcorp-uxp/gasket/pull/988
[#1063]: https://github.com/gdcorp-uxp/gasket/pull/1063
[#1170]: https://github.com/gdcorp-uxp/gasket/pull/1170
[#1207]: https://github.com/gdcorp-uxp/gasket/pull/1207
[#1221]: https://github.com/gdcorp-uxp/gasket/pull/1221
[#1232]: https://github.com/gdcorp-uxp/gasket/pull/1232
[#1236]: https://github.com/gdcorp-uxp/gasket/pull/1236
[#1249]: https://github.com/gdcorp-uxp/gasket/pull/1249
[#1257]: https://github.com/gdcorp-uxp/gasket/pull/1257
[#1269]: https://github.com/gdcorp-uxp/gasket/pull/1269
[#1280]: https://github.com/gdcorp-uxp/gasket/pull/1280
[#1285]: https://github.com/gdcorp-uxp/gasket/pull/1285
[#1294]: https://github.com/gdcorp-uxp/gasket/pull/1294
[#1302]: https://github.com/gdcorp-uxp/gasket/pull/1302
[#1319]: https://github.com/gdcorp-uxp/gasket/pull/1319
[#1321]: https://github.com/gdcorp-uxp/gasket/pull/1321
[#1326]: https://github.com/gdcorp-uxp/gasket/pull/1326
[#1328]: https://github.com/gdcorp-uxp/gasket/pull/1328
[#1329]: https://github.com/gdcorp-uxp/gasket/pull/1329
[#1338]: https://github.com/gdcorp-uxp/gasket/pull/1338
[#1377]: https://github.com/gdcorp-uxp/gasket/pull/1377
[#1378]: https://github.com/gdcorp-uxp/gasket/pull/1378
[#1410]: https://github.com/gdcorp-uxp/gasket/pull/1410
[#1422]: https://github.com/gdcorp-uxp/gasket/pull/1422
[#1423]: https://github.com/gdcorp-uxp/gasket/pull/1423
[#1429]: https://github.com/gdcorp-uxp/gasket/pull/1429
[#1446]: https://github.com/gdcorp-uxp/gasket/pull/1446
[#1466]: https://github.com/gdcorp-uxp/gasket/pull/1466
[#1476]: https://github.com/gdcorp-uxp/gasket/pull/1476
[#1483]: https://github.com/gdcorp-uxp/gasket/pull/1483
[#1525]: https://github.com/gdcorp-uxp/gasket/pull/1525
[#1568]: https://github.com/gdcorp-uxp/gasket/pull/1568
[#1600]: https://github.com/gdcorp-uxp/gasket/pull/1600
[#1605]: https://github.com/gdcorp-uxp/gasket/pull/1605
[#1626]: https://github.com/gdcorp-uxp/gasket/pull/1626
[#1627]: https://github.com/gdcorp-uxp/gasket/pull/1627
[#1642]: https://github.com/gdcorp-uxp/gasket/pull/1642
[#1646]: https://github.com/gdcorp-uxp/gasket/pull/1646
[#1650]: https://github.com/gdcorp-uxp/gasket/pull/1650
[#1656]: https://github.com/gdcorp-uxp/gasket/pull/1656
[#1695]: https://github.com/gdcorp-uxp/gasket/pull/1695
[#1699]: https://github.com/gdcorp-uxp/gasket/pull/1699
[#1713]: https://github.com/gdcorp-uxp/gasket/pull/1713
[UXP-1876]: https://jira.godaddy.com/browse/UXP-1876
[UXP-2040]: https://jira.godaddy.com/browse/UXP-2040
[UXP-388]: https://jira.godaddy.com/browse/UXP-388
[UXP-366]: https://jira.godaddy.com/browse/UXP-366
[UXP-3310]: https://jira.godaddy.com/browse/UXP-3310
[UXP-9698]: https://jira.godaddy.com/browse/UXP-9698
[UXP-9998]: https://jira.godaddy.com/browse/UXP-9998
[PCXSPA-19]: https://jira.godaddy.com/browse/PCXSPA-19
[PCX-619]: https://jira.godaddy.com/browse/PCX-619
[STGLS-130]: https://jira.godaddy.com/browse/STGLS-130
[UXP-5061]: https://jira.godaddy.com/browse/UXP-5061
[SYNTH-594]: https://jira.godaddy.com/browse/SYNTH-594
[SYNTH-551]: https://jira.godaddy.com/browse/SYNTH-551
[SYNTH-606]: https://jira.godaddy.com/browse/SYNTH-606
[SYNTH-607]: https://jira.godaddy.com/browse/SYNTH-607
[SYNTH-612]: https://jira.godaddy.com/browse/SYNTH-612
[SYNTH-644]: https://jira.godaddy.com/browse/SYNTH-644
[SYNTH-41]: https://jira.godaddy.com/browse/SYNTH-41
[SYNTH-795]: https://jira.godaddy.com/browse/SYNTH-795
[SYNTH-796]: https://jira.godaddy.com/browse/SYNTH-796
[PFX-339]: https://jira.godaddy.com/browse/PFX-339
[FOSS-378]: https://godaddy-corp.atlassian.net/browse/FOSS-378
[PCXPLA-1504]: https://godaddy-corp.atlassian.net/browse/PCXPLA-1504
[BUILD-904]: https://godaddy-corp.atlassian.net/browse/BUILD-904
