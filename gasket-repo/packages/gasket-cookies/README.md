# @godaddy/gasket-cookies

⚠️ _DEPRECATED - This plugin will be removed in a future major version._

Helpers for unified access to cookie data for universal rendering in Gasket
apps.

By using the package, you will be choosing to opt-out of having pages capable of
being edge-cached or static rendered. Consider deferring the render of this
content to the browser with cookie access via [document.cookie].

## Installation

```bash
npm install --save @godaddy/gasket-cookies
```

## Usage

In order to make cookies available from Redux state you will need to:
- [add the reducer](#attach-reducer) to the Redux store
- [set up the withCookies](#withcookies) HOC on a page or in `_app`

After that you can select cookie values from state.

### Attach reducer

```diff
const { configureMakeStore, getOrCreateStore } = require('@gasket/redux');
const { HYDRATE, createWrapper } = require('next-redux-wrapper');
const merge = require('lodash.merge')
+ const { cookieReducers } = require('@godaddy/gasket-cookies')

const rootReducer = (state, { type, payload }) => type === HYDRATE ? merge({}, state, payload) : state;

const reducers = {
+  ...cookieReducers
};

const makeStore = configureMakeStore({ rootReducer, reducers });
const nextRedux = createWrapper(getOrCreateStore(makeStore));

module.exports = makeStore;
module.exports.nextRedux = nextRedux;
```

### withCookies

This is a higher order component that will read cookies and add them to the
Redux state. This uses `getInitialProps` to read from `req` on the server, or
from `document` in the browser. You can use this on pages or at the app level:

```jsx
// pages/_app.js
import { App } from '@godaddy/gasket-next';
import withCookies from '@godaddy/gasket-cookies';

export default withCookies()(App);
```

Because `withCookies` uses `getInitialProps` under the hood, you will need to
use an alternative approach for adding cookie data to the Redux store if also
trying to use `getServerSideProps` on a page. The `loadCookies` function can be
used to help with this.

### selectCookies

Now in your React code, you can select any cookies that have been loaded to
the Redux state. You can utilize the `selectCookie` selector to streamline this.

```js
import React from 'react'
import { selectCookie } from '@godaddy/gasket-cookies';
import { connect } from 'react-redux';

class Test extends React.Component {
  render() {
    //this.props.custom
  }
}

function mapStateToProps(state, ownProps) {
  return {
    custom: selectCookie(state, 'custom')
  }
}

export default connect(mapStateToProps)(Test);
```

### cookieSelectors

Some cookies are added to the Redux state by default (`currency`, `market`).
These can also be selected with some convenience selectors.

```js
import React from 'react'
import { cookieSelectors } from '@godaddy/gasket-cookies';
import { connect } from 'react-redux';

class Test extends React.Component {
  render() {
    //this.props.market
  }
}

function mapStateToProps(state, ownProps) {
  return {
    market: cookieSelectors.market(state)
  }
}

export default connect(mapStateToProps)(Test);
```

### loadCookies

This redux action creator reads cookies from the provided request and adds them
to the Redux store. You can use it in a `initReduxStore` lifecycle hook, for
example:

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import { loadCookies } from '@godaddy/gasket-cookies';

export default makeGasket({
  plugins: [
    // other plugins
    {
      name: 'my-inlined-plugin',
      hooks: {
        initReduxStore(gasket, store, req) {
          store.dispatch(loadCookies(req, store));
        };
      }
    }
  ]
});
```

### New cookies to add to redux state

By default, only a certain few cookies are added to the Redux state. If there is
a need to introduce a new cookie, you can include it by specifying it in gasket
config file.

```js
module.exports = {
  redux: {
    initState: {
      cookieWhitelist: ['custom-cookie-name']
    }
  }
};
```

<!-- LINKS -->

[document.cookie]: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie

