# CHANGELOG

## 3.5.2

### Patch Changes

- b86b17c: Update lodash to ^4.18.1 to fix CVE-2026-4800 (code injection via `_.template`) and CVE-2026-2950 (prototype pollution via `_.unset`/`_.omit`). Added pnpm-workspace.yaml override to align all transitive lodash instances.

## 3.5.1

### Patch Changes

- b52f485: Add vitest coverage for spaq quality metrics

## 3.5.0

### Minor Changes

- 2c4f63d: ESM Port

## 3.4.0

### Patch Changes

- f1f5966: Package `*.gasket.dev-afternic.com` and `*.gasket.dev-123-reg.co.uk` certs with `sniNames` config option.

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

- 7cbbab5: Adjust package main field

## 3.3.3

### Patch Changes

- 34a4c1f: Bump ssojwt to fix Windows issues

## 3.3.2

### Patch Changes

- 5f35590: Use service account from AWS in our CI to create a JWT to be used in fetching dev certs in order to publish.
- 836d079: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.

## 3.3.1

### Patch Changes

- a3d6689: Updates to support using syncpack.

## 3.3.0

### Minor Changes

- 0b33139: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 3.2.2

- Externalize plugin for server-bundles ([#1714])

## 3.2.1

- Only configure httpsProxy for local and if ssl not already configured ([#1676])

## 3.1.0

- Updates for normalized GasketRequest ([#1642])
- Add `prepare` hook to download certificates ([#1643])

## 3.0.3

- Ensure https dev certs are only assigned with local env ([#1603])

## 3.0.0

- See [Upgrade Guide] for overall changes

## 2.5.1

- Ensure only the latest certificate is downloaded ([#1524])

## 2.4.0

- Handle quoted filenames in `content-disposition` headers ([#1500])

## 2.2.0

- Upgrade dependencies ([#1328])

## 2.1.0

- Update certificates API URL to new endpoint ([#1286])

## 2.0.5

- Add type definitions for config file ([#1257])

## 2.0.2

- Fix config reading logic ([#971])
- Ensure cert downloads are awaited so tasks are completed in time for later lifecycle events

## 2.0.1

- Fix dependencies to avoid module not found errors at runtime

## 2.0.0

- Initial release ([#880])

[Upgrade Guide]: /docs/upgrade-to-7.md
[#880]: https://github.com/gdcorp-uxp/gasket/pull/880
[#971]: https://github.com/gdcorp-uxp/gasket/pull/971
[#1257]: https://github.com/gdcorp-uxp/gasket/pull/1257
[#1286]: https://github.com/gdcorp-uxp/gasket/pull/1286
[#1328]: https://github.com/gdcorp-uxp/gasket/pull/1328
[#1500]: https://github.com/gdcorp-uxp/gasket/pull/1500
[#1524]: https://github.com/gdcorp-uxp/gasket/pull/1524
[#1603]: https://github.com/gdcorp-uxp/gasket/pull/1603
[#1642]: https://github.com/gdcorp-uxp/gasket/pull/1642
[#1643]: https://github.com/gdcorp-uxp/gasket/pull/1643
[#1676]: https://github.com/gdcorp-uxp/gasket/pull/1676
[#1714]: https://github.com/gdcorp-uxp/gasket/pull/1714
