# CSS/SCSS Imports

Support for CSS and SCSS is built-in into Next.js.
Apps can specify global styles and even component level styles
with CSS modules. Read up on the [Next.js docs] for more details.

If you require styles to be imported from installed node modules, such as
for UXCore2 icons, there are a few notes to keep in mind. The
[recommended way by Next.js][recommended] is to import distributed CSS
directly to `pages/_app.js` which will be bundled into the global styles.

## JS

```js
import '@ux/icon/airplane/index.css';

import { App, reportWebVitals } from '@godaddy/gasket-next';

export { reportWebVitals };
export default App;
```

## SCSS

It is possible to have global styles defined in a SCSS file, and import
distributed styles there. However, syntax errors can occur. In
particular we've seen this with files for icons from `@ux/icon` when
trying to import the icon CSS into a SCSS file. Instead, import the SCSS
file into SCSS, making sure to declare the extension.

```scss
//styles.scss

@import '~@ux/icon/airplane/index.scss';
```

## CSS

If you are not using SCSS in your app, you can have a top level CSS file
and then import the distributed CSS into it.

```css
/* styles.css */

@import '~@ux/icon/airplane/index.css';
```

[Next.js docs]: https://nextjs.org/docs/basic-features/built-in-css-support
[recommended]: https://nextjs.org/docs/basic-features/built-in-css-support#import-styles-from-node_modules

