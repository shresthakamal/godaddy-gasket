# `@godaddy/gasket-content-nodes`

## 3.1.1

### Patch Changes

- b52f485: Add vitest coverage for spaq quality metrics

## 3.1.0

### Minor Changes

- 2c4f63d: ESM Port

## 3.0.1

### Patch Changes

- 5c93bb0: tsconfig rootDir

## 3.0.0

### Major Changes

- e31b57c: Move storefront packages to @godaddy repo

### Patch Changes

- 35a2b37: Add cjs exports to storefront packages

## 2.1.0-canary.3

### Minor Changes

- 3af9420: Refactored Rich Text handling in plugin-contentful v2: consolidated logic, fixed mark/newline bugs, removed RichText component, improved typing and tests.

## 2.1.0-canary.2

### Patch Changes

- 8e6e142: v2 Content Transforms
  - Major overhaul of the content transforms system, now allowing a `transforms` prop to be passed to the `getContentfulEntries` action which replaces the pattern of hooking the `contentTransform` lifecycle.
  - New `cacheTransformed` client option added to allow caching of transformed content.
  - New `cacheKeyExtensions` client option added to allow for additional cache keys for transformed content.
  - New `enableSnapshots` option passed through `context` to allow for snapshotting each transform's resulting content node tree.

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

## 1.0.0

- First major release

## 0.15.0

- Update NPM registry to use Artifactory SaaS ([#362])

## 0.7.0

- Ability to remove content nodes in transforms ([#328], [#330])

## 0.4.0

- Normalize content entries as content nodes ([#278])

<!-- LINKS -->

[#278]: https://github.com/gdcorp-uxp/pfx-storefront/pull/278
[#328]: https://github.com/gdcorp-uxp/pfx-storefront/pull/328
[#330]: https://github.com/gdcorp-uxp/pfx-storefront/pull/330
[#362]: https://github.com/gdcorp-uxp/pfx-storefront/pull/362
