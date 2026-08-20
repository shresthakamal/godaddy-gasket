# `@godaddy/gasket-plugin-content`

## 3.2.4

### Patch Changes

- b52f485: Add vitest coverage for spaq quality metrics
- Updated dependencies [b52f485]
  - @godaddy/gasket-content-nodes@3.1.1

## 3.2.3

### Patch Changes

- 69efa9c: Update deps

## 3.2.2

### Patch Changes

- dfa21b7: React 19 & NextJS 16

## 3.2.1

### Patch Changes

- d0f9b14: Fixes issue where snapshots would misattribute mutating transforms

## 3.2.0

### Minor Changes

- d3e8d11: Including recursion of the inner nodes in transformFlattenContent

## 3.1.1

### Patch Changes

- 1b00ee3: Added transformFlattenContent that recursively flattens ContentNode tuples into plain JSON objects.

## 3.1.0

### Minor Changes

- 2c4f63d: ESM Port

### Patch Changes

- Updated dependencies [2c4f63d]
  - @godaddy/gasket-content-nodes@3.1.0

## 3.0.0

### Major Changes

- e31b57c: Move storefront packages to @godaddy repo

### Patch Changes

- 35a2b37: Add cjs exports to storefront packages
- Updated dependencies [35a2b37]
- Updated dependencies [e31b57c]
  - @godaddy/gasket-content-nodes@3.0.0

## 2.1.0-canary.3

### Minor Changes

- 3af9420: Refactored Rich Text handling in plugin-contentful v2: consolidated logic, fixed mark/newline bugs, removed RichText component, improved typing and tests.

### Patch Changes

- Updated dependencies [3af9420]
  - @pfx/content-nodes@2.1.0-canary.3

## 2.1.0-canary.2

### Patch Changes

- 8e6e142: v2 Content Transforms
  - Major overhaul of the content transforms system, now allowing a `transforms` prop to be passed to the `getContentfulEntries` action which replaces the pattern of hooking the `contentTransform` lifecycle.
  - New `cacheTransformed` client option added to allow caching of transformed content.
  - New `cacheKeyExtensions` client option added to allow for additional cache keys for transformed content.
  - New `enableSnapshots` option passed through `context` to allow for snapshotting each transform's resulting content node tree.
- Updated dependencies [8e6e142]
  - @pfx/content-nodes@2.1.0-canary.2

## 2.1.0-canary.1

### Minor Changes

- 5e7779b: Migrated repo to use PNPM and Changeset.

### Patch Changes

- 9ae4796: \* Upgrades Contentful.js to v11
  - New `clientOptions` and `query` props to `getContentfulEntries` action, allowing for more control over the Contentful client and query.
  - Support for cross-space reference resolution with new `crossSpaceSource` config flag.
  - Debug data is now included in the `getContentfulEntries` action result.
  - `enablePagination` option added to automatically paginate through results when fetching Contentful entries.
  - `withAllLocales` option to fetch entries for all locales, replacing the deprecated `locale=*` query param.
- Updated dependencies [5e7779b]
- Updated dependencies [9ae4796]
  - @pfx/content-nodes@2.1.0

## 1.0.0

- First major release

## 0.15.1

- Opt for dynamic import of `@pfx/gasket-content` ([#364])

## 0.15.0

- Update NPM registry to use Artifactory SaaS ([#362])

## 0.14.1

- Adjust TS types for conditional content ([#357])

## 0.13.0

- Improved debug-content command logging ([#354])

## 0.12.0

- Add new debug-content command ([#349])

## 0.7.0

- Move currency logic to visitor plugin ([#326])

## 0.6.0

- Add Content Transforms Guide ([#315])

## 0.4.2

- Add `contentTransform` lifecycle ([#304])

## 0.4.0

- ContentParams access via React Hooks ([#298], [#302])
- Normalize content entries as content nodes ([#278])

<!-- LINKS -->

[#278]: https://github.com/gdcorp-uxp/pfx-storefront/pull/278
[#298]: https://github.com/gdcorp-uxp/pfx-storefront/pull/298
[#302]: https://github.com/gdcorp-uxp/pfx-storefront/pull/302
[#304]: https://github.com/gdcorp-uxp/pfx-storefront/pull/304
[#315]: https://github.com/gdcorp-uxp/pfx-storefront/pull/315
[#326]: https://github.com/gdcorp-uxp/pfx-storefront/pull/326
[#349]: https://github.com/gdcorp-uxp/pfx-storefront/pull/349
[#354]: https://github.com/gdcorp-uxp/pfx-storefront/pull/354
[#357]: https://github.com/gdcorp-uxp/pfx-storefront/pull/357
[#362]: https://github.com/gdcorp-uxp/pfx-storefront/pull/362
[#364]: https://github.com/gdcorp-uxp/pfx-storefront/pull/364
