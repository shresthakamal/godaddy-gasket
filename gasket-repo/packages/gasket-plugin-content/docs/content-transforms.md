# Content Transforms Guide

## What are transforms

The Gasket Storefront plugins use [ContentNodes] as an intermediate exchange
format for taking CMS data, and making it ready to render as React components.
When we talk about transforms, we are referring to the manipulation of these
ContentNodes or their tree structure.

Apps and plugins can hook the [contentTransform] lifecycle in order to access
the ContentNodes to perform transforms before the render step. Further, each
CMS plugin should provide a lifecycle to hook before final transforms are
applied. For example, when using Contentful, the [contentfulContentTransform]
lifecycle is available.

There are three tools you can utilize from [@godaddy/gasket-content-nodes] for managing
transforms:

- [traverse]
- [reverseTraverse]
- [transform]

## When to transform

As a general rule, attempt to design your content models to match up to
components per the [Component Modeling Guide].

In some cases, however, it may be necessary to transform content entries for
certain types of models. Some situations these types of models may exist could
be from 3rd party apps or those which are intended to effect result tree such as
experiments.

## When to NOT transform

If you have a model, that doesn't quite match up to the component, do NOT resort
to transforms. Instead, it is recommended to create [Facade Components] which
handle any field to prop mappings. This keeps the changes WITH the components,
easing future uplift of existing Components to new Model specs.

When there are several transforms at play, it can be difficult to debug, so use
sparingly.

## Examples

### Convert a Node into Props object

```js
function delegate(aPart, aPartType) {
  if (aPartType === 'node') {
    const [name, props] = aPart;
    if (name === 'SomeThirdPartModel') {
      return props
    }
  }
  return aPart;
}

module.exports = {
  hooks: {
    contentTransform: function (gasket, contentNode) {
      return traverse(contentNode, delegate);
    }
  }
}
```

### Adjust content based on context

```js
function makeDelegate(layout) {
  return function delegate(aPart, aPartType) {
    if (aPartType === 'node') {
      const [name, props] = aPart;
      if (name === 'SomeLayoutComponent') {
        return [name, { ...props, layout }]
      }
    }
    return aPart;
  }
}

module.exports = {
  hooks: {
    contentTransform: function (gasket, contentNode, context) {
      const { experiments } = context.params;

      if ('some-experiment' in experiments) {
        const layout = experiments['some-experiment'] === 'cohort-a' ? 'vertical' : 'horizontal';
        const delegate = makeDelegate(layout);
        return traverse(contentNode, delegate);
      }

      return contentNode
    }
  }
}
```

[contentTransform]: /packages/gasket-plugin-content/README.md#contenttransform
[contentfulContentTransform]: /packages/gasket-plugin-contentful/README.md#contentfulcontenttransform

[@godaddy/gasket-content-nodes]: /packages/content-nodes/README.md
[traverse]: /packages/content-nodes/README.md#traverse
[reverseTraverse]: /packages/content-nodes/README.md#reverseTraverse

[transform]: /packages/content-nodes/README.md#transform
[Component Modeling Guide]: ./component-modeling.md
[Facade Components]: ./component-modeling.md#map-prop-with-facades
