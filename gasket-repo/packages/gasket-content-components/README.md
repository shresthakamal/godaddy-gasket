# @godaddy/gasket-content-components

## Functions

### withContentParamsProvider

Higher-order component to wrap the Next.js App to provide the `params` property from `contentData` via React context.

```tsx
// pages/_app.tsx

import { App } from '@godaddy/gasket-next';
import { withContentParamsProvider } from '@godaddy/gasket-content-components';

export default withContentParamsProvider()(App);
```

The `params` property can be accessed in React components through the `useContentParams` React hook.

```tsx
// pages/example.tsx

import React from 'react';
import { toReactNode } from '@godaddy/gasket-content-components';
import type { ContentData, useContentParams } from '@godaddy/gasket-content-components';
import { getContentData } from '@godaddy/gasket-content';

function ExamplePage(props: { contentData: ContentData }) {
  const { contentNode } = props.contentData;
  const contentparams = useContentParams();

  return (
    <div>
      <h1>Content example</h1>
      { contentparams.myValue }
      { toReactNode(contentNode, componentMap) }
    </div>
  );
}

export async function getStaticProps(context) {
  const contentData = await getContentData({ source: 'example', path: '/content-example' }, context);

  return {
    props: {
      contentData
    }
  };
}

export default ExamplePage;
```

### toReactNode

Process and convert a [ContentNode] tree to React nodes.

#### Basic example

```jsx
import { toReactNode } from '@godaddy/gasket-content-components';
import CustomButton from '../components/custom-button';

const componentMap = {
  Button: CustomButton
};

const contentNode = ['Button', { className: 'btn btn-sm' }, ['Submit']];

const reactNode = toReactNode(contentNode, componentMap);

results = <CustomButton className="btn btn-sm">Submit</CustomButton>;
```

#### Namespaced example

The component map can support nested objects to allow for namespacing of
components as well.

```jsx
import { toReactNode } from '@godaddy/gasket-content-components';
import CustomButton from '../components/custom-button';
import UXButton from '@ux/button';

const componentMap = {
  Button: CustomButton,
  ux: {
    button: UXButton
  }
};

const contentNode = ['Fragment', null, [
  ['Button', { className: 'btn btn-sm' }, ['Submit']],
  ['ux.Button', { text: 'Submit' }]
]];

const reactNode = toReactNode(contentNode, componentMap);

results = <>
  <CustomButton className='btn btn-sm'>Submit</CustomButton>,
  <UXButton text='Submit'/>
</>
```

#### Fallback example

If a ContentNode name is not found in the componentMap, and is a lowercase html
or custom-element tag, then it will be handled as such.

```jsx
import { toReactNode } from '@godaddy/gasket-content-components';

const contentNode = ['Fragment', null, [
  ['button', { className: 'btn btn-sm' }, ['Submit']],
  ['custom-button', { text: 'Submit' }]
]]

const reactNode = toReactNode(contentNode, {});

results = <>
  <button className='btn btn-sm'>Submit</button>,
  <custom-button text='Submit'/>
</>
```

#### HOC/Wrapper

The `toReactNode` function allows for an optional `hoc` callback. This allows for the wrapping of the `contentNode(s)` if applicable.

```jsx
import { toReactNode } from '@godaddy/gasket-content-components';
import CustomButton from '../components/custom-button';
import CustomWrapper from '../components/custom-wrapper';

const componentMap = {
  Button: CustomButton
};

const contentNode = ['Button', { className: 'btn btn-sm' }, ['Submit']]

function hoc(Component: ComponentType) {
  return function Wrapper(props: any) {
    return (
      <CustomWrapper className='wrapper'>
        <Component className={props.className} />
      </CustomWrapper>
    )
  }
}

const reactNode = toReactNode(contentNode, componentMap, hoc)

results =
  <CustomWrapper className='wrapper' >
    <CustomButton className='btn btn-sm'>Submit</CustomButton>
  </CustomWrapper>
```

### toFlattenedContent

Recursively flattens content node tuples (both 2-element and 3-element) to plain JSON objects throughout the entire data structure.

- Converts: `["ComponentName", {props}]` → `{props}`
- Converts: `["ComponentName", {props}, [children]]` → `{...props, children: [children]}`
- Recursively flattens nested tuples inside object properties and arrays
- All tuples are flattened recursively, including nested tuples within children
- Does NOT evaluate rules - it only flattens the structure

#### Basic example

