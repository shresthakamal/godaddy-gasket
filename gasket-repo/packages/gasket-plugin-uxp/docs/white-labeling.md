# White Labeling

The white labeling of an app allows it to be utilized under different reseller
brands, meaning it is not limited to GoDaddy. Branding involves not only colors,
but also elements like border corners and fonts.

## Why I should care

There are several in-house and EMEA [reseller brands] that your app may need to
serve under.

Even if your product is not intended to be used by resellers, implementing these
white labeling best practices will ensure consistency with other apps being
developed, plus puts your app ahead for any core GoDaddy rebranding efforts that
may occur.

## How to do it

There are a few simple rails to stay on to allow your app to be easily
white-labeled.

### Styles

#### DO use UXCore2 components

Prefer to use existing components from `@ux/uxcore2` as much as possible. These
have gone through the design ringer and are already set up to be white-labeled.
If there are cases where you do need some custom component for your app, then
make sure most, if not all, of the styling, comes from existing UXCore2 class
names.

#### DO use UXCore2 class names

Rather than inventing new class names for styling your app's custom components,
as much as possible use those that already are part of the UXCore2 bundle. There
are several atomic class names to allow styling components through composition.
See the [Utility Classes Guide] for a detailed list and explanation of these.

For example, if you need a div which has a gray top border:

**Good**

```jsx harmony
<div className='bd-t-1 bd-gray' />
```

**Bad**

```jsx harmony
<div className='my-gray-border' />
```

```scss
.my-gray-border {
  border-top: gray solid 1px;
}
```

#### DON'T set colors in SCSS

In the case where you do need to create CSS class names for your components, do
not set colors of any kind in your SCSS files. The temptation may be to import
`@ux/scss-definitions` and access some of the color variables or the color
`palette` mixin. The issue with this is your app will only compile the CSS with
the GoDaddy palette, and will not utilize the colors provided by the UXCore2
bundle.

**Good**

```jsx harmony
<div className='my-component bg-primary' />
```

```scss
.my-component {
  width: 100%;
  overflow-wrap: break-word;
}
```

**Bad**

```scss
.my-bad-component {
  width: 100%;
  overflow-wrap: break-word;
  background-color: $brand-primary; // OR palette(primary)
}
```

**Worse**

```scss
.my-worse-component {
  width: 100%;
  overflow-wrap: break-word;
  background-color: #00a63f !important;
}
```

#### DO assign colors with inline-styles

When assigning colors or fonts is a requirement for your component, and no
existing UXCore2 class names are available, you can use `@ux/inline-styles`.
This will allow colors and fonts to be assigned by inline styles in your React
code, or in CSS-in-JS solutions such as a [styled-jsx] which is bundled with
Gasket + Next.js. Because the colors will be assigned at render-time, the
correct palette will be used as provided by the UXCore2 bundle.

See the [Palettes and Inline-Styles Guide] for more details and examples.

### Graphics

#### DO use SVGs for all graphics

SVGs, when used inline, will benefit from allowing UXCore2 class names from the
palette bundle. If using rasterized graphics such as a PNG or JPG, this ability
is lost. Rasterized graphics, however, are suitable for photos or other
non-branded images.

See the [Static Assets Guide] for options for inlining SVG assets in with React.
There are a couple of key points required to ensure SVGs are properly prepared
for white-labeling:

#### DO namespace embedded classes in SVGs

SVGs editors will generally export generated class names such as `.st0`, `.st1`
which can cause styles to bleed across SVGs rendered in the same page. Caution
should be taken to account for this by uniquely namespacing these classes. A
simple strategy to is to add an `id` to the outer group and class selectors.

```diff
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 147.02 157.28">
  <defs>
    <style>
-       .st0 { stroke: #2b2b2b; }
-       .st1 { fill: #ccc; }
+       #unique-id .st0 { stroke: #2b2b2b; }
+       #unique-id .st1 { fill: #ccc; }
    </style>
  </defs>
-   <g>
+   <g id="unique-id">
    <circle class="st0" cx="73.76" cy="106.78" r="3.48"/>
    <polygon class="st1" points="96.82 136.55 50.66 136.55 53.28 118.2 94.11 118.2 96.82 136.55"/>
  </g>
</svg>
```

#### DO use atomic classes in SVGs

The key step to making sure that the colors of an SVG update with the palette
bundle, is to add `svg-stroke-*` and `svg-fill-*` atomic classes throughout the
SVG.

```diff
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 147.02 157.28">
  <defs>
    <style>
      #unique-id .st0 { stroke: #2b2b2b; }
      #unique-id .st1 { fill: #ccc; }
    </style>
  </defs>
  <g id="unique-id">  
-     <circle class="st0" cx="73.76" cy="106.78" r="3.48"/>
-     <polygon class="st1" points="96.82 136.55 50.66 136.55 53.28 118.2 94.11 118.2 96.82 136.55"/>
+     <circle class="st0 svg-stroke-gray-dark" cx="73.76" cy="106.78" r="3.48"/>
+     <polygon class="st1 svg-fill-gray-light" points="96.82 136.55 50.66 136.55 53.28 118.2 94.11 118.2 96.82 136.55"/>
  </g>
</svg>
```

Keeping the embedded styles (albeit namespaced) will keep the graphic visible
outside of the app for reference.

### URLs

For APIs that your app may need to call, it is preferred not to serve them from
`godaddy.com`, but rather `secureserver.net`. If both options are available, you
could switch based on the request origin, or just always use `serverserver.net`.
When a `serverserver.net` option isn't available, it is recommended set up a
proxy in your app to mask this.

<!-- LINKS -->

[reseller brands]:https://secureservernet.sharepoint.com/sites/TechHub/SitePages/Private-label-brands.aspx
[styled-jsx]:https://github.com/zeit/styled-jsx
[Palettes and Inline-Styles Guide]:https://gxsys.uxp.int.godaddy.com/pages/patterns/palettes/inline-styles
[Utility Classes Guide]:https://gxsys.uxp.int.godaddy.com/pages/styles/utility-classes

<!-- REPO LINKS -->

[static assets guide]: static-assets.md
