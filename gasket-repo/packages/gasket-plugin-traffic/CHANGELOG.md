# CHANGELOG

## 3.6.0

### Minor Changes

- be39479: Stop automatically adding the `server` (hostname) property to the Traffic data layer, since it can leak potentially sensitive host information. Added a new `tccData` lifecycle, using `execWaterfall`, that makes it easy to add, modify, or remove properties on the data layer. The `trafficDataLayer` lifecycle is now deprecated in favor of `tccData`.

## 3.5.2

### Patch Changes

- 9a13185: Upgrade OTEL dependencies to get rid of a security vulnerability

## 3.5.1

### Patch Changes

- 8e08725: Update deps

## 3.5.0

### Minor Changes

- 2c4f63d: ESM Port

## 3.4.7

### Patch Changes

- fc8c8f5: Update OTel dependencies, add service environment env var, adjust docs to reference metrics lib

## 3.4.6

### Patch Changes

- fa92eca: Include EXAMPLES.md when publishing

## 3.4.5

### Patch Changes

- 1889c33: move esm packages to vitest

## 3.4.4

### Patch Changes

- 35ce873: Add examples

## 3.4.3

### Patch Changes

- a72a8fe: Fix generated styles for new webapps

## 3.4.2

### Patch Changes

- fe92d45: Eslint9 upgrade

## 3.4.1

### Patch Changes

- 265ea31: Update workspace dependencies from workspace:\* to workspace:^.

## 3.4.0

### Minor Changes

- c905974: Registering the hivemind experiments with traffic from gasket-next

## 3.3.5

### Patch Changes

- b13bc4f: Update @gasket packages, fix type issues

## 3.3.4

### Patch Changes

- bf5bccc: Bump deps

## 3.3.3

### Patch Changes

- f3a6892: Fix issues with testing tool

## 3.3.2

### Patch Changes

- 836d079: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.

## 3.3.1

### Patch Changes

- a3d6689: Updates to support using syncpack.

## 3.3.0

### Minor Changes

- 0b33139: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 3.1.0

- Updates for normalized GasketRequest ([#1642])

## 3.0.0

- See [Upgrade Guide] for overall changes
- update trafficDataLayer lifecycle to use a context object ([#1362])

## 2.7.2

- Fix express middlewares ([#1526])

## 2.7.1

- Update main in package.json ([#1523])

## 2.5.9

- Fix to not encode cookie values ([#1407])

## 2.5.7

- Added decodeURIComponent for parsing visitor cookie ([#1374])

## 2.5.6

- Support trace id for static pages with `setTraceIdCookie()` ([#1365])

## 2.5.2

- upgrade godaddy eslint-config versions ([#882])

## 2.5.0

- Fixes for `@opentelemetry` dependencies ([#420])

## 2.4.1

- Set Traffic loadSource to 'gasket' ([#380])

## 2.4.0

- [NEX-1189] Add traceid meta tag ([#145])

## 2.3.2

- [SYNTH-811] Add types ([#18])

## 2.3.0

- Prefer `x-dsa-host` for host name ([#352])

## 2.2.0

- [SYNTH-644] Updates to support React 17 ([#324])

## 2.0.0

- Version alignment

## 1.2.0

- Add new cookies on `req` allowing access in the same lifecycle ([#167])

## 1.1.0

- [EXP-2993] & [ML-3361] Generate Traffic Session Cookies When Missing ([#127])

## 1.0.0

- Initial rename release.

[Upgrade Guide]: /docs/upgrade-to-7.md
[#18]: https://github.com/gdcorp-uxp/gasket/pull/18
[#145]: https://github.com/gdcorp-uxp/gasket/pull/145
[#380]: https://github.com/gdcorp-uxp/gasket/pull/380
[#420]: https://github.com/gdcorp-uxp/gasket/pull/420
[#882]: https://github.com/gdcorp-uxp/gasket/pull/882
[#1365]: https://github.com/gdcorp-uxp/gasket/pull/1365
[#1374]: https://github.com/gdcorp-uxp/gasket/pull/1374
[#1362]: https://github.com/gdcorp-uxp/gasket/pull/1362
[#1407]: https://github.com/gdcorp-uxp/gasket/pull/1407
[#1523]: https://github.com/gdcorp-uxp/gasket/pull/1523
[#1526]: https://github.com/gdcorp-uxp/gasket/pull/1526
[#1642]: https://github.com/gdcorp-uxp/gasket/pull/1642
[NEX-1189]: https://jira.godaddy.com/browse/NEX-1189
[EXP-2993]: https://jira.godaddy.com/browse/EXP-2993
[ML-3361]: https://jira.godaddy.com/browse/ML-3361
[SYNTH-644]: https://jira.godaddy.com/browse/SYNTH-644
[SYNTH-811]: https://jira.godaddy.com/browse/SYNTH-811
