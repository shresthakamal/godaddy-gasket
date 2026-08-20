# @godaddy/gasket-hcs

Components used for Header Content Services.

## Installation

```bash
npm install --save @godaddy/gasket-hcs
```

## Components

### withManifest

React Component to render the manifest, initialize user state, traffic and read
page configuration. The HOC provides the Header and Footer with data from the
PCS, page state and/or configuration. If changes are needed, either contribute
to the [@godaddy/gasket-plugin-hcs] or introduce the desired functionality at a
lower level.

Also, import the `dist/styles.css` to your project styles or components.

**Signature**

- `withManifest(component, options)`

**Props**

- `renderAccountDelegation` - (boolean) Render the AccountDelegation Component.
  Default is `false`.
- `initCustomerState` - (boolean) Should customer state be initialized.
  Default is `false`.
- `initTraffic` - (boolean) Call the traffic initialization hook.
  Default is `false`.

#### Example

```js
import React from 'react';
import { withManifest } from '@godaddy/gasket-hcs';
import '@godaddy/gasket-hcs/dist/styles.css';

export function MyHeader() {
  return (
    <div/>
  );
}

export default withManifest(MyHeader, {
  renderAccountDelegation: true,
  initCustomerState: true,
  initTraffic: true,
  additionalHeaderMethods = {}, //extensibility endpoints
  componentName = 'header'
});
```

## Globals

### `window.ux.hcs.mergeProps`

A utility method to deep merge props in the browser.

```js
ux.hcs.mergeProps(base, headerSpecific, ...);
```

[@godaddy/gasket-plugin-hcs]:/packages/gasket-plugin-hcs/README.md

## Test gasket-hcs in other headers

This is using npm workspaces, so frequently the node_modules are located at the top level of the repo. The node_modules are not filled at this level. To test your changes you need to install the local file to the header you are using.
- In your header install gasket-hcs from your files: ```npm i ../../gasket/packages/gasket-hcs```
- Set your node path to tell the system where to find the node_modules: ```NODE_PATH=../../gasket/node_modules``` [info here.](https://nodejs.org/api/modules.html#loading-from-the-global-folders)
- Then use ```npm run local``` or your headers equivalent.

This process is required every time you make a change.


If you DO have node-modules:
- cd into packages/gasket-hcs
- Do a clean npm install ```npm ci```
- Build it ```npm run build```
- Link it ```npm link```
- Go to application-sidebar/desired header
- Do a clean npm install
- Link the gasket-hcs ```npm link @godaddy/gasket-hcs```
- Run ```npm run local``` on application-sidebar and hydra tester. Be sure to follow any instructions on running those apps locally.

When you make changes in gasket hcs code after, you always need to build it (then run local in application-sidebar). No need to link again unless you add/remove any node package.

To check whether it is linked correctly or not, run ```npx link-status``` in app sidebar, it should show gasket-hcs there.


## Using Hivemind
To use hivemind for experimentation, consumers can implement the [```useCohorts``` method](https://github.com/gdcorp-uxp/hivemind-provider#usecohorts) in their code as well as
configure in `gasket.js` in their app. Ex:

```js
// gasket.js
export default makeGasket({
  // ...
  hcs: {
    hivemind: {
      labels: [
        'experiment1',
        'experiment2',
      ]
    }
  }
});
```

## Skip to Main A11y navigation
For a11y purposes we have a default `skip navigation` link that becomes visible when a keyboard user first tabs on the page. Pressing enter on this link allows them to skip the header navigation and jump to the first element with main, main-content, root. We are utilizing [this component](https://github.com/gdcorp-siteglass/pattern-library/blob/main/src/navigation/skip-navigation/index.js) from Siteglass for Skip Navigation. Consuming apps should import the css if they want to use it.

```import '@godaddy/gasket-hcs/dist/styles.css';```
