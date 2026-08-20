# `@godaddy/gasket-plugin-contentful`

## 3.4.0

- 7ac54ba: introduce `dangerouslyAllowMutation` cache option

## 3.3.3

### Patch Changes

- b52f485: Add vitest coverage for spaq quality metrics
- Updated dependencies [b52f485]
  - @godaddy/gasket-plugin-content@3.2.4
  - @godaddy/gasket-content-nodes@3.1.1

## 3.3.2

### Patch Changes

- d0f9b14: Introduces new contentData.debug.rawEntries output for easier debugging
- Updated dependencies [d0f9b14]
  - @godaddy/gasket-plugin-content@3.2.1

## 3.3.1

### Patch Changes

- 2a22f29: Moved vitest to devDependency as consumers do not need to install this as a dependency

## 3.3.0

### Minor Changes

- 6a0d810: Add stale-while-revalidate cache with more controls in new cacheOptions prop.

## 3.2.0

### Minor Changes

- 2c4f63d: ESM Port

### Patch Changes

- Updated dependencies [2c4f63d]
  - @godaddy/gasket-plugin-content@3.1.0
  - @godaddy/gasket-content-nodes@3.1.0

## 3.1.0

### Minor Changes

- 63e0112: Add dangerouslyCachePreview to client options

## 3.0.2

### Patch Changes

- a686c5b: update contentful request log formatting

## 3.0.1

### Patch Changes

- 5c93bb0: tsconfig rootDir
- Updated dependencies [5c93bb0]
  - @godaddy/gasket-content-nodes@3.0.1

## 3.0.0

### Major Changes

- e31b57c: Move storefront packages to @godaddy repo

### Patch Changes

- 35a2b37: Add cjs exports to storefront packages
- Updated dependencies [35a2b37]
- Updated dependencies [e31b57c]
  - @godaddy/gasket-plugin-content@3.0.0
  - @godaddy/gasket-content-nodes@3.0.0

## 2.1.0-canary.5

### Patch Changes

- 0136871: fix handling of empty entries return from contentful client
- 02d0831: add bad entry and cross-space reference warn/prune toggle to content settings config

## 2.1.0-canary.4

### Patch Changes

- 04d316f: Allow cache to vary by transforms provided ONLY if cacheTransformed is enabled

## 2.1.0-canary.3

### Minor Changes

- 3af9420: Refactored Rich Text handling in plugin-contentful v2: consolidated logic, fixed mark/newline bugs, removed RichText component, improved typing and tests.

### Patch Changes

- Updated dependencies [3af9420]
  - @pfx/gasket-plugin-content@2.1.0-canary.3
  - @pfx/content-nodes@2.1.0-canary.3

## 2.1.0-canary.2

### Patch Changes

- 8e6e142: v2 Content Transforms
  - Major overhaul of the content transforms system, now allowing a `transforms` prop to be passed to the `getContentfulEntries` action which replaces the pattern of hooking the `contentTransform` lifecycle.
  - New `cacheTransformed` client option added to allow caching of transformed content.
  - New `cacheKeyExtensions` client option added to allow for additional cache keys for transformed content.
  - New `enableSnapshots` option passed through `context` to allow for snapshotting each transform's resulting content node tree.
- Updated dependencies [8e6e142]
  - @pfx/gasket-plugin-content@2.1.0-canary.2
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
  - @pfx/gasket-plugin-content@2.1.0-canary.1
  - @pfx/content-nodes@2.1.0-canary.1

## 1.2.0

- Cache initial content nodes ([#376])

## 1.1.1

- Fix preview flag type to be boolean ([#374])

## 1.1.0

- Allow --preview flag to use preview API ([#373])

## 1.0.0

- First major release

## 0.15.2

- Add env override parameter ([#366])
- Consolidate Contentful preview configs ([#367])

## 0.15.1

- Opt for dynamic import of `@pfx/gasket-content` ([#364])

## 0.15.0

- Update NPM registry to use Artifactory SaaS ([#362])

## 0.14.0

- Support for querying any contenttype entry by any field match thru orverrides
  in contentData.params prop. ([#355])

## 0.13.0

- Support for reference match source configuration ([#354])
- Improved mapping of entry and asset hyperlink types
- Improved debug-content command logging

## 0.12.0

- Support for debug-content command ([#349])

## 0.9.3

- Improve error handling/messaging for misconfigurations ([#345])

## 0.8.3

- Logging contentful requests and content errors ([#339])

## 0.8.1

- Support Contentful Assets ([#336])

## 0.7.0

- Transform embedded entry blocks ([#329])
- Support for custom RichText mapping ([#331])

## 0.6.7

- add context to `toContentNodes`, allow for preview context param, expose
  `_previewId` ([#327])

## 0.6.4

- add preview api config check ([#323])

## 0.6.3

- add support for Contentful queries by locale ([#322])

## 0.6.0

- [[FOSS-77]] Add `debug-contentful` command ([#313])

## 0.5.0

- Add `contentfulContentTransform` lifecycle ([#308])

## 0.4.3

- Adjust query parameters in SDK call ([#309])

## 0.4.2

- Lift space-specific content transform to example pattern library plugin
  ([#305])

## 0.4.1

- Fixes to content type checks and debug output paths ([#303])

## 0.4.0

- Normalize content entries as content nodes ([#278])

<!-- LINKS -->

[foss-77]: https://godaddy-corp.atlassian.net/browse/FOSS-77
[#278]: https://github.com/gdcorp-uxp/pfx-storefront/pull/278
[#303]: https://github.com/gdcorp-uxp/pfx-storefront/pull/303
[#305]: https://github.com/gdcorp-uxp/pfx-storefront/pull/305
[#308]: https://github.com/gdcorp-uxp/pfx-storefront/pull/308
[#309]: https://github.com/gdcorp-uxp/pfx-storefront/pull/309
[#313]: https://github.com/gdcorp-uxp/pfx-storefront/pull/313
[#322]: https://github.com/gdcorp-uxp/pfx-storefront/pull/322
[#323]: https://github.com/gdcorp-uxp/pfx-storefront/pull/323
[#327]: https://github.com/gdcorp-uxp/pfx-storefront/pull/327
[#329]: https://github.com/gdcorp-uxp/pfx-storefront/pull/329
[#331]: https://github.com/gdcorp-uxp/pfx-storefront/pull/331
[#336]: https://github.com/gdcorp-uxp/pfx-storefront/pull/336
[#339]: https://github.com/gdcorp-uxp/pfx-storefront/pull/339
[#345]: https://github.com/gdcorp-uxp/pfx-storefront/pull/345
[#349]: https://github.com/gdcorp-uxp/pfx-storefront/pull/349
[#354]: https://github.com/gdcorp-uxp/pfx-storefront/pull/354
[#355]: https://github.com/gdcorp-uxp/pfx-storefront/pull/355
[#362]: https://github.com/gdcorp-uxp/pfx-storefront/pull/362
[#364]: https://github.com/gdcorp-uxp/pfx-storefront/pull/364
[#366]: https://github.com/gdcorp-uxp/pfx-storefront/pull/366
[#367]: https://github.com/gdcorp-uxp/pfx-storefront/pull/367
[#373]: https://github.com/gdcorp-uxp/pfx-storefront/pull/373
[#374]: https://github.com/gdcorp-uxp/pfx-storefront/pull/374
[#376]: https://github.com/gdcorp-uxp/pfx-storefront/pull/376
