# CHANGELOG

## 3.10.0

### Minor Changes

- 752b966: Add configurable resolver priority

## 3.9.0

### Minor Changes

- 3e2d457: Include host with port in visitor object

## 3.8.1

### Patch Changes

- 2f8494a: Fix plid and currency are guaranteed

## 3.8.0

### Minor Changes

- 68f6c73: Cookie takes priority over header for market and currency resolution. Added missing early-return guard to `assignCurrencyFromHeaders`.

## 3.7.2

### Patch Changes

- d4ea10b: additional param check for visitor plid assignment

## 3.7.1

### Patch Changes

- e99b477: Remove port suffixes from forwarded host headers when assigning to `visitor.hostname`

## 3.7.0

### Minor Changes

- 2c4f63d: ESM Port

## 3.6.3

### Patch Changes

- 7edcf3b: Add X-Visitor-Id header support with cookie fallback for getting visitorId

## 3.6.2

### Patch Changes

- fa92eca: Include EXAMPLES.md when publishing

## 3.6.1

### Patch Changes

- 5cdb907: Update `@godaddy/atlas` version with built-in builder caching
- 1889c33: move esm packages to vitest

## 3.6.0

### Minor Changes

- 5179927: Fallback to NoBrand plid when missing for secureserver.net or unknown brand

## 3.5.4

### Patch Changes

- 35ce873: Add examples

## 3.5.3

### Patch Changes

- be4e825: Add atlas plugin

## 3.5.2

### Patch Changes

- ddeabfb: Fix to skip brand plid check for secureserver.net

## 3.5.1

### Patch Changes

- a72a8fe: Fix generated styles for new webapps

## 3.5.0

### Minor Changes

- 193719b: Switch to Atlas; Add visitor property source debug output

## 3.4.2

### Patch Changes

- fe92d45: Eslint9 upgrade
- Updated dependencies [fe92d45]
  - @godaddy/gasket-private-labels@3.3.3

## 3.4.1

### Patch Changes

- 0468e8f: Handle cases where language is not a string

## 3.4.0

### Minor Changes

- 2f37840: Upgrade @godaddy/markets backed by Atlas

## 3.3.6

### Patch Changes

- 1b640eb: Upgrade @gasket dependencies

## 3.3.5

### Patch Changes

- 265ea31: Update workspace dependencies from workspace:\* to workspace:^.

## 3.3.4

### Patch Changes

- b13bc4f: Update @gasket packages, fix type issues

## 3.3.3

### Patch Changes

- 836d079: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [836d079]
  - @godaddy/gasket-private-labels@3.3.2

## 3.3.2

### Patch Changes

- a3d6689: Updates to support using syncpack.
- Updated dependencies [a3d6689]
  - @godaddy/gasket-private-labels@3.3.1

## 3.3.1

### Patch Changes

- ff929e5: Fix to use same locale resolve fallbacks as intlManager

## 3.3.0

### Minor Changes

- 0b33139: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [0b33139]
  - @godaddy/gasket-private-labels@3.3.0

## 3.1.1

- Replace `@hapi/accept` package with `negotiator` ([#1661])

## 3.1.0

- Updates for normalized GasketRequest ([#1642])

## 3.0.0

- See [Upgrade Guide] for overall changes
- Remove metrics hook ([#1470])
- Add `getVisitor` action ([#1423])

## 2.14.0

- Select `intlLocale` from visitor `locale` instead of `market` ([#1406])

## 2.13.1

- Added decodeURIComponent for parsing visitor cookie ([#1374])

## 2.13.0

- Improve support for retrieving PLID from query parameters and cookies
  ([#1366])

## 2.12.0

- Upgrade dependencies ([#1328])

## 2.11.3

- Extend types for res.locals.visitor ([#1283])

## 2.11.2

- Retain port from request headers for hostname ([#1265])

## 2.11.0

- Lookup and add currency to visitor object ([#1242])

## 2.10.0

- Use x-dsa-host for plid determination ([#1219])
  - (feature) Add `hostname` to visitor properties, which respects the
    x-dsa-host header
  - (fix) Use this new `hostname` property when determining plid
  - (fix) Ensure traffic middleware runs before visitor middleware to ensure
    that created cookies for visit/visitor are seen.

## 2.9.0

- Provide `sessionId` property as an alias for `visitGuid`

## 2.8.2

- Provide `visitorId` property as an alias for `visitorGuid` ([#1192])

## 2.8.1

- Fix for missing dependencies ([#1170])

## 2.8.0

- Use @godaddy/gasket-private-labels ([#1063])

## 2.7.5

- upgrade godaddy eslint-config versions ([#882])

## 2.7.2

- Declare types in package.json ([#507])

## 2.7.1

- Add TypeScript types ([#3], [#8])

## 2.7.0

- [SYNTH-644] Updates to support React 17 ([#324])

## 2.6.1

- Fix to handle bad language in market ([#323])

## 2.4.2

- [[SYNTH-549]] Select from defined locales if set ([#305])

## 2.4.0

- Improvements for deriving market from accept-language header ([#294])

## 2.3.0

- Visitor details related to auth gathered by [auth plugin] ([#290])

## 2.2.1

- Upgrade `@godaddy/markets` ([#265])

## 2.2.0

- Update to consolidate shopper data to visitor plugin ([#251])

## 2.1.2

- Support for using `privateLabelId=` query param ([#225])

## 2.1.1

- Fix to disambiguate language-only market strings ([#209])

## 2.1.0

- Add a `visitor` lifecycle for customizing visitor details ([#178])
- Update `middleware` timings so it runs before `@gasket/config`.

## 2.0.0

- [[STGLS-130]] Normalize plid as number ([#138])
- Initial release.

[auth plugin]: /packages/gasket-plugin-auth
[Upgrade Guide]: /docs/upgrade-to-7.md
[#3]: https://github.com/gdcorp-uxp/gasket/pull/3
[#8]: https://github.com/gdcorp-uxp/gasket/pull/8
[#507]: https://github.com/gdcorp-uxp/gasket/pull/507
[#882]: https://github.com/gdcorp-uxp/gasket/pull/882
[#1063]: https://github.com/gdcorp-uxp/gasket/pull/1063
[#1170]: https://github.com/gdcorp-uxp/gasket/pull/1170
[#1192]: https://github.com/gdcorp-uxp/gasket/pull/1192
[#1219]: https://github.com/gdcorp-uxp/gasket/pull/1219
[#1242]: https://github.com/gdcorp-uxp/gasket/pull/1242
[#1265]: https://github.com/gdcorp-uxp/gasket/pull/1265
[#1283]: https://github.com/gdcorp-uxp/gasket/pull/1283
[#1328]: https://github.com/gdcorp-uxp/gasket/pull/1328
[#1366]: https://github.com/gdcorp-uxp/gasket/pull/1366
[#1374]: https://github.com/gdcorp-uxp/gasket/pull/1374
[#1406]: https://github.com/gdcorp-uxp/gasket/pull/1406
[#1423]: https://github.com/gdcorp-uxp/gasket/pull/1423
[#1470]: https://github.com/gdcorp-uxp/gasket/pull/1470
[#1642]: https://github.com/gdcorp-uxp/gasket/pull/1642
[#1661]: https://github.com/gdcorp-uxp/gasket/pull/1661
[STGLS-130]: https://jira.godaddy.com/browse/STGLS-130
[SYNTH-549]: https://jira.godaddy.com/browse/SYNTH-549
[SYNTH-644]: https://jira.godaddy.com/browse/SYNTH-644
