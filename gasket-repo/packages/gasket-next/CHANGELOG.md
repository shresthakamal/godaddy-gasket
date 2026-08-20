# CHANGELOG

## 3.7.6

### Patch Changes

- 38acf72: add jsx-runtime to expose-react

## 3.7.5

### Patch Changes

- b52f485: Add vitest coverage for spaq quality metrics

## 3.7.4

### Patch Changes

- 673903c: Align TypeScript exports with package exports

## 3.7.3

### Patch Changes

- 3815923: Fix peerDep range for next

## 3.7.2

### Patch Changes

- 69efa9c: Update deps

## 3.7.1

### Patch Changes

- dfa21b7: React 19 & NextJS 16

## 3.7.0

### Minor Changes

- 2c4f63d: ESM Port

## 3.6.5

### Patch Changes

- fc8c8f5: Update OTel dependencies, add service environment env var, adjust docs to reference metrics lib
- c114b8c: Fix hydration issues with app router apps
- 59f0ff4: Show how to use intl with app router
- 8eac7cf: Fix await request for makeDynamicLayout

## 3.6.4

### Patch Changes

- fa92eca: Include EXAMPLES.md when publishing

## 3.6.3

### Patch Changes

- 5cdb907: Update `@godaddy/atlas` version with built-in builder caching
- 1889c33: move esm packages to vitest

## 3.6.2

### Patch Changes

- 35ce873: Add examples

## 3.6.1

### Patch Changes

- a72a8fe: Fix generated styles for new webapps

## 3.6.0

### Minor Changes

- 193719b: Switch to Atlas for isRTL

## 3.5.3

### Patch Changes

- fe92d45: Eslint9 upgrade
- Updated dependencies [fe92d45]
  - @godaddy/gasket-auth@3.3.13

## 3.5.2

### Patch Changes

- 1683c58: Revert htmlToReact to not trim by default, but add an option to enable.

## 3.5.1

### Patch Changes

- 93541bd: Use standardized CJS output
- Updated dependencies [93541bd]
  - @godaddy/gasket-auth@3.3.12

## 3.5.0

### Minor Changes

- 2f37840: Upgrade @godaddy/markets backed by Atlas

### Patch Changes

- @godaddy/gasket-auth@3.3.11

## 3.4.2

### Patch Changes

- ee80b8d: Fix to trim scripts injected into layout
- 1b640eb: Upgrade @gasket dependencies
- Updated dependencies [1b640eb]
  - @godaddy/gasket-auth@3.3.10

## 3.4.1

### Patch Changes

- 265ea31: Update workspace dependencies from workspace:\* to workspace:^.
- Updated dependencies [265ea31]
  - @godaddy/gasket-auth@3.3.9

## 3.4.0

### Minor Changes

- c905974: Registering the hivemind experiments with traffic from gasket-next

## 3.3.11

### Patch Changes

- Updated dependencies [d0e2301]
  - @godaddy/gasket-auth@3.3.8

## 3.3.10

### Patch Changes

- b13bc4f: Update @gasket packages, fix type issues
- Updated dependencies [b13bc4f]
  - @godaddy/gasket-auth@3.3.7

## 3.3.9

### Patch Changes

- Updated dependencies [84965c4]
  - @godaddy/gasket-auth@3.3.6

## 3.3.8

### Patch Changes

- 25f18e6: Add CJS transpile to ESM-only packages
- Updated dependencies [25f18e6]
  - @godaddy/gasket-auth@3.3.5

## 3.3.7

### Patch Changes

- df9f4b6: Updated guides to static pages with app router and page router
- 76756b6: Adjust custom Presentation content example
- Updated dependencies [65170e0]
  - @godaddy/gasket-auth@3.3.4

## 3.3.6

### Patch Changes

- 69a3502: Added default properties to the package.json exports.
  - @godaddy/gasket-auth@3.3.3

## 3.3.5

### Patch Changes

- Updated dependencies [fca013d]
  - @godaddy/gasket-auth@3.3.3

## 3.3.4

### Patch Changes

- 159372d: Correctly render trace meta tag

## 3.3.3

### Patch Changes

- 836d079: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [836d079]
  - @godaddy/gasket-auth@3.3.2

## 3.3.2

### Patch Changes

- c8cf75f: Bump next.js version to latest patch to mitigate critical vulnerability.
  - @godaddy/gasket-auth@3.3.1

## 3.3.1

### Patch Changes

- a3d6689: Updates to support using syncpack.
- Updated dependencies [a3d6689]
  - @godaddy/gasket-auth@3.3.1

## 3.3.0

### Minor Changes

- 0b33139: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [0b33139]
  - @godaddy/gasket-auth@3.3.0

## 3.2.2

