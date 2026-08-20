# CHANGELOG

## 3.4.1

### Patch Changes

- f0b8e2c: Install the latest version of the shared header client. This enables an optional retries configuration on the client, which implements exponential backoff with jitter, and makes the TTL of the commerce cache configurable.

## 3.4.0

### Minor Changes

- 2c4f63d: ESM Port

## 3.3.15

### Patch Changes

- fa92eca: Include EXAMPLES.md when publishing

## 3.3.14

### Patch Changes

- 3696398: Install the latest version of shared header client. This provides connect and request timeout options for improved page load time.

## 3.3.13

### Patch Changes

- 1889c33: move esm packages to vitest

## 3.3.12

### Patch Changes

- 35ce873: Add examples

## 3.3.11

### Patch Changes

- a72a8fe: Fix generated styles for new webapps

## 3.3.10

### Patch Changes

- fe92d45: Eslint9 upgrade
- Updated dependencies [fe92d45]
- Updated dependencies [01fcdff]
  - @godaddy/gasket-plugin-visitor@3.4.2
  - @godaddy/gasket-plugin-uxp@3.4.3

## 3.3.9

### Patch Changes

- Updated dependencies [2f37840]
  - @godaddy/gasket-plugin-visitor@3.4.0
  - @godaddy/gasket-plugin-uxp@3.4.2

## 3.3.8

### Patch Changes

- b13bc4f: Update @gasket packages, fix type issues
- Updated dependencies [b13bc4f]
  - @godaddy/gasket-plugin-visitor@3.3.4
  - @godaddy/gasket-plugin-uxp@3.3.9
- Updated dependencies [bc64c3c]
  - @godaddy/gasket-plugin-uxp@3.4.0
- 265ea31: Update workspace dependencies from workspace:\* to workspace:^.
- Updated dependencies [265ea31]
- Updated dependencies [4423b9f]
  - @godaddy/gasket-plugin-visitor@3.3.5
  - @godaddy/gasket-plugin-uxp@3.4.1

## 3.3.7

### Patch Changes

- Updated dependencies [bf5bccc]
  - @godaddy/gasket-plugin-uxp@3.3.8

## 3.3.6

### Patch Changes

- Updated dependencies [f3a6892]
  - @godaddy/gasket-plugin-uxp@3.3.7

## 3.3.5

### Patch Changes

- Updated dependencies [ea6d994]
  - @godaddy/gasket-plugin-uxp@3.3.6

## 3.3.4

### Patch Changes

- Updated dependencies [69a3502]
  - @godaddy/gasket-plugin-uxp@3.3.5

## 3.3.3

### Patch Changes

- Updated dependencies [532c1c2]
- Updated dependencies [9d5958b]
  - @godaddy/gasket-plugin-uxp@3.3.4

## 3.3.2

### Patch Changes

- 836d079: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [836d079]
  - @godaddy/gasket-plugin-visitor@3.3.3
  - @godaddy/gasket-plugin-uxp@3.3.3

## 3.3.1

### Patch Changes

- a3d6689: Updates to support using syncpack.
- Updated dependencies [a3d6689]
  - @godaddy/gasket-plugin-visitor@3.3.2
  - @godaddy/gasket-plugin-uxp@3.3.1

## 3.3.0

### Minor Changes

- 0b33139: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [0b33139]
  - @godaddy/gasket-plugin-visitor@3.3.0
  - @godaddy/gasket-plugin-uxp@3.3.0

## 3.2.4

- Fix missing plugin export type ([#1700])

## 3.1.0

- Aligned version releases across all packages

## 3.0.0

- Initial release ([#1606])

[#1606]: https://github.com/gdcorp-uxp/gasket/pull/1606
[#1700]: https://github.com/gdcorp-uxp/gasket/pull/1700
