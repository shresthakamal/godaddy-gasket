# Dynamic Imports

While this guide focuses on importing SVGs to be [rendered inline] which have
been transformed to React components using a tool such as [SVGR]. However, the
same guidelines apply for any other React component you make wish to dynamically
import in your app.

## Basics

Let's start with a normal import and declaration of a SVG transformed to a
component in an example page.

```jsx harmony
// pages/example.js
import SomeGraphic from '../graphics/some-graphic';

const ExamplePage = () => (
  <>
    <h1>My Example Page</h1>
    <SomeGraphic />
  </>
);

export default ExamplePage;
```

Your graphic component will be bundled with Webpack as any other React
component, in this case, with the page chunk. Additionally, the SVG will be
rendered on the server and served with the initial html.

This can either be good, or bad. Good to avoid downloading and rendering the SVG
after the page is loaded causing the page to "pop". Bad if the SVG is very
large, thus causing a "double download" of the SVG with the webpack chunk.

Now, let us look at a few approaches using [next/dynamic] for optimizations
depending on its performance needs and SVG content.

## Code Split

If you want to split out the component to a separate chunk, you can do so with
[next/dynamic].

```diff
// pages/example.js
- import SomeGraphic from '../graphics/some-graphic';
+ import dynamic from 'next/dynamic';
+ const SomeGraphic = dynamic(() => 
+   import('../graphics/some-graphic')
+ );

const ExamplePage = () => (
  <>
    <h1>My Example Page</h1>
    <SomeGraphic />
  </>
);

export default ExamplePage;
```

If your page code changes frequently, but the graphic component does not, this
could be an optimization for caching since the graphic chunk hash won't change
between builds.

This will continue to server side render (SSR), allowing for a fast first paint,
but again, may not be the best for bandwidth performance if the SVG is very
large and causing the "double download".

## Disable Server Render

If you do not want to render the component during SSR, you can [disable SSR] for
the dynamic import.

```diff
// pages/example.js
import dynamic from 'next/dynamic';
const SomeGraphic = dynamic(() => 
  import('../graphics/some-graphic'),
+  { ssr: false }
);

const ExamplePage = () => (
  <>
    <h1>My Example Page</h1>
    <SomeGraphic />
  </>
);

export default ExamplePage;
```

Now, the component will be loaded and rendered later, after the first paint.
However now, there is the chance that elements on the page may shift when it
does render, causing the dreaded "page pop".

## Use Placeholder

To avoid popping when your dynamic component loads, set a
[custom loading component] that is the same size as your graphic, to be used as
an empty placeholder.

```diff
// pages/example.js
import dynamic from 'next/dynamic';
const SomeGraphic = dynamic(() => 
  import('../graphics/some-graphic'),
-  { ssr: false }
+  { loading: () => <svg width='100' height='50' /> }
);

const ExamplePage = () => (
  <>
    <h1>My Example Page</h1>
    <SomeGraphic />
  </>
);

export default ExamplePage;
```

This also can be useful to avoid popping for changing pages when routing in the
browser.

<!-- LINKS -->

[SVGR]: https://react-svgr.com
[next/dynamic]: https://nextjs.org/docs/advanced-features/dynamic-import
[disable SSR]: https://nextjs.org/docs/advanced-features/dynamic-import#with-no-ssr
[custom loading component]: https://nextjs.org/docs/advanced-features/dynamic-import#with-custom-loading-component
[rendered inline]: static-assets.md#inlining
