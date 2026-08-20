# @godaddy/gasket-cookies Examples

This document provides working examples for all methods, HOCs, and functions in the gasket-cookies package.

## withCookies (Default Export)

Higher-order component that reads cookies and adds them to Redux state using `getInitialProps`.

### Basic Usage

```jsx
// pages/_app.js
import { App } from '@godaddy/gasket-next';
import withCookies from '@godaddy/gasket-cookies';

export default withCookies()(App);
```

### With NextJS Redux (Recommended)

```jsx
// pages/_app.js
import { App } from '@godaddy/gasket-next';
import withCookies from '@godaddy/gasket-cookies';
import { nextRedux } from '../store.js';

const AppWithCookies = withCookies()(App);

export default nextRedux.withRedux(AppWithCookies);
```

### Page-Level Usage

```jsx
// pages/some-page.js
import React from 'react';
import withCookies from '@godaddy/gasket-cookies';

function MyPage({ cookieData }) {
  return <div>Page content</div>;
}

export default withCookies()(MyPage);
```

## cookieReducers

Redux reducers for managing cookie state in your store.

### Basic Redux Setup

```js
// store.js
import { configureMakeStore } from '@gasket/redux';
import { cookieReducers } from '@godaddy/gasket-cookies';

const reducers = {
  ...cookieReducers,
  // your other reducers
};

const makeStore = configureMakeStore({ reducers });
export default makeStore;
```

### NextJS Redux Setup (Recommended)

```js
// store.js
const { configureMakeStore, getOrCreateStore } = require('@gasket/redux');
const { HYDRATE, createWrapper } = require('next-redux-wrapper');
const merge = require('lodash.merge');
const { cookieReducers } = require('@godaddy/gasket-cookies');

const rootReducer = (state, { type, payload }) => type === HYDRATE ? merge({}, state, payload) : state;

const reducers = {
  ...cookieReducers,
  // your other reducers
};

const makeStore = configureMakeStore({ rootReducer, reducers });
const nextRedux = createWrapper(getOrCreateStore(makeStore));

module.exports = makeStore;
module.exports.nextRedux = nextRedux;
```

## cookieSelectors

Pre-built selectors for default cookies (currency, market).

```jsx
// components/market-display.js
import React from 'react';
import { connect } from 'react-redux';
import { cookieSelectors } from '@godaddy/gasket-cookies';

function MarketDisplay({ currency, market }) {
  return (
    <div>
      <p>Market: {market}</p>
      <p>Currency: {currency}</p>
    </div>
  );
}

const mapStateToProps = (state) => ({
  currency: cookieSelectors.currency(state),
  market: cookieSelectors.market(state)
});

export default connect(mapStateToProps)(MarketDisplay);
```

## selectCookie

Function to select any cookie value from Redux state.

```jsx
// components/custom-cookie.js
import React from 'react';
import { connect } from 'react-redux';
import { selectCookie } from '@godaddy/gasket-cookies';

function CustomCookieDisplay({ customValue }) {
  return <div>Custom: {customValue}</div>;
}

const mapStateToProps = (state) => ({
  customValue: selectCookie(state, 'my-custom-cookie')
});

export default connect(mapStateToProps)(CustomCookieDisplay);
```

```js
// In a Redux thunk
import { selectCookie } from '@godaddy/gasket-cookies';

export const someAction = () => (dispatch, getState) => {
  const state = getState();
  const userPreference = selectCookie(state, 'user-preference');

  if (userPreference === 'dark-mode') {
    dispatch(enableDarkMode());
  }
};
```

## loadCookies

Redux action that reads cookies from request/document and loads them into store.

```js
// gasket.js lifecycle hook
import { loadCookies } from '@godaddy/gasket-cookies';

export default {
  name: 'my-plugin',
  hooks: {
    initReduxStore(gasket, store, req) {
      store.dispatch(loadCookies(req, store));
    }
  }
};
```

```js
// Manual usage in a thunk action
import { loadCookies } from '@godaddy/gasket-cookies';

export const refreshCookies = (req) => (dispatch, getState) => {
  const store = { getState, dispatch };
  return dispatch(loadCookies(req, store));
};
```



## Complete Integration Example

Here's a complete example showing how to integrate gasket-cookies into a Next.js app:

```js
// gasket.js
export default makeGasket({
  redux: {
    initState: {
      cookieWhitelist: ['user-preferences', 'theme']
    }
  }
});
```

```js
// store.js
const { configureMakeStore, getOrCreateStore } = require('@gasket/redux');
const { HYDRATE, createWrapper } = require('next-redux-wrapper');
const merge = require('lodash.merge');
const { cookieReducers } = require('@godaddy/gasket-cookies');

const rootReducer = (state, { type, payload }) => type === HYDRATE ? merge({}, state, payload) : state;

const reducers = {
  ...cookieReducers,
  // other reducers
};

const makeStore = configureMakeStore({ rootReducer, reducers });
const nextRedux = createWrapper(getOrCreateStore(makeStore));

module.exports = makeStore;
module.exports.nextRedux = nextRedux;
```

```jsx
// pages/_app.js
import { App } from '@godaddy/gasket-next';
import withCookies from '@godaddy/gasket-cookies';
import { nextRedux } from '../store.js';

const AppWithCookies = withCookies()(App);

export default nextRedux.withRedux(AppWithCookies);
```

```jsx
// components/user-display.js
import React from 'react';
import { connect } from 'react-redux';
import { cookieSelectors, selectCookie } from '@godaddy/gasket-cookies';

function UserDisplay({ market, currency, userPrefs, theme }) {
  return (
    <div className={theme}>
      <p>Market: {market}</p>
      <p>Currency: {currency}</p>
      <p>User Preferences: {JSON.stringify(userPrefs)}</p>
    </div>
  );
}

const mapStateToProps = (state) => ({
  market: cookieSelectors.market(state),
  currency: cookieSelectors.currency(state),
  userPrefs: selectCookie(state, 'user-preferences'),
  theme: selectCookie(state, 'theme')
});

export default connect(mapStateToProps)(UserDisplay);
```
