# `@godaddy/gasket-plugin-otel`

## 3.5.4

### Patch Changes

- c430bd0: Add a `getOtelMeter` action for recording custom OpenTelemetry metrics against
  the globally configured MeterProvider.

## 3.5.3

### Patch Changes

- 9a13185: Upgrade OTEL dependencies to get rid of a security vulnerability
- Updated dependencies [9a13185]
  - @godaddy/gasket-otel@3.5.4

## 3.5.2

### Patch Changes

- 5aa47c4: Change log level from warn to debug for missing Trace ID

## 3.5.1

### Patch Changes

- b52f485: Add vitest coverage for spaq quality metrics
- Updated dependencies [b52f485]
  - @godaddy/gasket-otel@3.5.1

## 3.5.0

### Minor Changes

- 2c4f63d: ESM Port

### Patch Changes

- Updated dependencies [2c4f63d]
  - @godaddy/gasket-otel@3.4.0

## 3.4.7

### Patch Changes

- fc8c8f5: Update OTel dependencies, add service environment env var, adjust docs to reference metrics lib
- Updated dependencies [fc8c8f5]
  - @godaddy/gasket-otel@3.3.12

## 3.4.6

### Patch Changes

- fa92eca: Include EXAMPLES.md when publishing
- Updated dependencies [fa92eca]
  - @godaddy/gasket-otel@3.3.11

## 3.4.5

### Patch Changes

- 1889c33: move esm packages to vitest
- Updated dependencies [1889c33]
  - @godaddy/gasket-otel@3.3.10

## 3.4.4

### Patch Changes

- 35ce873: Add examples
- Updated dependencies [35ce873]
  - @godaddy/gasket-otel@3.3.9

## 3.4.3

### Patch Changes

- a72a8fe: Fix generated styles for new webapps
- Updated dependencies [a72a8fe]
  - @godaddy/gasket-otel@3.3.8

## 3.4.2

### Patch Changes

- fe92d45: Eslint9 upgrade
- Updated dependencies [fe92d45]
  - @godaddy/gasket-otel@3.3.7

## 3.4.1

### Patch Changes

- Updated dependencies [93541bd]
  - @godaddy/gasket-otel@3.3.6

## 3.4.0

### Minor Changes

- 746adc5: Add setTraceIdCookie Gasket Action

## 3.3.6

### Patch Changes

- 265ea31: Update workspace dependencies from workspace:\* to workspace:^.
- Updated dependencies [265ea31]
  - @godaddy/gasket-otel@3.3.5

## 3.3.5

### Patch Changes

- b13bc4f: Update @gasket packages, fix type issues
- Updated dependencies [b13bc4f]
  - @godaddy/gasket-otel@3.3.4

## 3.3.4

### Patch Changes

- 3730f34: Fix gap with otel when using TS

## 3.3.3

### Patch Changes

- f4686c8: Fix issues with NextJS and OTel
- Updated dependencies [25f18e6]
- Updated dependencies [f4686c8]
  - @godaddy/gasket-otel@3.3.3

## 3.3.2

### Patch Changes

- 836d079: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.
- Updated dependencies [836d079]
  - @godaddy/gasket-otel@3.3.2

## 3.3.1

### Patch Changes

- a3d6689: Updates to support using syncpack.
- Updated dependencies [a3d6689]
  - @godaddy/gasket-otel@3.3.1

## 3.3.0

### Minor Changes

- 0b33139: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

### Patch Changes

- Updated dependencies [0b33139]
  - @godaddy/gasket-otel@3.3.0

## 3.2.1

- Add create hook to plugin to used in presets ([#1684])

## 3.1.0

- Updates for normalized GasketRequest ([#1642])

## 3.0.0

- See [Upgrade Guide] for overall changes
- Initial release

[Upgrade Guide]: /docs/upgrade-to-7.md
[#1642]: https://github.com/gdcorp-uxp/gasket/pull/1642
[#1684]: https://github.com/gdcorp-uxp/gasket/pull/1684
