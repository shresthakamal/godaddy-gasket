# CHANGELOG

## 3.6.2

### Patch Changes

- da9627b: Fix compatibility with @godaddy/gd-auth-lib v0.13.2+ nested options structure

  - Upgraded `@godaddy/gd-auth-lib` dependency from `^0.11.0` to `^0.13.2`
  - Fixed authentication to use nested `{ godaddySso: {...} }` structure required by v0.13.2+
  - Added backward compatibility for `riskLevel` config with deprecation warning
  - Fixed nullish coalescing to properly handle `SecurityLevel.NONE (0)`

  Note: This bumps the minimum gd-auth-lib version from 0.11.x to 0.13.2 due to breaking API changes in the library.

## 3.6.1

### Patch Changes

- Updated actions.js to use correct nested options structure for @godaddy/gd-auth-lib >= 0.13.2
  - Fixed `getJwt()` to pass `{ godaddySso: {...} }` instead of flat options
  - Upgraded `@godaddy/gd-auth-lib` dependency from `^0.11.0` to `^0.13.2`
  - Maps config `riskLevel` to internal `securityLevel` field for compatibility with updated library
  - Added `configure` hook to migrate `riskLevel` → `securityLevel` with deprecation warning
  - Fixed nullish coalescing to properly handle `SecurityLevel.NONE (0)`

## 3.6.0

### Minor Changes

- 8e2abc2: - **[BREAKING]** Default `use12HourExpiration` to `true` for new 12h/30d expiration policy
  - Level 1/2 (low/medium): 30 days persistent / 12 hours non-persistent
  - Level 3 (high): 1 hour (unchanged)
  - Set `use12HourExpiration: false` in auth config to use legacy policy- Updated auth-lib-wrapper to pass `useNewExpiration` to both legacy and FFI auth libraries
  - Upgraded `gd-auth` dependency from `^1.4.1` to `^1.5.0` for `verifyNewExpiration` support
  - Upgraded `@godaddy/gd-auth-lib` dependency from `^0.7.0` to `^0.11.0`
  - Updated to use `SecurityLevel` instead of deprecated `RiskLevel` from gd-auth-lib 0.11.0

## 3.5.1

### Patch Changes

- 86d29c0: bump godaddy/gd-auth-lib version
- dfa21b7: React 19 & NextJS 16

## 3.5.0

### Minor Changes

- 0c9ffa8: additon of ffi authlibrary support

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

- 556d9e9: A minor bug fix in node-gd-auth with 1.4.1

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

- 7cbbab5: Adjust package main field

## 3.3.2

### Patch Changes

- f9ca316: type check for plugin imports
- 836d079: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.

## 3.3.1

### Patch Changes

- a3d6689: Updates to support using syncpack.

## 3.3.0

### Minor Changes

- 0b33139: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 3.2.1

- Validate jwt config during prepare lifecycle ([#1675])

## 3.1.0

- Cert JWT validation and error checking ([#1647])

[#1644]:

## 3.0.4

- Remove unneeded error warning ([#1638])

## 3.0.3

- Configure guards with in-mem cert support ([#1630])

## 3.0.2

- More easily use devCerts with jwt plugin ([#1612])

## 3.0.0

- See [Upgrade Guide] for overall changes
- Initial release. ([#1413])

[Upgrade Guide]: /docs/upgrade-to-7.md
[#1413]: https://github.com/gdcorp-uxp/gasket/pull/1413
[#1612]: https://github.com/gdcorp-uxp/gasket/pull/1612
[#1630]: https://github.com/gdcorp-uxp/gasket/pull/1630
[#1638]: https://github.com/gdcorp-uxp/gasket/pull/1638
[#1647]: https://github.com/gdcorp-uxp/gasket/pull/1647
[#1675]: https://github.com/gdcorp-uxp/gasket/pull/1675
