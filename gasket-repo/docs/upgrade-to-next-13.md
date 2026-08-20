# Upgrading to Next.js 13

This guide explains how to upgrade your Gasket project from Next.js 12 to Next.js 13. Keeping your tools up-to-date is essential
for security, performance, and accessing new features. Before proceeding with the upgrade, please review the [Next.js 13 summary]
to understand any breaking changes and new features introduced in this version.

> **NOTE:** Currently, Gasket supports Next.js version up to 13.1.1. We are eagerly anticipating the merge of a [PR fix] in the
> Next.js repository and we will promptly update this documentation once it is incorporated.

## App Router

In light of the previously mentioned note, Gasket does not currently offer compatibility with the new Next.js App Router. However,
the original Page Router is still supported, so this limitation does not block apps from upgrading to Next.js 13. We are actively
working on incorporating support for it in the near future.

## Upgrade Tool

To streamline the upgrade process, we recommend using the [gasket-upgrade tool], which handles most of the steps described below.

## Upgrade Steps

### Prerequisites

Before starting the upgrade, ensure that you have the following prerequisites in place:

- Node.js: You need at least Node.js v18 installed on your machine. You can download it from [nodejs.org] or use
  [nvm](https://github.com/nvm-sh/nvm).
- If your Gasket app is on an older version of the Gasket packages, be sure to follow the [v6/v2 Upgrade Guide] first.

The majority of integration work for Next.js 13 is handled by updates in these plugins and packages. Nonetheless, it's important
to be aware that there are a few app-level fixup tasks that may require attention.

### Update Dependencies

Upgrade the following packages to their latest versions:

- `next`
- `react`
- `react-dom`
- `eslint-config-next`

```bash
npm i next@13.1.1 react@latest react-dom@latest
npm i -D eslint-config-next@latest
```

### Link Component

The latest version of `next/link` requires removing the `<a>` tags from inside Link Components. Most of the props that were
previously passed to the `<a>` tags can now be passed directly to the `<Link>` component.

Here's an example of the change:

```diff
import React from 'react';
import Link from 'next/link';

export default function MyComponent() {
  return (
    <div>
-     <Link href="/about">
-       <a onClick={() => console.log('clicked')}>About</a>
-     </Link>
+     <Link href="/about" onClick={() => console.log('clicked')}>
+       About
+     </Link>
    </div>
  );
}
```

### Image Component

The `next/image` component has undergone [several changes], including some breaking changes that may require minor updates to your
code:

1. The following props have been removed: `layout`, `objectFit`, `objectPosition`, `lazyBoundary`, and `lazyRoot`.

```diff
import Image from 'next/image';

function MyComponent() {
  return (
    <div>
      <Image
        src="/my-image.jpg"
        alt="My Image"
-       layout="responsive"
-       objectFit="cover"
-       objectPosition="top center"
-       lazyBoundary={100}
-       lazyRoot="#lazy-root"
        width={500}
        height={300}
      />
    </div>
  );
}

```

2. The `alt` prop is now required.

<!-- LINKS -->

[v6/v2 Upgrade Guide]: /docs/upgrade-to-6.md
[gasket-upgrade tool]: /packages/gasket-upgrade-cli/README.md
[Next.js 13 summary]: https://nextjs.org/docs/pages/building-your-application/upgrading/version-13#v13-summary
[nodejs.org]: https://nodejs.org/
[PR fix]: https://github.com/vercel/next.js/pull/54372
[several changes]: https://nextjs.org/docs/app/api-reference/components/image#version-history
