# Deploying Apps Under A Specific Path (Base Path)

Gasket apps can be served under different base paths, other than `/`.

Potential scenarios include:
- Several teams responsible for different parts of an app (ie. `/dashboard`, `/sales`, etc.)

https://nextjs.org/docs/api-reference/next.config.js/basepath

## How to define a base path

In the `gasket.js` file, add a `basePath` property with the value of your desired path.
```javascript
basePath: '/path-to-your-app'
```
This will be the path that your assets and app will reside.

If you wish to specify, `intl` or `workbox` specific asset prefixes, you can specify these in the `gasket.js` as well.
```javascript
{
  basePath: '/my-app',
  intl: {
    assetPrefix: 'https:/some-cdn.com'
  }
}
```
