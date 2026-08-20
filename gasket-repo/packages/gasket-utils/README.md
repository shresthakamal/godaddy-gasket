# @godaddy/gasket-utils

Gasket utility functions

## Installation

```bash
npm install @godaddy/gasket-utils
```

## Functions

### gdEnv()

Derive the Gasket env from Katana's `GD_ENV` and `GD_REGION`.
The `GASKET_ENV` env var, if set, takes precedence.
Use this to set the `env` property programmatically in your `gasket.js` file.

```javascript
import { makeGasket } from '@gasket/core';
import pluginVisitor from '@godaddy/gasket-plugin-visitor';
import { gdEnv } from '@godaddy/gasket-utils';

export default makeGasket({
  env: gdEnv(),
  plugins: [
    pluginVisitor
  ],
  // etc...
});
```
