# CHANGELOG

## 4.7.0

### Minor Changes

- 8f92b63: check for venture redirector opt out before hcsProps

### Patch Changes

- Updated dependencies [8f92b63]
  - @godaddy/gasket-plugin-hcs@4.10.0

## 4.6.0

### Minor Changes

- 2c4f63d: ESM Port

### Patch Changes

- Updated dependencies [2c4f63d]
  - @godaddy/gasket-plugin-security@3.4.0
  - @godaddy/gasket-plugin-visitor@3.7.0
  - @godaddy/gasket-plugin-hcs@4.9.0

## 4.5.0

### Minor Changes

- f915986: port changes from lts to main

### Patch Changes

- Updated dependencies [f915986]
  - @godaddy/gasket-plugin-hcs@4.7.0

## 4.4.11

### Patch Changes

- cd49f16: add ability to lock routes behind auth
- fa92eca: Include EXAMPLES.md when publishing
- Updated dependencies [fa92eca]
  - @godaddy/gasket-plugin-security@3.3.11
  - @godaddy/gasket-plugin-visitor@3.6.2
  - @godaddy/gasket-plugin-hcs@4.6.2

## 4.4.10

### Patch Changes

- d512d93: consolidate SSO link configuration for venture redirector
- Updated dependencies [d512d93]
  - @godaddy/gasket-plugin-hcs@4.6.0

## 4.4.9

### Patch Changes

- 1889c33: move esm packages to vitest
- Updated dependencies [5cdb907]
- Updated dependencies [1889c33]
  - @godaddy/gasket-plugin-visitor@3.6.1
  - @godaddy/gasket-plugin-security@3.3.10
  - @godaddy/gasket-plugin-hcs@4.5.6

## 4.4.8

### Patch Changes

- 35ce873: Add examples
- Updated dependencies [35ce873]
  - @godaddy/gasket-plugin-security@3.3.9
  - @godaddy/gasket-plugin-visitor@3.5.4
  - @godaddy/gasket-plugin-hcs@4.5.5

## 4.4.7

### Patch Changes

- a72a8fe: Fix generated styles for new webapps
- Updated dependencies [a72a8fe]
  - @godaddy/gasket-plugin-security@3.3.8
  - @godaddy/gasket-plugin-visitor@3.5.1
  - @godaddy/gasket-plugin-hcs@4.5.4

## 4.4.6

### Patch Changes

- fe92d45: Eslint9 upgrade
- Updated dependencies [fe92d45]
  - @godaddy/gasket-plugin-security@3.3.7
  - @godaddy/gasket-plugin-visitor@3.4.2
  - @godaddy/gasket-plugin-hcs@4.5.2

## 4.4.5

### Patch Changes

- Updated dependencies [ac014b0]
  - @godaddy/gasket-plugin-hcs@4.5.1

## 4.4.4

### Patch Changes

- 93541bd: Use standardized CJS output
- Updated dependencies [0468e8f]
  - @godaddy/gasket-plugin-visitor@3.4.1
  - @godaddy/gasket-plugin-hcs@4.5.0

## 4.4.3

### Patch Changes

- Updated dependencies [2f37840]
  - @godaddy/gasket-plugin-visitor@3.4.0
  - @godaddy/gasket-plugin-hcs@4.5.0

## 4.4.2

### Patch Changes

- 1b640eb: Upgrade @gasket dependencies
- Updated dependencies [1b640eb]
  - @godaddy/gasket-plugin-visitor@3.3.6
  - @godaddy/gasket-plugin-hcs@4.4.2

## 4.4.1

### Patch Changes

- 265ea31: Update workspace dependencies from workspace:\* to workspace:^.
- Updated dependencies [265ea31]
  - @godaddy/gasket-plugin-security@3.3.6
  - @godaddy/gasket-plugin-visitor@3.3.5
  - @godaddy/gasket-plugin-hcs@4.4.1

## 4.4.0

### Minor Changes

- bc64c3c: include vitest in presets and generated code

### Patch Changes

- Updated dependencies [bc64c3c]
  - @godaddy/gasket-plugin-hcs@4.4.0

## 4.3.8

### Patch Changes

- 36ae7eb: Add missing vitetest dep

## 4.3.7

### Patch Changes

- b13bc4f: Update @gasket packages, fix type issues
- Updated dependencies [b13bc4f]
  - @godaddy/gasket-plugin-security@3.3.5
  - @godaddy/gasket-plugin-visitor@3.3.4
  - @godaddy/gasket-plugin-hcs@4.3.7

## 4.3.6

### Patch Changes

- Updated dependencies [bf5bccc]
  - @godaddy/gasket-plugin-hcs@4.3.6

## 4.3.5

### Patch Changes

- 25f18e6: Add CJS transpile to ESM-only packages
- Updated dependencies [4d2e1fb]
- Updated dependencies [f3a6892]
- Updated dependencies [7cbbab5]
  - @godaddy/gasket-plugin-security@3.3.4
  - @godaddy/gasket-plugin-hcs@4.3.5

## 4.3.4

### Patch Changes

- Updated dependencies [e6080b2]
  - @godaddy/gasket-plugin-hcs@4.3.4

## 4.3.3

### Patch Changes

- Updated dependencies [6a9d887]
  - @godaddy/gasket-plugin-security@3.3.3

## 4.3.2

### Patch Changes

- 836d079: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [f9ca316]
- Updated dependencies [836d079]
  - @godaddy/gasket-plugin-hcs@4.3.3
  - @godaddy/gasket-plugin-security@3.3.2
  - @godaddy/gasket-plugin-visitor@3.3.3

## 4.3.1

### Patch Changes

- a3d6689: Updates to support using syncpack.
- Updated dependencies [a3d6689]
  - @godaddy/gasket-plugin-security@3.3.1
  - @godaddy/gasket-plugin-visitor@3.3.2
  - @godaddy/gasket-plugin-hcs@4.3.2

## 4.3.0

### Minor Changes

- 0b33139: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [0b33139]
  - @godaddy/gasket-plugin-security@3.3.0
  - @godaddy/gasket-plugin-visitor@3.3.0
  - @godaddy/gasket-plugin-hcs@4.3.0

## 4.2.0

- Move default plugins into presets ([#1670])

## 4.1.2

- Remove `./routes/index.js` import from the `server` file ([#1666])

## 4.0.0

- See [Upgrade Guide] for overall changes
- Update preset to use new preset pattern established in v7 of OSS Gasket ([#1443])

## 3.1.0

- Upgrade dependencies ([#1328])

## 2.23.3

- [SYNTH-811] Add types ([#19])

## 2.20.0

- [SYNTH-644] Updates to support React 17 ([#324])

## 2.3.1

- Upgrade @gasket plugins with HTTP/2 support ([#249])

## 2.0.1

- Adjust dependency versions ([#176])

## 2.0.0

- Update `@gasket` packages and align dependency versions

## 1.0.0

- Initial release ([#147])

[Upgrade Guide]: /docs/upgrade-to-7.md
[#19]: https://github.com/gdcorp-uxp/gasket/pull/19
[#1328]: https://github.com/gdcorp-uxp/gasket/pull/1328
[#1443]: https://github.com/gdcorp-uxp/gasket/pull/1443
[#1670]: https://github.com/gdcorp-uxp/gasket/pull/1670
[SYNTH-644]: https://jira.godaddy.com/browse/SYNTH-644
[SYNTH-811]: https://jira.godaddy.com/browse/SYNTH-811
[#1666]: https://github.com/gdcorp-uxp/gasket/pull/1666
