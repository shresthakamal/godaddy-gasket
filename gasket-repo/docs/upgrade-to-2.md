# Upgrade to v2

This guide will take you through updating `@gasket/*` packages from `1.x` to
`2.x`.

`2.x` upgrades from Next.js 6.0 to 7.0. This is a breaking change because of
some development tools that Next.js combines has been upgraded to new major
versions.

- WebPack is updated from 3 to 4.
- Babel is upgraded from 6 to 7, including `@babel/` packages.

If you want to get a broader understanding of what is upgraded see the
[next.js][next], [babel][babel], and [webpack][webpack] changelog entries.

The upgrade to `babel@7` is pretty straight forward. Install `babel-upgrade`, to
upgrade your project's babel configuration to `@babel/` based packages and
version 7.0

```
npm install -g babel-upgrade
babel-upgrade --write
```

The `babel-upgrade` tool would automatically check your babel config and update
them to the correct new packages. You need to make sure that any of the packages
you consume are also updated to `@babel/*` as they are not compatible most of
the time.

After this we need to upgrade the `@gasket/*` packages to their latest versions.
Most of them have been major bumped to `2.x` unless they didn't use any Babel or
WebPack functionality such as `@gasket/fetch` etc. You can easily check the
latest version of the packages you are running:

```
# npm view <package-name> version
npm view @gasket/core-plugin version
```

Once you've updated all of these packages, there is only one thing left to do
and that is reviewing your WebPack configuration and it's related modules.

You want to make sure that the modules/plugins you are using are compatible with
the new plugin API that was introduced in `webpack@4`.

If you happen to run into any issues while upgrading, don't be afraid to reach
out to the Gasket team in the [#gasket-support] channel.

[#gasket-support]: https://godaddy.slack.com/messages/CABCTNQ5P/
[next]: https://github.com/zeit/next.js/releases/tag/7.0.0
[babel]: https://babeljs.io/blog/2018/08/27/7.0.0
[webpack]: https://webpack.js.org/migrate/4/
