# Upgrading to Next.js 16 and React 19

This guide explains how to upgrade your Gasket v7 project from Next.js 14
to Next.js 16 with React 19.

Before proceeding, review the official [Next.js 16 upgrade guide] to understand
the full set of changes introduced in this version.

> **Caveat:** Apps that use a header manifest which includes Cart components
> cannot be upgraded at this time. Cart component compatibility with React 19 is
> pending — hold off on this upgrade until that is resolved.

## Prerequisites

- **Node.js 20.9+** (minimum) / **Node.js 24+** (recommended) — Node 18 is no longer supported by Next
  16. Node 24 is recommended since Node 20 is nearing end-of-life.
- **TypeScript 5.1+** — If your app uses TypeScript, ensure you are on 5.1.0 or
  later.
- Your app should already be on Gasket v7. If not, follow the
  [Upgrade to v7] guide first.

## Update Gasket Packages

The `@gasket/*` and `@godaddy/gasket-*` packages have been recently updated to
support React 19 and Next.js 16. Before updating Next.js and React, make sure
your Gasket packages are on the latest v7 (`@gasket/*`) / v3
(`@godaddy/gasket-*`) versions:

```bash
npm outdated | grep gasket
```

Update all Gasket packages to latest:

```bash
npx npm-check -u --latest
```

Select all packages with `@gasket/*` and `@godaddy/gasket-*` prefixes, or
update them individually. See the [generic upgrade guide] for more details.

## Update Next.js and React

Once Gasket packages are up to date, update `next`, `react`, and `react-dom`:

```bash
npm install next@latest react@latest react-dom@latest
```

If your app uses TypeScript, also update the type packages:

```bash
npm install -D @types/react@latest @types/react-dom@latest
```

After updating, your `package.json` should reflect versions along the lines of:

```json
"dependencies": {
  "next": "^16.x.x",
  "react": "^19.x.x",
  "react-dom": "^19.x.x"
}
```

## Set the React Version in Presentation Central

If your app uses `@godaddy/gasket-plugin-uxp` with Presentation Central, set
the `react` param explicitly in your `gasket.ts` to ensure the correct React
version is requested from the header service:

```diff
// gasket.ts
export default makeGasket({
  presentationCentral: {
    params: {
      app: 'my-app',
      manifest: 'internal-header',
+     react: '19'
    }
  }
});
```

While this value is normally auto-detected, explicitly setting it ensures
Presentation Central returns header assets compatible with React 19.

## Use the `--webpack` Flag

Next.js 16 uses Turbopack as the default bundler. Gasket apps include
`@gasket/plugin-webpack` (via the preset or template), which adds custom webpack
configuration. Turbopack will fail the build when custom webpack configuration
is detected, so the `--webpack` flag is required to opt out of Turbopack.

Add the `--webpack` flag to **every** script that invokes `next build` or
`next dev`:

```diff
"scripts": {
-  "build": "next build",
+  "build": "next build --webpack",
-  "local": "next dev",
+  "local": "next dev --webpack",
-  "analyze": "GASKET_ENV=local.analyze next build",
+  "analyze": "GASKET_ENV=local.analyze next build --webpack",
  "start": "next start"
}
```

Check for any other custom scripts in your `package.json` that call `next build`
or `next dev` and add the flag there as well.

## React 19 Changes

React 19 is a major version with relatively few breaking changes for typical
Gasket apps, but review the following:

### `ref` as a Prop

Function components can now receive `ref` as a regular prop. `forwardRef` is
no longer necessary, though it continues to work.

```diff
- const MyInput = forwardRef(function MyInput(props, ref) {
-   return <input ref={ref} {...props} />;
- });
+ function MyInput({ ref, ...props }) {
+   return <input ref={ref} {...props} />;
+ }
```

### Cleanup Functions in `ref` Callbacks

Ref callbacks can now return a cleanup function, which runs when the element is
removed from the DOM:

```jsx
<div ref={(node) => {
  // setup
  return () => {
    // cleanup
  };
}} />
```

### TypeScript: `JSX.Element` Namespace Removed

If your app uses TypeScript, replace `JSX.Element` with `React.ReactElement`:

```diff
- function MyComponent(): JSX.Element {
+ function MyComponent(): React.ReactElement {
    return <div>Hello</div>;
  }
```

### Context as a Provider

`<Context>` can now be used directly as a provider instead of
`<Context.Provider>`:

```diff
- <ThemeContext.Provider value="dark">
+ <ThemeContext value="dark">
    <App />
- </ThemeContext.Provider>
+ </ThemeContext>
```

For a full list of changes, see the [React 19 upgrade guide].

## Verify and Test

After making these changes:

1. Run `npm run build` to verify the build succeeds.
2. Run your test suite to catch any regressions.
3. Test the app locally with `npm run local` to verify runtime behavior.

<!-- LINKS -->

[Upgrade to v7]: upgrade-to-7.md
[generic upgrade guide]: upgrades.md#minor-and-patch-upgrades
[@godaddy/gasket-header-nav]: /packages/gasket-header-nav/README.md
[Next.js 16 upgrade guide]: https://nextjs.org/docs/app/guides/upgrading/version-16
[React 19 upgrade guide]: https://react.dev/blog/2024/12/05/react-19-upgrade-guide
