# RTL CSS

If your app needs to support language that flow Right to Left, such as Arabic or
Hebrew, then you will want to configure [RTLCSS].

## Configuration

This can be done in your webapps, use [postcss-rtlcss]. For new Gasket apps,
a PostCSS config can be generated for you automatically during the **create**
command.

For existing apps, if your app does not have a custom PostCSS config yet, you
will want to add it by following the [Next.js PostCSS guide][next-postcss].
Then, you can add `"postcss-rtlcss"` to the plugins.

Be sure to also install the package to your app's dependencies:

```shell
npm install --save-dev postcss postcss-flexbugs-fixes postcss-preset-env postcss-rtlcss
```

The PostCSS config can be in a variety of formats. We recommend setting the
`postcss` property in the package.json, to avoid missing extra files for
deployments.

```json
  "postcss": {
    "plugins": [
      "postcss-flexbugs-fixes",
      [
        "postcss-preset-env",
        {
          "autoprefixer": {
            "flexbox": "no-2009"
          },
          "stage": 3,
          "features": {
            "custom-properties": false
          }
        }
      ],
      "postcss-rtlcss"
    ]
  }
```

## Usage

By default, RTLCSS will swap right/left properties when building the css file
for RTL.

You can control this process by using various
[control][rtlcss-control-directives] and [value][rtlcss-value-directives]
directives.

#### Example CSS

For example, if you had this in your `style.css` file:

```css
.example {
  float: right;
  margin-left: 10px;
  padding-right: 5px /*rtl:ignore*/;
  font-size:16px /*rtl:14px*/;
}
```

Then your `style.rtl.css` file would look like:

```css
.example {
    padding-right: 5px
}

[dir=ltr] .example {
    float: right;
    margin-left: 10px;
    font-size: 16px
}

[dir=rtl] .example {
    float: left;
    margin-right: 10px;
    font-size: 14px
}
```

Notice that:

1. The value for `float` was automatically updated to be `left`
2. The `margin-left` property was updated to be `margin-right`
3. `padding-right` was left alone due to our `ignore` directive
4. The `font-size` was updated with the value we configured for rtl.

#### Example SCSS

SASS/SCSS compilation will strip out the `rtl` directives before `rtlcss` runs.
As such you will need to use `interpolation` to cause the comments to appear in
the css. `rtlcss` will then remove them from your output files when they are
generated.

```scss
.example {
  float: right;
  margin-left: 10px;
  padding-right: 5px #{"/*rtl:ignore*/"};
  font-size:16px #{"/*rtl:14px*/"};
}
```

**!IMPORTANT**: When SCSS is processed in Next.js, it removes the last semicolon
of a CSS block as an optimization. This throws off `rtlcss` causing the last (or
only) property directive to not apply. Make sure the _last_ property does not
need a directive as a work-around.

```diff
.example {
  float: right;
-  margin-left: 10px;
  padding-right: 5px #{"/*rtl:ignore*/"};
  font-size:16px #{"/*rtl:14px*/"};
+  margin-left: 10px;
}
```

[RTLCSS]: https://rtlcss.com/
[next-postcss]: https://nextjs.org/docs/advanced-features/customizing-postcss-config
[postcss-rtlcss]: https://github.com/elchininet/postcss-rtlcss
[@godaddy/gasket-preset-webapp]: /packages/gasket-preset-webapp/README.md
[rtlcss-control-directives]: https://rtlcss.com/learn/usage-guide/control-directives/
[rtlcss-value-directives]: https://rtlcss.com/learn/usage-guide/value-directives/
