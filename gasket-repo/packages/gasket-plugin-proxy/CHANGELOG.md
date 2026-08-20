# CHANGELOG

## 3.4.3

### Patch Changes

- b86b17c: Update lodash to ^4.18.1 to fix CVE-2026-4800 (code injection via `_.template`) and CVE-2026-2950 (prototype pollution via `_.unset`/`_.omit`). Added pnpm-workspace.yaml override to align all transitive lodash instances.

## 3.4.2

### Patch Changes

- a2a0bc0: fix: Handling HTTP 204 and Content-Length=0

## 3.4.1

### Patch Changes

- a592e82: Fix broken CJS import

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

- 7cbbab5: Adjust package main field

## 3.3.3

### Patch Changes

- 6bb41ac: Improve error handling in defaultRequestAdapter.

## 3.3.2

### Patch Changes

- 836d079: Downgrade eslint-plugin-jest version due to conflicting peer dependency between versions of @typescript-eslint/eslint-plugin.

## 3.3.1

### Patch Changes

- a3d6689: Updates to support using syncpack.

## 3.3.0

### Minor Changes

- 0b33139: Migrated packages to use PNPM and changesets. Fixed issues with types and dependencies.

## 3.2.4

- Always normalize headers to a plain object ([#1697])

## 3.2.3

- remove test from destructuring of err in request adapter ([#1692])

## 3.2.1

- remove problematic content encoding response headers ([#1683])

## 3.1.3

- Fix issues with proxy plugin payloads and headers ([#1669])

## 3.1.1

- Adjust types ([#1656])

## 3.1.0

- Pixup proxy plugin with actions and improvements ([#1636])

## 3.0.0

- See [Upgrade Guide] for overall changes
- Replaced request-promise with @gasket/fetch ([#1434])
- Add plugin dependencies and requirement docs ([#1477])

## 2.6.4

- Fix bug where req and res objects were having incomplete data when receiving HTTP2 calls ([#1463])

## 2.6.3

- HTTP2 headers being passed as part of the request won't cause the proxy to error instead, it will ignore them ([#1461])

## 2.6.1

- Fix bug with `logResponse` not getting passed through to the proxy

## 2.6.0

- Support customized logging of proxy responses ([#1437])

## 2.5.0

- Upgrade dependencies ([#1328])

## 2.4.5

- Use more complete set of types for config settings ([#1257])

## 2.4.3

- upgrade godaddy eslint-config versions ([#882])

## 2.4.2

- Remove bodies from requests that should not have bodies ([#575])

## 2.3.2

- [SYNTH-811] Add types for Proxy plugin ([#15])

## 2.3.1

- Fix use new keyword with lru-cache v6 ([#12])

## 2.3.0

- [SYNTH-644] Updates to support React 17 ([#324])

## 2.0.3

- Fix serialization issues (circular references, large output) when logging proxied responses

## 2.0.2

- Run proxy middleware after config middleware ([#213])

## 2.0.0

- Update `@gasket` packages and align dependency versions

## 1.1.0

- `await` `requestTransform` and `responseTransform` to allow asynchronous functions. ([#39])

## 1.0.0

- Initial rename release.

[Upgrade Guide]: /docs/upgrade-to-7.md
[#12]: https://github.com/gdcorp-uxp/gasket/pull/12
[#15]: https://github.com/gdcorp-uxp/gasket/pull/15
[#575]: https://github.com/gdcorp-uxp/gasket/pull/575
[#882]: https://github.com/gdcorp-uxp/gasket/pull/882
[#1257]: https://github.com/gdcorp-uxp/gasket/pull/1257
[#1328]: https://github.com/gdcorp-uxp/gasket/pull/1328
[#1434]: https://github.com/gdcorp-uxp/gasket/pull/1434
[#1437]: https://github.com/gdcorp-uxp/gasket/pull/1437
[#1461]: https://github.com/gdcorp-uxp/gasket/pull/1461
[#1463]: https://github.com/gdcorp-uxp/gasket/pull/1463
[#1477]: https://github.com/gdcorp-uxp/gasket/pull/1477
[#1636]: https://github.com/gdcorp-uxp/gasket/pull/1636
[#1656]: https://github.com/gdcorp-uxp/gasket/pull/1656
[#1669]: https://github.com/gdcorp-uxp/gasket/pull/1669
[#1683]: https://github.com/gdcorp-uxp/gasket/pull/1683
[#1692]: https://github.com/gdcorp-uxp/gasket/pull/1692
[#1697]: https://github.com/gdcorp-uxp/gasket/pull/1697
[SYNTH-644]: https://jira.godaddy.com/browse/SYNTH-644
[SYNTH-811]: https://jira.godaddy.com/browse/SYNTH-811
