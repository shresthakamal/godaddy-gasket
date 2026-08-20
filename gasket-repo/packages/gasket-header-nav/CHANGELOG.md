# CHANGELOG

## 3.7.3

### Patch Changes

- f443044: Revert the support array of items for top navigation prop

## 3.7.2

### Patch Changes

- b52f485: Add vitest coverage for spaq quality metrics

## 3.7.1

### Patch Changes

- 27a3750: Use the Async API for header availability to avoid deferred JS race conditions

## 3.7.0

### Minor Changes

- 040b748: Support array of navigation items for the `top` prop

## 3.6.3

### Patch Changes

- 3815923: Fix peerDep range for next

## 3.6.2

### Patch Changes

- 69efa9c: Update deps

## 3.6.1

### Patch Changes

- dfa21b7: React 19 & NextJS 16

## 3.6.0

### Minor Changes

- 4f366c4: Add a component and hook for application sidebar integration

## 3.5.0

### Minor Changes

- 2c4f63d: ESM Port

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
- 921f6bd: Fix and expand on TypeScript declarations

## 3.4.2

### Patch Changes

- fe92d45: Eslint9 upgrade

## 3.4.1

### Patch Changes

- 93541bd: Use standardized CJS output

## 3.4.0

### Minor Changes

- bc64c3c: include vitest in presets and generated code

## 3.3.5

### Patch Changes

- 25f18e6: Add CJS transpile to ESM-only packages

## 3.3.4

### Patch Changes

- 295a840: Add support for app router

## 3.3.3

### Patch Changes

- 836d079: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.

## 3.3.2

### Patch Changes

- c8cf75f: Bump next.js version to latest patch to mitigate critical vulnerability.

## 3.3.1

### Patch Changes

- a3d6689: Updates to support using syncpack.

## 3.3.0

### Minor Changes

- 0b33139: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 3.2.0

- Switch package to type module and remove transpilation step ([#1663])

## 3.1.1

- Fix withHeaderNav to retain getInitialProps ([#1657])

## 3.1.0

- Aligned version releases across all packages

## 3.0.0

- See [Upgrade Guide] for overall changes

## 2.12.1

- Fix broken TypeScript types ([#1501])

## 2.10.1

- Update types ([#1331]

## 2.10.0

- Upgrade dependencies ([#1328])

## 2.9.0

- Migrate to use Jest ([#1304])

## 2.8.0

- [FOSS-378] Update react and react-dom to 18 ([#1294])

## 2.7.2

- Add onUpdate/onClear ([#1235])

## 2.7.1

- upgrade godaddy eslint-config versions ([#882])

## 2.7.0

- Add `side` prop to use for sidebar navigation ([#692])

## 2.6.1

- Fix default active state check for plid query ([#366])

## 2.5.2

- [SYNTH-829] Add types ([#27])

## 2.5.0

- [SYNTH-644] Updates to support React 17 ([#324])

## 2.2.1

- Remove eid from header nav items ([#283])

## 2.2.0

- Update next to version 10.2 ([#238])

## 2.1.2

- Ensure clean build before publishing ([#211])

## 2.0.1

- Adjust peerDependencies ([#176])

## 2.0.0

- [[STGLS-74]] Only hoist `getInitialProps` if present on wrapped component ([#141])

## 1.0.0

- Initial rename release.

[Upgrade Guide]: /docs/upgrade-to-7.md
[#27]: https://github.com/gdcorp-uxp/gasket/pull/27
[#366]: https://github.com/gdcorp-uxp/gasket/pull/366
[#692]: https://github.com/gdcorp-uxp/gasket/pull/692
[#882]: https://github.com/gdcorp-uxp/gasket/pull/882
[#1235]: https://github.com/gdcorp-uxp/gasket/pull/1235
[#1294]: https://github.com/gdcorp-uxp/gasket/pull/1294
[#1304]: https://github.com/gdcorp-uxp/gasket/pull/1304
[#1328]: https://github.com/gdcorp-uxp/gasket/pull/1328
[#1331]: https://github.com/gdcorp-uxp/gasket/pull/1331
[#1501]: https://github.com/gdcorp-uxp/gasket/pull/1501
[#1657]: https://github.com/gdcorp-uxp/gasket/pull/1657
[#1663]: https://github.com/gdcorp-uxp/gasket/pull/1663
[STGLS-74]: https://jira.godaddy.com/browse/STGLS-74
[SYNTH-644]: https://jira.godaddy.com/browse/SYNTH-644
[SYNTH-829]: https://jira.godaddy.com/browse/SYNTH-829
[FOSS-378]: https://godaddy-corp.atlassian.net/browse/FOSS-378
