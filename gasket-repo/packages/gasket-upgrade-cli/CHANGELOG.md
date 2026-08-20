# CHANGELOG

## 3.3.8

### Patch Changes

- 7a43462: Avoid crashes when gasket-upgrade encounters a directory with a file-like name

## 3.3.7

### Patch Changes

- a72a8fe: Fix generated styles for new webapps

## 3.3.6

### Patch Changes

- fe92d45: Eslint9 upgrade

## 3.3.5

### Patch Changes

- 265ea31: Update workspace dependencies from workspace:\* to workspace:^.

## 3.3.4

### Patch Changes

- b13bc4f: Update @gasket packages, fix type issues

## 3.3.3

### Patch Changes

- d42586a: - Add The `next.config.mjs`
  - Resolve file fixup errors when renaming `config/` to `gasket-data/`

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

- Warn when git commands have issues ([#1677])
- Upgrade shared header plugin and bump Gasket dep versions ([#1678])

## 3.1.0

- Aligned version releases across all packages

## 3.0.2

- Fix gasket-upgrade errors for gasket file [(#1639)]

## 3.0.0

- See [Upgrade Guide] for overall changes
- Removed oclif and replaced it with commander.js ([#1400])

## 2.9.0

- Upgrade dependencies ([#1328])

## 2.8.0

- Add patches for next 13 upgrade

## 2.7.0

- Remove legacy webpack5 next config patch ([#1291])

## 2.6.4

- upgrade godaddy eslint-config versions ([#882])

## 2.6.1

- Use fs.promises over promisify ([#351])

## 2.6.0

- Upgrade patches for Next 12 ([#340])
- Add patch to update ESLint and configs ([#344])

## 2.5.0

- [SYNTH-644] Updates to support React 17 ([#324])

## 2.1.0

- Add `helmet.contentSecurityPolicy = false` to gasket.config ([#232])

## 2.0.1

- Use `getOrCreateStore` in the `store.js` upgrades ([#170])
- Bump critical dependencies

## 2.0.0

- Upgrade tool patches for v6/v2 ([#149], [#156], [#157])

## 1.0.0

- Support upgrades to v5 of `@gasket/*` and v1 of `@godaddy/gasket-*` packages.
  ([#10])
- Update names in plugin timings and dependencies ([#11])
- Flag to skip install step with upgrade tool ([#12])
- Upgrade patch for configuring assets plugin ([#15])

[Upgrade Guide]: /docs/upgrade-to-7.md
[#882]: https://github.com/gdcorp-uxp/gasket/pull/882
[#1291]: https://github.com/gdcorp-uxp/gasket/pull/1291
[#1328]: https://github.com/gdcorp-uxp/gasket/pull/1328
[#1400]: https://github.com/gdcorp-uxp/gasket/pull/1400
[#1677]: https://github.com/gdcorp-uxp/gasket/pull/1677
[#1678]: https://github.com/gdcorp-uxp/gasket/pull/1678
[SYNTH-644]: https://jira.godaddy.com/browse/SYNTH-644
