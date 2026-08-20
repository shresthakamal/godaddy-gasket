# Content Sources Guide

"Content source plugins" is a broad term for any Gasket plugin that provides
content data for page content. These plugins hook the [contentData] lifecycle,
which is executed when a page invokes the [getContentData] build
function.

The [contentData] lifecycle is responsible for reaching out to a CMS or
other content source and normalizing the results into [ContentNodes].

## Content Data

For a plugin to provide content data for a page, it must hook into the
contentData lifecycle. The behavior of this lifecycle is a bit of a shift
from typical Gasket lifecycles in that only one plugin gets hooked at a time.
Why? An app can have multiple CMS to talk to, so part of the criteria for
executing [getContentData] is telling it which content source to use. Content
sources are configured to map to a particular plugin in the Gasket app.

### Configurations

When authoring a plugin to hook the `contentData`, include the
config requirements in the plugin's readme. If your plugin communicates with
multiple endpoints and requires additional config, please document this as well.

For reference, check out the [Contentful] or [Contentstack] plugins.  
These plugins allow connecting to multiple sources; "spaces" in Contentful and
"stacks" Contentstack. Each source requires unique API credentials to
be configured by an app.

For example, let's say we are building a WordPress content plugin. Even though
an app typically only requires access to a single headless WordPress API, it is
a good idea to allow access to multiple sources. Consider this example:

```js
// gasket.config.js
module.exports = {
  content: {
    sources: {
      primary: '@some/gasket-plugin-wordpress',
      secondary: '@some/gasket-plugin-wordpress'
    }
  },
  wordpress: {
    sources: {
      primary: {
        endpoint: 'https://some.wordpress.api',
        apiKey: process.env.MAIN_API_KEY
      },
      secondary: {
        endpoint: 'https://some.other.wordpress.api',
        apiKey: process.env.SECONDARY_API_KEY
      }
    }
  }
}
```

Now, when a page requests content with `getContentData` set to `primary`, the
WordPress plugin knows to execute the `contentData` lifecycle hook, so it can
determine which API URL and key it should use.

```ts
export default async function contentData(
  gasket: Gasket,
  { source, path }: ContentDataProps,
  context: ContentContext
): Promise<ContentData> {
  const { endpoint, apiKey } = gasket.config.wordpress[source];
  const url = endpoint + path

  const data = await fetch(url, {
    headers: {
      Authorization: apiKey
    }
  })

  const contentNode = transformToContentNodes(data)

  return {
    source,
    context,
    contentNode
  };
}
```

### Transformations

In addition to their syntax, content source APIs could respond in various
formats, such as XML or JSON. A plugin's `contentData` lifecycle hook is
responsible for normalizing this data as `ContentNodes`. This is a
straightforward JSON-serializable object model representing a DOM tree
renderable as React components.

As in the above example, the lifecycle hook needs to return a `ContentData`
object with a `contentNodes` property. In this property, the
transformed CMS data (from WordPress in our example) is categorized by where it
is placed in the document. For instance, a typical example would include
a `head` prop with `ContentNodes` rendered in the document head and a `sections`
prop with `ContentNodes` mapping to React components for each section, rendered
within the document body.

## Content Services

Sometimes content is dynamic, and cannot be defined entirely in the CMS.
In these cases, service setup content can be described in the CMS, normalized
to `contentNodes`. These `contentNodes` could either be transformed by service
plugin during server-side rendering (forward), or be rendered as React
components that can fetch dynamic values from the browser (deferred).

See the [Content Services Guide] for more details.

[contentData]: /packages/gasket-plugin-content/README.md#contentdata
[ContentNodes]: /packages/gasket-plugin-content/README.md#contentnodes
[getContentData]: /packages/gasket-content/README.md#getcontentdata
[Contentful]: /packages/gasket-plugin-contentful/README.md
[Contentstack]: /packages/gasket-plugin-contentstack/README.md
[Content Services Guide]: /packages/gasket-plugin-content/docs/content-services.md
