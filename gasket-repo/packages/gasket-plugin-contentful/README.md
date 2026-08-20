# @godaddy/gasket-plugin-contentful

Gasket content source plugin that integrates with [Contentful client] to provide content via Contentful's [Delivery API] and [Preview API].

## Installation

#### Existing apps

```
npm i @godaddy/gasket-plugin-contentful
```

Modify `plugins` section of your `gasket.js`:

```diff
import { makeGasket } from 'gasket';
import pluginContent from '@godaddy/gasket-plugin-content';
+import pluginContentful from '@godaddy/gasket-plugin-contentful';

export default makeGasket({
  plugins: [
    pluginContent,
+   pluginContentful
  ]
});
```

## Configuration

The Gasket config can leverage environment variables for sensitive data
related to Contentful. These should be set up in a secrets manager for deployed
apps. For local development, you can utilize a `.env` shown in the example below.

First, configure any content sources to point to this plugin in the
[content plugins configuration]. Next, define the stacks for those content sources.

| Name                            | Description                                                          | Type     | Required  |
|---------------------------------|----------------------------------------------------------------------|----------| --------- |
| `contentful`                    | Contentful config object                                             | object   | ✅        |
| `contentful.spaces`             | Spaces config object                                                 | object   | ✅        |
| `contentful.spaces[spaceKey]`   | Unique identifier for a space                                        | string   | ✅        |
| `[spaceKey]`                    | Unique identifier for a space                                        | object   | ✅        |
| `[spaceKey].space`              | Space id                                                             | string   | ✅        |
| `[spaceKey].mainEnvironment`    | main environment for space                                           | string   | ✅        |
| `[spaceKey].deliveryToken`      | [Delivery API] access token                                  | string   | ✅        |
| `[spaceKey].previewToken`       | [Preview API] access token                                   | string   | ❌        |
| `[spaceKey].crossSpaceSource`   | Includes space credentials when resolving cross-space references     | boolean  | ❌        |
| `[spaceKey].contentSettings`    | Space-scoped content settings                                        | object   | ❌        |
| `[spaceKey].cacheTTL`           | Cache time to live for initial content in seconds (default: 120)     | number   | ❌        |
| `contentSettings.richText`      | [Custom RichText node map](#content-settings-richtext-configuration) | object   | ❌        |
| `contentSettings.asset`         | [Custom MIME type map](#content-settings-asset-configuration)        | object   | ❌        |
| `contentSettings.skipBadEntries` | Skip warning logs and preserve entries missing content in the content tree | boolean  | ❌        |
| `contentSettings.skipCrossSpaceErrors` | Skip warning logs and preserve unresolved cross-space references in the content tree | boolean  | ❌        |



#### Example configuration

For local development, you can use a [dotenv] to set up env variables for you
Contentful API keys.

By default `dotenv` is *NOT* included in a Gasket project.

```shell
npm install -D dotenv
```

Now in a `.env` file, add your Contentful secrets.

```
CONTENTFUL_SPACE_ID=abcd1234
CONTENTFUL_DELIVERY_TOKEN=abcd1234abcd1234abcd1234
CONTENTFUL_ENV=master
```

_You may need to also add `.env` to your `.gitignore` so you do not commit secrets!_

These environment variables can be named anything, which could be useful if your
app needs content from multiple spaces. With the env variables set, you can now
reference them in your `gasket.js` from `process.env`.

```js
// gasket.js
export default makeGasket({
  contentful: {
    spaces: {
      primary: {
        space: process.env.CONTENTFUL_SPACE_ID,
        mainEnvironment: process.env.CONTENTFUL_ENV,
        deliveryToken: process.env.CONTENTFUL_DELIVERY_TOKEN,
        // optionally adjust cache duration for initial content in seconds
        cacheTTL: 60,
      },
      secondary: {...},
      tertiary: {...}
    }
  },
  // Existing structure for environment configs
  environments: {
    prod: {
      // Configs will be merged in a given env
      // In the prod env this config will overwrite the above definition
      contentful: {
        spaces: {
          primary: {
            mainEnvironment: process.env.CONTENTFUL_ENV__PROD,
            deliveryToken: process.env.CONTENTFUL_DELIVERY_TOKEN__PROD,
          },
          secondary: {...},
          trinary: {...}
        }
      }
    },
  },
});
```

#### Preview configuration

To enable use of Contentful's [Preview API], add the `previewToken` to your space configuration. To use the [Preview API], pass the `isPreview` flag in the `clientOptions` object when calling the `getContentfulEntries` action.

```diff
// gasket.js
export default makeGasket({
  contentful: {
    spaces: {
      primary: {
        space: process.env.CONTENTFUL_SPACE_ID,
        mainEnvironment: process.env.CONTENTFUL_ENV,
        deliveryToken: process.env.CONTENTFUL_DELIVERY_TOKEN,
+       previewToken: process.env.CONTENTFUL_PREVIEW_TOKEN
      }
    }
  },
  environments: {...}
})
```

#### Cross-Space References

To use a space as a source for cross-space references, add the `crossSpaceSource` flag to the space configuration. This will include the space credentials when resolving cross-space references for both Delivery API and Preview API requests.

In this example, the `primary` space can resolve referenced entries from the `secondary` space.

```diff
// gasket.js
export default makeGasket({
  contentful: {
    spaces: {
      primary: {
        space: process.env.CONTENTFUL_PRIMARY_SPACE_ID,
        mainEnvironment: process.env.CONTENTFUL_PRIMARY_ENV,
        deliveryToken: process.env.CONTENTFUL_PRIMARY_DELIVERY_TOKEN,
        previewToken: process.env.CONTENTFUL_PRIMARY_PREVIEW_TOKEN
      },
      secondary: {
+       crossSpaceSource: true,
        space: process.env.CONTENTFUL_SECONDARY_SPACE_ID,
        mainEnvironment: process.env.CONTENTFUL_SECONDARY_ENV,
        deliveryToken: process.env.CONTENTFUL_SECONDARY_DELIVERY_TOKEN,
        previewToken: process.env.CONTENTFUL_SECONDARY_PREVIEW_TOKEN
      }
    }
  }
})
```

### Caching

By default, the plugin will cache the initial content response for 120 seconds.
This limits the frequency of requests to Contentful and the initial translation
of the response to content nodes. This is most useful for content used with
SSR pages.

Cache behavior is controlled through the `cacheOptions` parameter when calling the `getContentfulEntries` action. The plugin supports two cache strategies: `NO_STALE` (default) and `STALE_WHILE_REVALIDATE`. For detailed information on cache options and strategies, see the [Cache Options](#cache-options) section.

By default, every result is deep-cloned via `structuredClone` before it is
returned so that consumer code cannot accidentally mutate the shared cache.
This can be opted out of with the [`dangerouslyAllowMutation`](#cache-option-dangerouslyallowmutation) option.



### Content Settings: RichText Configuration
The plugin can take a custom mapping of RichText Contentful node types to a `string`, `function`, or `ContentNode`. This is done by passing a `richText` object to the `contentSettings` config.

Available Node Types:
* [Blocks](https://github.com/contentful/rich-text/blob/master/packages/rich-text-types/src/blocks.ts)
* [Inlines](https://github.com/contentful/rich-text/blob/master/packages/rich-text-types/src/inlines.ts)
* [Marks](https://github.com/contentful/rich-text/blob/master/packages/rich-text-types/src/marks.ts)


#### Example
```js
// gasket.js
import { BLOCKS, INLINES } from '@contentful/rich-text-types';

export default makeGasket({
  ...
  contentful: {
    spaces: {
      primary: {
        contentSettings: {
          richText: {
            [BLOCKS.HEADING_1]: ['span', { className: 'h1' }],
            [BLOCKS.EMBEDDED_ENTRY]: (part) => ['p', null, [part.data.target]],
          }
        }
      },
      secondary: {
        contentSettings: {
          richText: {
            [INLINES.EMBEDDED_ENTRY]: (part) => part.data.target,
            [INLINES.ENTRY_HYPERLINK]: 'CustomHyperlink'
          }
        }
      }
    }
  }
});
```

### Content Settings: Asset Configuration
The plugin can take a custom mapping of MIME types to a `string`, `function`, or `ContentNode`. This is done by passing an `asset` object to the `contentSettings` config.

Important Notes:
* Contentful allows all [IANA media types].
* The plugin only returns exact MIME type matches
* For more on Assets in Contentful, see the [Contentful Docs](https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/assets).

#### Example
```js
// gasket.js
export default makeGasket({
  ...
  contentful: {
    spaces: {
      primary: {
        // ... required primary space config
        contentSettings: {
          asset: {
            ['image/svg+xml']: (part) => part.fields,
          },
          // Optionally suppress warning logs
          skipBadEntries: true,
          skipCrossSpaceErrors: true
        }
      },
      secondary: {
        // ... required secondary space config
        contentSettings: {
          asset: {
            ['image/png']: (part) => ['CustomPNG', part.fields],
          }
        }
      }
    }
  }
});
```

### Content Settings: Skip Settings

The `skipBadEntries` and `skipCrossSpaceErrors` settings control both warning logs and content tree pruning:

- When these settings are `false` (default):
  - Warning logs are emitted for problematic entries
  - Bad entries or unresolved cross-space references are pruned from the content tree

- When these settings are `true`:
  - Warning logs are suppressed
  - The entries are preserved in the content tree, allowing you to handle them in your application code

This can be useful when you want to:
- Handle missing content or unresolved references gracefully in your UI
- Implement custom fallback behavior for these cases
- Debug content issues without removing the problematic nodes

## Action: `getContentfulEntries`

### Client Options
The Client Options allow control over how the Contentful client is set up for each action invocation.

#### Required Client Params
```ts
import type { ClientOptions } from '@godaddy/gasket-plugin-contentful';

// Required Options
const clientOptions: ClientOptions = {
  spaceKey: 'primary' // the space key defined in the gasket config
};
```

#### Optional Client Params
```ts
import type { ClientOptions } from '@godaddy/gasket-plugin-contentful';

const clientOptions: ClientOptions = {
  spaceKey: 'primary',
  environment: 'feature-env-1', // overrides of the mainEnvironment set in the config
  isPreview: true, // uses preview.contentful.com instead of cdn.contentful.com
  enablePagination: true, // enables pagination for the query (default: false)
  withAllLocales: true, // fetches all locales for every entry (default: false)
};
```

> **Note**: Cache-related options (`cacheTransformed`, `cacheKeyExtensions`, `dangerouslyCachePreview`) have been moved to `cacheOptions`. See the [Cache Options](#cache-options) section for details.

##### Client Option: `enablePagination`
Automatically paginates through results when fetching Contentful entries. This is useful for cases where the number of entries exceeds the limit set in the query.

##### Client Option: `withAllLocales`
This option allows you to fetch all locales for every entry that matches the query. Under the hood, this switches from `client.getEntries` to `client.withAllLocales.getEntries`.

This will create compatibility issues with other transforms that expect a single locale as all fields will map to props with keys for each locale. If you are using this option, you should ensure that your transforms are compatible with this structure. For more on this, see: [Multi-Locale Transform Example](#multi-locale-transform-example).


> Reference: [Contentful client chain modifiers](https://github.com/contentful/contentful.js/blob/master/README.md#client-chain-modifiers), introduced in `v10.0.0`

#### Overriding Client Params

Any client param can be overridden with the `overrides` by providing a valid [CreateClientParams] object.

> NOTE: the `X-Contentful-Resource-Resolution` header is set automatically and cannot be overridden.

```ts
import type { ClientOptions } from '@godaddy/gasket-plugin-contentful';

const clientOptions: ClientOptions = {
  spaceKey: 'primary',
  overrides: {
    // any valid CreateClientParams
  }
};
```

### Cache Options

The Cache Options allow control over how content is cached and served. Cache-related options have been moved from `clientOptions` to `cacheOptions` for better organization and explicit strategy selection.

#### Cache Options Overview

The `cacheOptions` parameter is optional and defaults to the `NO_STALE` strategy. You can specify a cache strategy and strategy-specific options:

```ts
import type { CacheOptions, CACHE_STRATEGY } from '@godaddy/gasket-plugin-contentful';

const cacheOptions: CacheOptions = {
  strategy: CACHE_STRATEGY.NO_STALE
};
```

#### Strategy: `NO_STALE` (default)

The `NO_STALE` strategy is the default caching behavior. Content is cached and served until the TTL expires, at which point a fresh fetch is required.

**Options:**
- `ttl` (optional): Cache time to live in seconds. Defaults to 120 seconds or the space config `cacheTTL` if set.

**Behavior:**
- Content is cached and served from cache until TTL expires
- After TTL expires, cache is invalidated and a fresh fetch is required
- No stale content is served

> **Note**: `maxFreshSeconds` and `maxStaleSeconds` are not allowed when using the `NO_STALE` strategy.

```ts
import type { CacheOptions, CACHE_STRATEGY } from '@godaddy/gasket-plugin-contentful';

const cacheOptions: CacheOptions = {
  strategy: CACHE_STRATEGY.NO_STALE,
  ttl: 120 // optional, defaults to 120 or space config cacheTTL
};
```

#### Strategy: `STALE_WHILE_REVALIDATE`

The `STALE_WHILE_REVALIDATE` strategy implements a stale-while-revalidate caching strategy. This allows serving stale content immediately while revalidating in the background, improving perceived performance.

**Options:**
- `maxFreshSeconds` (optional): Duration in seconds during which content is considered fresh. Defaults to 300 seconds (5 minutes).
- `maxStaleSeconds` (optional): Maximum duration in seconds that stale content can be served. Defaults to 3600 seconds (1 hour).

**Behavior:**
- **Fresh period** (0 to `maxFreshSeconds`): Content is served from cache without revalidation
- **Stale period** (`maxFreshSeconds` to `maxStaleSeconds`): Stale content is served immediately, revalidation happens in the background
- **After `maxStaleSeconds`**: Cache expires and a fresh fetch is required

> **Note**: `maxStaleSeconds` must be greater than `maxFreshSeconds`. The `ttl` option is not used with this strategy.

```ts
import type { CacheOptions, CACHE_STRATEGY } from '@godaddy/gasket-plugin-contentful';

const cacheOptions: CacheOptions = {
  strategy: CACHE_STRATEGY.STALE_WHILE_REVALIDATE,
  maxFreshSeconds: 300, // optional, defaults to 300 (5 minutes)
  maxStaleSeconds: 3600 // optional, defaults to 3600 (1 hour)
};
```

#### Base Cache Options

The following options apply to both cache strategies:

##### Cache Option: `cacheTransformed`

Using the `cacheTransformed` option, you can cache the transformed content for a given query. This is useful for cases where content is mostly static but transforms are expensive (e.g., requiring API calls).

```ts
import type { CacheOptions, CACHE_STRATEGY } from '@godaddy/gasket-plugin-contentful';

const cacheOptions: CacheOptions = {
  strategy: CACHE_STRATEGY.NO_STALE,
  cacheTransformed: true
  // cacheKeyExtensions is recommended to be used with this option
};
```

##### Cache Option: `cacheKeyExtensions`

The cache key is derived from the complete props object `{ clientOptions, cacheOptions, query, transforms }` passed to the `getContentfulEntries` action. When using the `cacheTransformed` option, you can extend the cache key by providing a `cacheKeyExtensions` object. This allows for more granular cache control based on details the transforms may vary by.

```ts
import type { CacheOptions, CACHE_STRATEGY } from '@godaddy/gasket-plugin-contentful';

const cacheOptions: CacheOptions = {
  strategy: CACHE_STRATEGY.NO_STALE,
  cacheTransformed: true,
  cacheKeyExtensions: {
    market: 'en-US',
    currency: 'USD'
  }
};
```

##### Cache Option: `dangerouslyAllowMutation`

By default every call to `getContentfulEntries` returns a **deep clone** of the
cached data so that downstream code can freely mutate the result without
corrupting the shared cache.  Deep cloning is performed with the built-in
[`structuredClone`](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone)
API rather than node-cache's `useClones` option, which is unmaintained and uses the outdated [`clone`](https://www.npmjs.com/package/clone) package
dependency that is less performant than `structuredClone` in modern Node.js runtimes.

If you are certain that your consuming code will **not**
mutate the returned `ContentData`, you can opt out of the clone overhead by
setting `dangerouslyAllowMutation: true`:

```ts
import type { CacheOptions, CACHE_STRATEGY } from '@godaddy/gasket-plugin-contentful';

const cacheOptions: CacheOptions = {
  strategy: CACHE_STRATEGY.NO_STALE,
  dangerouslyAllowMutation: true // ⚠️ returned object IS the cached reference
};
```

> **Warning**: When `dangerouslyAllowMutation` is `true`, any mutation of the
> returned object (including `contentNodes` or `debug`) will modify the cached
> copy and affect every subsequent consumer until the cache entry expires.
> Only enable this when you have validated that no downstream code mutates the
> result.

> **Note**: When transforms are provided without `cacheTransformed: true`,
> this option has no effect. The `getTransformedContent` action already
> performs a `structuredClone` before running transforms, and the transformed
> result is not cached — so the internal cache is never exposed to mutation
> regardless of this setting.

##### Cache Option: `dangerouslyCachePreview`

By default, content fetched from Contentful's [Preview API] is **not cached** to ensure you always see the latest unpublished changes. However, in some scenarios (such as high-traffic preview environments or when preview content changes infrequently), you may want to cache preview content to reduce API calls.

Setting `dangerouslyCachePreview: true` allows the plugin to cache preview content. This option is named "dangerous" because:
- Preview content is meant to show the latest unpublished changes
- Caching preview content means users may see stale, outdated drafts
- Changes made in Contentful may not appear immediately in your preview environment

**Use this option only when:**
- You understand the trade-offs between performance and content freshness
- You're in a controlled preview environment where slight staleness is acceptable

```ts
import type { CacheOptions, CACHE_STRATEGY } from '@godaddy/gasket-plugin-contentful';

const cacheOptions: CacheOptions = {
  strategy: CACHE_STRATEGY.NO_STALE,
  dangerouslyCachePreview: true // Enable caching for preview content
};
```

> **Note**: This option only affects requests where `isPreview: true` in `clientOptions`. It has no effect on non-preview requests, which are always cached by default.

#### Conditional Strategy Example

You can conditionally set the cache strategy based on context or other runtime conditions:

```ts
import type { CacheOptions, CACHE_STRATEGY } from '@godaddy/gasket-plugin-contentful';

const cacheOptions: CacheOptions = pageContext.swr
  ? {
      strategy: CACHE_STRATEGY.STALE_WHILE_REVALIDATE,
      maxFreshSeconds: 300,
      maxStaleSeconds: 3600
    }
  : {
      strategy: CACHE_STRATEGY.NO_STALE,
      ttl: 120
    };

const contentData = await gasket.actions.getContentfulEntries(
  { clientOptions, cacheOptions, query },
  context
);
```

### Querying
The plugin allows any queries that the [Contentful client] supports. The `getContentfulEntries` action uses the [client.getEntries] method.

For more information on querying, see the [Content Delivery API Search Parameters]


#### Simple Query
```ts
import type { Query } from '@godaddy/gasket-plugin-contentful';

const query: Query = {
  content_type: 'myContentType',
  'fields.slug': 'my-slug'
};

const contentData = await gasket.actions.getContentfulEntries({ clientOptions, query }, context);

```

#### Advanced Query Example -- Related Help Articles

In this example we'll look at how the `getContentfulEntries` action can be used can be used to fetch related help articles for a given article.

```ts
export function getServerSideProps(context) {
  const articleNumber = 42185;
  const allowedVisibilities = ['All Customers', '123 Reg'];

  const clientOptions: ClientOptions = {
    spaceKey: 'help-center',
  };

  const articleContentData = await gasket.actions.getContentfulEntries({
    clientOptions,
    query: {
      content_type: 'article',
      'fields.number': articleNumber,
      limit: 1,
      include: 10
    }
  }, context);

  const articlePrimaryProductId = getPrimaryProduct(articleContentData); // 1000003 (Domains Product ID)
  const articleTitle = getArticleTitle(articleContentData); // 'How do I add 301 (Permanent) Web forwarding?'

  const relatedContentData = await gasket.actions.getContentfulEntries({
    clientOptions,
    query: {
      content_type: 'article',
      'fields.number[ne]': articleNumber, // ensure we don't get the same article
      'fields.visibility[in]': allowedVisibilities.join(','),
      links_to_entry: articlePrimaryProductId, // ensure only see articles for the same product
      query: articleTitle, // searches all fields from possible entries and fuzzy matches the title
      limit: 5,
      include: 1,
    }
  }, context);

  return {
    props: {
      articleContentData,
      relatedContentData
    }
  };
}
```

### Transforms

The `getContentfulEntries` action accepts an array of `transforms` that it passes to the `getTransformedContent` action provided by `@godaddy/gasket-plugin-content`.

These need to adhere to the spec defined by [@godaddy/gasket-plugin-content].

```ts
import type { Props } from '@godaddy/gasket-plugin-contentful';
import gasket from '@/gasket.js';
import { customTransform, otherTransform } from './transforms';

const condition = true;

const context = {
  // debug option to include the result from each transform in the output
  // not recommended for production
  // enableSnapshots: true
};

const props: Props = {
  clientOptions: {
    spaceKey: 'primary'
  },
  query: {
    content_type: 'page',
    'fields.slug': 'home'
  },
  transforms: [
    condition ? customTransform : otherTransform
  ]
};

const { contentNodes, debug } = await gasket.actions.getContentfulEntries(props, context);
```

#### Multi-Locale Transform

### Multi-Locale Transform Example

If content is fetched from Contentful using the [withAllLocales](#client-option-withalllocales) These transforms expect a rigid prop structure in the content nodes where each prop is an object with keys for each locale. If transforms are chained, it's important to maintain this structure until the final transform.

```json
[
  "SomeComponent",
  {
    "message": {
      "en-US": "Hello",
      "fr-FR": "Bonjour"
    },
    "active": {
      "en-US": false,
      "fr-FR": true
    }
  },
  []
]
```

```ts
import { traverse, TraversalDelegate, PartType } from '@godaddy/gasket-content-nodes';
import type { ContentTransform } from '@godaddy/gasket-plugin-content';

const delegate: TraversalDelegate = (part: any, partType: PartType) => {
  // override fr-FR active only
  if (partType !== PartType.node) return part;
  const [name, props, children] = part;
  if (props.active['fr-FR'] === true) {
    props.active['fr-FR'] = false;
  }
  // Always return the part or it will be removed
  return part;
};

export const transformExample: ContentTransform = {
  name: 'example',
  handler: async (gasket, contentNodes, context) => {
    // use traversal delegate
    return traverse(contentNodes, delegate);
  }
};
```

## Using on a preview page

#### Create ServerSide Page(s)
In order to support the preview, create a Next page using `getServerSideProps`. The server-side rendered page(s) directory structure should mirror the browser routing directory structure if it exists.

##### Example
```js
/pages
  // needed for static rendered pages
  [plid]
    [market]
      [currency]
        [experiments]
          contentful
            [...slug].tsx

  // necessary for browser routing
  contentful
    [...slug].tsx

  // necessary for GSSP/preview differences
  preview
    contentful
      [...slug].tsx
```

The server-side rendered preview page would then look like:
```jsx
// Example of the pattern library with Contentful
import * as ComponentMap from '@godaddy/pattern-library';
import { toReactNode } from '@godaddy/gasket-content-components';
import { ContentData } from '@godaddy/gasket-plugin-content';
import { ClientOptions, Query } from '@godaddy/gasket-plugin-contentful';
import gasket from '@/gasket.js';

function Page(props: { contentData: ContentData }) {
  const { contentNode } = props.contentData;
  const pageNode = contentNode[0];

  return (
    toReactNode(pageNode, ComponentMap)
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const path = ['', ...slug].join('/');
  const spaceKey = 'primary'; // defined in gasket config

  const clientOptions: ClientOptions = {
    spaceKey,
    isPreview: true
  };

  const query: Query = {
    limit: 1,
    include: 10,
    content_type: 'page',
    'fields.slug': path
  };

  const contentData = await gasket.actions.getContentfulEntries({ clientOptions, query }, context);

  return {
    props: {
      contentData
    }
  };
}

export default Page;

```

#### Next Prehandling Lifecycle Rewrites
In order to allow for easy preview functionality, you can add rewrite support for a query param via the app-level `nextPreHandling` lifecycle definition. The preview will also be available at the route resulting from the defined directory structure above. Static page rewrites can be defined here to simplify paths - [nextPreHandling docs]

```js
// lifecycles/next-pre-handling.js
module.exports = async function nextPreHandling(gasket, { req, res }) {
  // Allows for a query param to rewrite
  if (req.query.preview && !req.url.startsWith('/preview')) {
    req.url = '/preview' + req.url;
    return;
  }
};
```

#### Result
```js
// Preview directly acessible
/preview/contentful/hello-world

// After defining static page rewrites
/contentful/hello-world -> /1/en-US/contentful/hello-world
/contentful/hello-world?preview=true -> /preview/contentful/hello-world

// To change plid add query param during preview
/contentful/hello-world?preview=true&plid=1234
/preview/contentful/hello-world?plid=1234
```


## References
- [Contentful JavaScript SDK](https://www.contentful.com/developers/docs/javascript/)
- [Delivery API]
- [Preview API]
- [contentful.js](https://github.com/contentful/contentful.js)
- [contentful-resolve-response](https://www.npmjs.com/package/contentful-resolve-response)
- [rich-text-html-renderer](https://github.com/contentful/rich-text/tree/master/packages/rich-text-html-renderer)

<!-- Links -->
[Contentful]:https://www.contentful.com/
[Contentful client]: https://www.npmjs.com/package/contentful
[Delivery API]:https://www.contentful.com/developers/docs/references/content-delivery-api/
[Preview API]: https://www.contentful.com/developers/docs/references/content-preview-api/
[relational queries]: https://www.contentful.com/developers/docs/concepts/relational-queries/
[content plugins configuration]: /packages/gasket-plugin-content/README.md#configuration
[contentTransform]: /packages/gasket-plugin-content/README.md#contenttransform
[nextPreHandling docs]: /packages/gasket-content/README.md#setupRewrite
[getContentData]: /packages/gasket-content#getcontentdata
[@godaddy/gasket-content]: /packages/gasket-content
[@godaddy/gasket-plugin-content]: /packages/gasket-plugin-content
[CreateClientParams]: https://contentful.github.io/contentful.js/contentful/11.5.1/interfaces/CreateClientParams.html
[Content Delivery API Search Parameters]: https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/search-parameters
[client.getEntries]: https://contentful.github.io/contentful.js/contentful/11.5.1/interfaces/ContentfulClientApi.html#getEntries
[IANA media types]: https://www.iana.org/assignments/media-types/media-types.xhtml