- Fix TypsScript types ([#1708])

## 3.1.0

- Updates for normalized GasketRequest ([#1642])
- Out of box support for AppRouter ([#1646])

## 3.0.6

- Fix type errors from the nextjs linter ([#1627])

## 3.0.5

- Types updates ([#1621])

## 3.0.2

- Fix Presentation exports and adjust tsconfig to handle export types ([#1583])

## 3.0.0

- See [Upgrade Guide] for overall changes
- Removed Redux dependencies

## 2.35.1

- Fix for retaining plid when other query params are present ([#1491])

## 2.35.0

- [[UXP-9998]] Handle `deferjs=true` with PresentationCentral v3 ([#1446])

## 2.34.2

- Add dynamic route support for secureserver hostname ([#1381])

## 2.33.0

- Support trace id for static pages by writing meta tag from trace cookie ([#1365])

## 2.32.0

- Add `withDeferScripts` HOC ([#1364])

## 2.31.0

- Add `createAppComponent` deprecation warning. ([#1359])

## 2.30.0

- Upgrade html-react-parser to support React 18 peer deps ([#1353])

## 2.28.1

- Fix redundant `config.trfq` and add missing `config.tealium` w/ PC v3 ([#1333]

## 2.28.0

- Render hints from Presentation Central v3 ([#1332])

## 2.27.0

- Upgrade dependencies ([#1328])

## 2.25.0

- [FOSS-378] Update react and react-dom to 18 ([#1294])

## 2.24.3

- Properly export document types with some improvements ([#1283])

## 2.24.2

- Ensure plid is int for build-time pages ([#1281])

## 2.23.0

- Support custom html and body props ([#1267])

## 2.22.5

- Fix incomplete XSS protection measure as documented by [AUTH-13468] ([#1231]).

## 2.19.5

- Fix to include docs dir when publishing ([#911])

## 2.19.4

- upgrade godaddy eslint-config versions ([#882])

## 2.19.0

- Sanitize static regen res.locals ([#673])
- Encode attribute values for tags from manifest ([#634])

## 2.18.2

- Tuneups for version bumps in open source packages ([#569])

## 2.18.0

- Improvements for static page pathing ([#511])
  - `withStaticContent` is a standalone HOC now. Apps can opt-in to static page support.
  - Deprecated `createAppComponent` in favor of new `createApp` which has a simpler API for adjusting options.
  - Added new `VisitorLink` component to ensure `plid` and other key visitor data is passed with page requests for multi-brand apps.
  - Code organization with better separation of document-related parts
- Uplifted the Readme and add Static Pages Guide ([#499])

## 2.16.0

- Tuneup req/res and fetch PC content before rendering gasketData ([#448])

## 2.15.0

- Call Presentation Central for Next.js static pages ([#392])

## 2.14.0

- [PFX-76] Updates to retain plid during client routing ([#289])

## 2.13.0

- [NEX-1189] Add traceid meta tag ([#145])

## 2.12.5

- Make store available to app layout getInitialProps ([#130])

## 2.12.4

- [SYNTH-829] Add types ([#27])

## 2.12.2

- [UXP-7358] Remove duplicate setup script renders from the document ([#356])

## 2.12.1

- Bug fix for XSS for gasket-next/gasket-document.js ([#349])

## 2.12.0

- [UXP-7312] Add hivemind scripts in the render as part of globals for `gasket-document` in `gasket-next`

## 2.11.0

- Default new apps to Next 12 ([#331])

## 2.10.0

- [SYNTH-644] Updates to support React 17 ([#324])

## 2.8.3

- Lock to known working `html-react-parser` ([#337])

## 2.6.0

- Added support for next-redux-wrapper@7 ([#296])

## 2.5.0

- Remove `HeadWithRewrite` for RTL fixes ([#297])

## 2.3.0

- [UXP-5061] Add CSP directives for HCS ([#259])

## 2.2.1

- Upgrade `@godaddy/markets` ([#265])

## 2.2.0

- Update next to version 10.2 ([#238])

## 2.1.4

- Ability to opt-out of intl provider ([#203])
- Fix for getting lang if missing `res.locals.visitor` ([#204])

## 2.1.3

- Get market for language from visitor data ([#197])

## 2.1.1

- Generate CSP directives for inline content ([#181])

## 2.0.3

- Adjust peerDependencies ([#176])

## 2.0.2

- Add main role to app by default ([#175])

## 2.0.0

- [UXP-3750] Updates for latest Next & next-redux-wrapper ([#79])
- Adding withAuthProvider in GasketApp ([#98])
- Apps do not include `withCookies` by default (now opt-in) ([#108])
- No longer passing down `buildId` via page props ([#108])
- 🧪 Opt-out of `getInitialProps` with `createAppComponent` ([#108])
- 🧪 Opt-out of `getInitialProps` on `withPageEnhancers` ([#141])
- Inject GasketData script to document ([#153])

## 1.6.3

- Fix react-intl peer dependency range ([#106])

## 1.6.2

- [UXP-4274] Add the HCS properties to v2 response.

## 1.6.1

- Fix break in RTL support with next@9.5.3 ([#89])

## 1.6.0

- [UXP-2116] Added support for the Hydra V3 RAW response ([#71])

## 1.5.0

- Added web vitals to update rum.webvitals properties from next-rum. ([#67])

## 1.4.0

- Added ability to disable RTL via gasket config ([#64])

## 1.3.0

- [UXP-2831] Add support for rewriting file urls to support RTL CSS files
  when `@godaddy/gasket-plugin-rtl-css` is included

## 1.2.0

- Add render prefetch/preload assets capabilities ([#58])

## 1.1.2

- Update version for `@godaddy/markets` ([#51])

## 1.1.1

- Add missing dependency ([#43])

## 1.1.0

- Add dir attribute to HTML ([#41])

## 1.0.1

- Fix peer dependency version for `@godaddy/gasket-cookies` ([#40])

## 1.0.0

- Initial rename release.

[Upgrade Guide]: /docs/upgrade-to-7.md
[#27]: https://github.com/gdcorp-uxp/gasket/pull/27
[#130]: https://github.com/gdcorp-uxp/gasket/pull/130
[#289]: https://github.com/gdcorp-uxp/gasket/pull/289
[#392]: https://github.com/gdcorp-uxp/gasket/pull/392
[#448]: https://github.com/gdcorp-uxp/gasket/pull/448
[#499]: https://github.com/gdcorp-uxp/gasket/pull/499
[#511]: https://github.com/gdcorp-uxp/gasket/pull/511
[#569]: https://github.com/gdcorp-uxp/gasket/pull/569
[#634]: https://github.com/gdcorp-uxp/gasket/pull/634
[#673]: https://github.com/gdcorp-uxp/gasket/pull/673
[#882]: https://github.com/gdcorp-uxp/gasket/pull/882
[#911]: https://github.com/gdcorp-uxp/gasket/pull/911
[#1231]: https://github.com/gdcorp-uxp/gasket/pull/1231
[#1267]: https://github.com/gdcorp-uxp/gasket/pull/1267
[#1281]: https://github.com/gdcorp-uxp/gasket/pull/1281
[#1283]: https://github.com/gdcorp-uxp/gasket/pull/1283
[#1294]: https://github.com/gdcorp-uxp/gasket/pull/1294
[#1328]: https://github.com/gdcorp-uxp/gasket/pull/1328
[#1332]: https://github.com/gdcorp-uxp/gasket/pull/1332
[#1333]: https://github.com/gdcorp-uxp/gasket/pull/1333
[#1353]: https://github.com/gdcorp-uxp/gasket/pull/1353
[#1359]: https://github.com/gdcorp-uxp/gasket/pull/1359
[#1364]: https://github.com/gdcorp-uxp/gasket/pull/1364
[#1365]: https://github.com/gdcorp-uxp/gasket/pull/1365
[#1381]: https://github.com/gdcorp-uxp/gasket/pull/1381
[#1446]: https://github.com/gdcorp-uxp/gasket/pull/1446
[#1491]: https://github.com/gdcorp-uxp/gasket/pull/1491
[#1583]: https://github.com/gdcorp-uxp/gasket/pull/1583
[#1621]: https://github.com/gdcorp-uxp/gasket/pull/1621
[#1627]: https://github.com/gdcorp-uxp/gasket/pull/1627
[#1642]: https://github.com/gdcorp-uxp/gasket/pull/1642
[#1646]: https://github.com/gdcorp-uxp/gasket/pull/1646
[#1708]: https://github.com/gdcorp-uxp/gasket/pull/1708
[UXP-2831]: https://jira.godaddy.com/browse/UXP-2831
[UXP-2116]: https://jira.godaddy.com/browse/UXP-2116
[UXP-3750]: https://jira.godaddy.com/browse/UXP-3750
[UXP-4274]: https://jira.godaddy.com/browse/UXP-4274
[UXP-5061]: https://jira.godaddy.com/browse/UXP-5061
[UXP-7312]: https://jira.godaddy.com/browse/UXP-7312
[UXP-7358]: https://jira.godaddy.com/browse/UXP-7358
[UXP-9998]: https://jira.godaddy.com/browse/UXP-9998
[SYNTH-644]: https://jira.godaddy.com/browse/SYNTH-644
[SYNTH-829]: https://jira.godaddy.com/browse/SYNTH-829
[AUTH-13468]: https://godaddy-corp.atlassian.net/browse/AUTH-13468
[PFX-76]: https://jira.godaddy.com/browse/PFX-76
[FOSS-378]: https://godaddy-corp.atlassian.net/browse/FOSS-378