```ts
import { toFlattenedContent } from '@godaddy/gasket-content-components/to-flattened-content';
import gasket from './gasket.js';

const contentData = await gasket.actions.getContentfulEntries(props, context);
const contentObjects = toFlattenedContent(contentData.contentNodes);
```

#### 2-element tuples

```ts
const contentNodes = [
  ['Product', { id: 1, name: 'Widget' }],
  ['Product', { id: 2, name: 'Gadget' }]
];

const flattened = toFlattenedContent(contentNodes);
// Result: [{ id: 1, name: 'Widget' }, { id: 2, name: 'Gadget' }]
```

#### 3-element tuples with children

```ts
const contentNodes = [
  ['Container', { className: 'box' }, [
    ['Item', { id: 1 }],
    ['Item', { id: 2 }]
  ]]
];

const flattened = toFlattenedContent(contentNodes);
// Result: [{ className: 'box', children: [{ id: 1 }, { id: 2 }] }]
```

#### Nested tuples in object properties

The function recursively flattens tuples nested inside object properties:

```ts
const contentNodes = [
  ['Index', {
    entryId: '123',
    name: 'Index',
    featureFlagList: ['FeatureFlagList', {
      entryId: '456',
      name: 'Feature Flag List',
      items: [
        ['FeatureFlag', { entryId: '789', key: 'flag1' }],
        ['FeatureFlag', { entryId: '790', key: 'flag2' }]
      ]
    }],
    beacon: ['ActionBeacon', { entryId: '791', name: 'Beacon' }]
  }]
];

const flattened = toFlattenedContent(contentNodes);
```

#### Nested structures with children

The function recursively flattens nested tuples within props and children:

```ts
const contentNodes = [
  ['Parent', { name: 'Parent' }, [
    ['Child', { name: 'Child' }]
  ]]
];

const flattened = toFlattenedContent(contentNodes);
// Result: [{ name: 'Parent', children: [{ name: 'Child' }] }]
```

#### Null props handling

ContentNodes with `null` props are converted to empty objects:

```ts
const contentNodes = [['Component', null]];
const flattened = toFlattenedContent(contentNodes);
// Result: [{}]
```

#### Children handling

**3-element tuples with children** are flattened to objects with a `children` property:

```ts
const contentNodes = [
  ['Parent', { name: 'Parent' }, [
    ['Child', { name: 'Child' }]
  ]]
];

const flattened = toFlattenedContent(contentNodes);
// Result: [{ name: 'Parent', children: [{ name: 'Child' }] }]
```

**Empty children arrays** are included as `children: []`:

```ts
const contentNodes = [['Component', { name: 'Test' }, []]];
const flattened = toFlattenedContent(contentNodes);
// Result: [{ name: 'Test', children: [] }]
```

**Undefined children** are not included in the flattened object:

```ts
const contentNodes = [['Component', { name: 'Test' }, undefined]];
const flattened = toFlattenedContent(contentNodes);
// Result: [{ name: 'Test' }]
```

#### Edge cases

The function handles various input types:

- **Null input** returns `null`:
  ```ts
  toFlattenedContent(null); // Result: null
  ```

- **Undefined input** returns `undefined`:
  ```ts
  toFlattenedContent(undefined); // Result: undefined
  ```

- **Empty arrays** return empty arrays:
  ```ts
  toFlattenedContent([]); // Result: []
  ```

- **Primitive values** (string, number, boolean) are returned as-is:
  ```ts
  toFlattenedContent('text'); // Result: 'text'
  toFlattenedContent(42); // Result: 42
  toFlattenedContent(true); // Result: true
  ```

#### Usage

```ts
import { toFlattenedContent } from '@godaddy/gasket-content-components';
import gasket from './gasket.js';

const context = {
  // any context needed
};

const props = {
  clientOptions: {
    // client options
  },
  query: {
    // query
  }
};

// Get content data
const contentData = await gasket.actions.getContentfulEntries(props, context);

// Flatten ContentNodes to plain objects
const contentObjects = toFlattenedContent(contentData.contentNodes);
```

#### Use cases

- API responses that need plain objects instead of ContentNode tuples
- Serialization for storage or transmission
- Data processing scenarios (e.g., Notifications/Renewals)
- When you need flattened objects for rendering without React components

**Note:** This function returns plain objects that are NOT compatible with `toReactNode()` or other ContentNode-based renderers.

[toReactNode]: #toreactnode
[toFlattenedContent]: #toflattenedcontent
[ContentNode]: /packages/gasket-content-nodes#contentnodes
[ContentNodes]: /packages/gasket-content-nodes#contentnodes
