# CHANGELOG

## 3.4.0

### Minor Changes

- 2c4f63d: ESM Port

## 3.3.11

### Patch Changes

- fa92eca: Include EXAMPLES.md when publishing

## 3.3.10

### Patch Changes

- 1889c33: move esm packages to vitest

## 3.3.9

### Patch Changes

- 35ce873: Add examples

## 3.3.8

### Patch Changes

- a72a8fe: Fix generated styles for new webapps

## 3.3.7

### Patch Changes

- fe92d45: Eslint9 upgrade

## 3.3.6

### Patch Changes

- 265ea31: Update workspace dependencies from workspace:\* to workspace:^.

## 3.3.5

### Patch Changes

- b13bc4f: Update @gasket packages, fix type issues

## 3.3.4

### Patch Changes

- 4d2e1fb: Fix csp logic, add deprecations
- 7cbbab5: Adjust package main field

## 3.3.3

### Patch Changes

- 6a9d887: Updates to support integrating the Gasket Testing Tool into this monorepo.

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

- Updates for gasket commands improvements ([#1645])

## 3.0.2

- Added Gasket Actions and updated middleware hook ([#1592])

## 3.0.0

- See [Upgrade Guide] for overall changes

## 2.7.0

- Limit CSP hash cache size with LRU cache ([#1409])

## 2.6.1

- upgrade godaddy eslint-config versions ([#882])

## 2.5.1

- [SYNTH-811] Add types ([#16])

## 2.5.0

- [SYNTH-644] Updates to support React 17 ([#324])

## 2.3.0

- Filter `XSRF-TOKEN` cookies from elastic APM ([#299])

## 2.2.0

- [UXP-5061] Add CSP directives for HCS ([#259])

## 2.1.1

- Add `helmet.contentSecurityPolicy = false` to gasket.config ([#232])

## 2.1.0

- Generate CSP directives for inline content ([#181])
  - Remove `'unsafe-inline'` from `script-src`
  - Add `addCspHash` and `addCspNonce` response header helpers

## 2.0.1

- Adjust default CSP directives and avoid mutating config ([#172])

## 2.0.0

- [[STGLS-128]] Initial support for ContentSecurityPolicy ([#135])
- Default all CSP directives to include 'self' ([#154])
- Disable ContentSecurityPolicy during `gasket local` command ([#159])

## 1.0.0

- Initial rename release.

[Upgrade Guide]: /docs/upgrade-to-7.md
[#16]: https://github.com/gdcorp-uxp/gasket/pull/16
[#882]: https://github.com/gdcorp-uxp/gasket/pull/882
[#1409]: https://github.com/gdcorp-uxp/gasket/pull/1409
[#1592]: https://github.com/gdcorp-uxp/gasket/pull/1592
[#1645]: https://github.com/gdcorp-uxp/gasket/pull/1645
[UXP-5061]: https://jira.godaddy.com/browse/UXP-5061
[STGLS-128]: https://jira.godaddy.com/browse/STGLS-128
[SYNTH-644]: https://jira.godaddy.com/browse/SYNTH-644
[SYNTH-811]: https://jira.godaddy.com/browse/SYNTH-811
