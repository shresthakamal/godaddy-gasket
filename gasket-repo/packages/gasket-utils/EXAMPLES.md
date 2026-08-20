# @godaddy/gasket-utils Examples

This document provides working examples for the exported functionality in the `@godaddy/gasket-utils` package.

## Package Exports

The package currently exports:
- **`gdEnv()`** function for deriving Gasket environment from Katana variables

## gdEnv() Function

Derives the Gasket environment from Katana's `GD_ENV` and `GD_REGION` environment variables. The `GASKET_ENV` environment variable, if set, takes precedence over the derived value.

### Basic Usage

```javascript
import { gdEnv } from '@godaddy/gasket-utils';

// Get the current Gasket environment
const gasketEnv = gdEnv();
console.log(gasketEnv); // e.g., "dev", "test", "prod.us-west-2"
```

### Integration with Gasket Apps

#### Basic Gasket Configuration

```javascript
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginVisitor from '@godaddy/gasket-plugin-visitor';
import { gdEnv } from '@godaddy/gasket-utils';

export default makeGasket({
  env: gdEnv(),
  plugins: [
    pluginVisitor
  ]
});
```

### Basic Environment Configuration

```javascript
import { makeGasket } from '@gasket/core';
import { gdEnv } from '@godaddy/gasket-utils';

export default makeGasket({
  env: gdEnv(),
  environments: {
    dev: {
      someConfig: 'dev-specific config',
    },
    'dev.us-west-2': {
      someConfig: 'dev-specific config for us-west-2'
    },
    prod: {
      someConfig: 'prod-specific config'
    }
  }
  // other configuration...
});

```

### Environment Variable Combinations

The function derives the environment based on `GD_ENV` and `GD_REGION` environment variables:

#### Development Environment

```bash
# Simple dev environment
GD_ENV=dev
# Output: "dev"

# Dev with region
GD_ENV=dev
GD_REGION=us-west-2
# Output: "dev.us-west-2"

# Dev-private (normalized to dev)
GD_ENV=dev-private
# Output: "dev"

# Dev-private with region
GD_ENV=dev-private
GD_REGION=us-east-1
# Output: "dev.us-east-1"
```
