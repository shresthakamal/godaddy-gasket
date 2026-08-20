# CHANGELOG

## 1.1.2

### Patch Changes

- b86b17c: Update lodash to ^4.18.1 to fix CVE-2026-4800 (code injection via `_.template`) and CVE-2026-2950 (prototype pollution via `_.unset`/`_.omit`). Added pnpm-workspace.yaml override to align all transitive lodash instances.

## 1.1.1

### Patch Changes

- b52f485: Add vitest coverage for spaq quality metrics

## 1.1.0

### Minor Changes

- 2c4f63d: ESM Port

## 1.0.5

### Patch Changes

- fa92eca: Include EXAMPLES.md when publishing

## 1.0.4

### Patch Changes

- 1889c33: move esm packages to vitest

## 1.0.3

### Patch Changes

- 35ce873: Add examples

## 1.0.2

### Patch Changes

- a72a8fe: Fix generated styles for new webapps

## 1.0.1

### Patch Changes

- fe92d45: Eslint9 upgrade

## 1.0.0

### Major Changes

- Initial release of `@godaddy/gasket-plugin-cde` – CDE (Customer Data Events) integration for Gasket apps.
- Provides automatic posting of app evaluation events to CDE for each request in Express and Fastify apps.
- Supports both Express and Fastify via plugin hooks.
- Adds `sendAppEvaluationEvent` action for manual event posting.
- Supports per-request parameter overrides via the `appEvaluationEvent` lifecycle hook.
