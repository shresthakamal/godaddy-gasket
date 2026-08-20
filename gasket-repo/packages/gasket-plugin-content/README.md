# @godaddy/gasket-plugin-content

Gasket plugin which manages the gathering of content from CMS sources.

## Installation

#### Existing apps

```
npm i @godaddy/gasket-plugin-content
```

Modify `plugins` section of your `gasket.js`:

```diff
import { makeGasket } from 'gasket';
+ import pluginContent from '@godaddy/gasket-plugin-content';

export default makeGasket({
  plugins: [
+   pluginContent
  ]
});
```

## Usage

As above, content sources are where the primary page content should come from. In general, this would be a CMS such as [Contentful] via [@godaddy/gasket-plugin-contentful].

In order to integrate with a new CMS, a content source plugin should be authored
according to the [Content Sources Guide].

Sometimes, certain content can be dynamic, provided by a service. These
scenarios can be handled by authoring plugins and components per the
[Content Services Guide].


## Action: `getTransformedContent`

Content source plugins can call this action to transform [content nodes].

```ts
import gasket from './gasket.js';
import { transformChangeActive } from './transforms/change-active.js';

// from a content source
const contentData = {
  contentNodes: [
    ['SomeComponent', { active: false }, []]
  ]
};

const transforms = [transformChangeActive];

const context = {
  // any context needed by the transforms
};

const transformed = await gasket.actions.getTransformedContent(transforms, contentData, context);

console.log(transformed);
// [
//   ['SomeComponent', { active: true }, []]
// ]
```

## Content Transforms

### Content Transform Example

```ts
import { traverse, TraversalDelegate, PartType } from '@godaddy/gasket-content-nodes';
import type { SingleLocaleTransform } from '@godaddy/gasket-content-plugin';
import { apiCall } from './service';

const delegate: TraversalDelegate = (part: any, partType: PartType) => {
  // rename a component
  if (partType === PartType.name) {
    if (part === 'SomeComponent') {
      return 'DifferentComponent';
    }
  }
  // adjust a prop
  if (partType === PartType.props) {
    if (part.active === false) {
      return { ...aPart, active: true };
    }
  }
  // Always return the part or it will be removed
  return part;
};

export const transformExample: SingleLocaleTransform = {
  name: 'example',
  handler: async (gasket, contentNodes, context) => {
    // use traversal delegate
    contentNodes = traverse(contentNodes, delegate);

    // insert some content from a service
    const [name, props, children] = contentNodes[0];
    const footer = await apiCall();
    props.footer = footer;

    return [
      [name, props, children]
    ];
  }
};
```

## Exported Transforms

### Collapse Child Strings

Collapses children strings into a single string.

```json
[
  "SomeComponent",
  null,
  [
    "Hello ",
    "World",
  ]
]
```

```json
[
  "SomeComponent",
  null,
  [
    "Hello World"
  ]
]
```

#### Usage

```ts
import { transformCollapseChildStrings } from '@godaddy/gasket-plugin-content/transforms/collapse-child-strings';
import gasket from './gasket.js';

...

const context = {
  // any context needed by the transforms
};

const props = {
  clientOptions: {
    // client options
  },
  query: {
    // query
  },
  transforms: [
    transformCollapseChildStrings,
    // ... other transforms
  ]
};

// action from @godaddy/gasket-plugin-contentful
const contentData = await gasket.actions.getContentfulEntries(props, context);
```

### Encoded Strings

Moves strings with [HTML entities] into an [HtmlWrapper component].

```json
[
  "SomeComponent",
  null,
  [
    "&quot;Hello World&quot;"
  ]
]
```

```json

[
  "SomeComponent",
  null,
  [
    [
      "HtmlWrapper",
      {
        "html": "&quot;Hello World&quot;"
      }
    ]
  ]
]
```

#### Usage

```ts
import { transformEncodedStrings } from '@godaddy/gasket-plugin-content/transforms/collapse-child-strings';
import gasket from './gasket.js';

...

const context = {
  // any context needed by the transforms
};

const props = {
  clientOptions: {
    // client options
  },
  query: {
    // query
  },
  transforms: [
    transformEncodedStrings,
    // ... other transforms
  ]
};

// action from @godaddy/gasket-plugin-contentful
const contentData = await gasket.actions.getContentfulEntries(props, context);
```



[content nodes]: /packages/content-nodes
[Content Sources Guide]: /packages/gasket-plugin-content/docs/content-sources.md
[Content Services Guide]: /packages/gasket-plugin-content/docs/content-services.md
[@godaddy/gasket-content]: /packages/gasket-content
[Contentful]: https://www.contentful.com/
[@godaddy/gasket-plugin-contentful]: /packages/gasket-plugin-contentful
[HTML entities]: https://developer.mozilla.org/en-US/docs/Glossary/Character_reference
[HtmlWrapper component]: /packages/gasket-content-components/src/components/defaults.tsx
