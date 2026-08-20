# Static Assets

**DEPRECATED** — _Only applies to apps using Next 10._ Instead, utilize
[next/image] for static image assets when using more recent versions.

There are two basic approaches for using and delivering static assets in your
app by either [bundling] or [serving]. For SVG assets, you have the additional
option of [inlining].

## Bundling

The UXP plugin pre-configures a Webpack loader to handle static image files so
that they are bundled when you `import` or `require` them directly in your app
(Components or Next.js pages). It supports the following file extensions:

- `jpeg`
- `jpg`
- `png`
- `gif`
- `webp`

```js
import headerimage from '../static/headerimage.jpg';

export default function Header() {
  return (
    <div className='hero-header'>
      <img src={ headerimage } />
    </div>
  );
}
```

When you `import` or `require` the images, the loader will automatically
determine if the file is small enough to get included with the JavaScript bundle
in base64 format. File that are too big will automatically be added to Webpack
output directory for static files using a fingerprinted (hashed) filename.

The file size limit that is used to determine if files need to be bundled can be
configured in your `gasket.js` by adding an `assets` object:

```js
{
  assets: {
    limit: 8192 // Maximum size in bytes after being transformed into base64.
  }
}
```

## Serving

Additionally, Next.js supports serving static files instead of having them
bundled should you choose to. Create a `static/` folder in the project's root
directory. Files in here will be served and accessible using the `/static/`
pathname:

```js
export default function PageName() {
  return <img src="/static/my-image.png" alt="my image" />
}
```

While it's possible to reference images files directly in the static folder as
well as seen in the example above, we advise you to use the `import/require`
method instead so the files will be automatically optimized.

## Inlining

For SVGs, you may find it useful to inline them with your React code. This will
allow them to be rendered server side and share CSS classes when
[white labeling] apps for reseller support.

For SVGs to be rendered inline, you can use a tool like [SVGR] to transform them
into React components with optimization. These can then be imported and used
like you would any other type of component. With this approach, you have several
options for importing and bundling as explained in the [dynamic imports guide].

<!-- LINKS -->

[bundling]: #bundling
[serving]: #serving
[inlining]: #inlining

[white labeling]: white-labeling.md
[dynamic imports guide]: dynamic-imports.md

[SVGR]: https://react-svgr.com
[next/image]: https://nextjs.org/docs/api-reference/next/image
