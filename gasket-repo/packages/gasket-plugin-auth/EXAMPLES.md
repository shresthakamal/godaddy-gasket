# @godaddy/gasket-plugin-auth Examples

This document provides working examples for all exported methods, actions, and constants from the `@godaddy/gasket-plugin-auth` package.

## Actions

### getCheckAuth

Returns a `checkAuth` function bound to a specific request that can be reused for multiple auth checks.

```js
import gasket from '../gasket.js';

async function handleMultipleAuthChecks(req, res) {
  const checkAuth = gasket.actions.getCheckAuth(req);

  // Check for basic IDP authentication
  const basicAuth = await checkAuth({
    realm: 'idp',
    risk: 'low'
  });

  if (basicAuth.valid) {
    // Check for admin privileges
    const adminAuth = await checkAuth({
      realm: 'jomax',
      groups: ['admin', 'superuser']
    });

    if (adminAuth.valid) {
      res.json({ level: 'admin', user: adminAuth.details.accountName });
    } else {
      res.json({ level: 'user', customer: basicAuth.details.customerId });
    }
  } else {
    res.status(401).json({ error: basicAuth.reason });
  }
}
```

### checkAuth

Performs a single authentication check with specified parameters.

```js
import gasket from '../gasket.js';

async function verifyEmployeeAccess(req, res) {
  try {
    const authResult = await gasket.actions.checkAuth(req, {
      realm: 'jomax',
      groups: ['employee', 'contractor'],
      risk: 'medium'
    });

    if (authResult.valid) {
      const { accountName, groups } = authResult.details;
      res.json({
        success: true,
        user: accountName,
        permissions: groups
      });
    } else {
      res.status(401).json({
        success: false,
        error: authResult.reason,
        authCode: authResult.authReason
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Authentication service unavailable' });
  }
}
```

### checkAuth (oauth realm)

Validates a Bearer token from an OAuth resource server and checks that it
carries at least one of the required scopes.

```js
import gasket from '../gasket.js';

async function verifyServiceAccess(req, res) {
  const authResult = await gasket.actions.checkAuth(req, {
    realm: 'oauth',
    scopes: ['uxp.gasket-canary.demo:read']
  });

  if (authResult.valid) {
    const { clientId, scopes } = authResult.details;
    res.json({
      success: true,
      client: clientId,
      grantedScopes: scopes
    });
  } else {
    res.status(401).json({
      success: false,
      error: authResult.reason
    });
  }
}
```

### checkShopperAuth

Pre-configured authentication check for shopper accounts in the IDP realm.

```js
import gasket from '../gasket.js';

async function getShopperProfile(req, res) {
  const authResult = await gasket.actions.checkShopperAuth(req);

  if (authResult.valid) {
    const { shopperId, customerId, plid, type } = authResult.details;

    res.json({
      profile: {
        shopperId,
        customerId,
        privateLabelId: plid,
        authType: type
      }
    });
  } else {
    res.status(401).json({
      error: 'Shopper authentication required',
      reason: authResult.reason
    });
  }
}
```

### getAuthToken

Extracts the authentication token for a specific realm from the request. Checks headers and cookies for the token.

```js
import gasket from '../gasket.js';

async function handleTokenExtraction(req, res) {
  try {
    // Get token for IDP realm (shoppers/customers)
    const idpToken = await gasket.actions.getAuthToken(req, 'idp');
    
    if (idpToken) {
      res.json({
        realm: 'idp',
        token: idpToken
      });
      return;
    }

    // Try Jomax realm (employees)
    const jomaxToken = await gasket.actions.getAuthToken(req, 'jomax');
    
    if (jomaxToken) {
      res.json({
        realm: 'jomax',
        token: jomaxToken
      });
      return;
    }

    // No tokens found
    res.status(401).json({
      error: 'No authentication token found',
      message: 'Token must be provided in Authorization header or auth cookie'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Token extraction failed',
      message: error.message
    });
  }
}

// Example: Using getAuthToken to make authenticated requests to other services
async function fetchCustomerData(req, res) {
  try {
    // Extract IDP token from the request
    const idpToken = await gasket.actions.getAuthToken(req, 'idp');
    
    if (!idpToken) {
      return res.status(401).json({
        error: 'IDP authentication required',
        message: 'No IDP token found in request'
      });
    }

    // Use the token to make authenticated request to another service
    const customerResponse = await fetch('https://api.example.com/customer/profile', {
      method: 'GET',
      headers: {
        'Authorization': `sso-jwt ${idpToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!customerResponse.ok) {
      return res.status(customerResponse.status).json({
        error: 'Failed to fetch customer data',
        message: `Service returned ${customerResponse.status}`
      });
    }

    const customerData = await customerResponse.json();
    
    res.json({
      success: true,
      customer: customerData,
      tokenUsed: 'idp'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Request failed',
      message: error.message
    });
  }
}
```

## Constants

### AuthRealm

Enum values for different authentication realms. These can be imported from the plugin or used as string literals.

```js
import gasket from '../gasket.js';
import pluginAuth from '@godaddy/gasket-plugin-auth';

// Option 1: Import from plugin
const { AuthRealm } = pluginAuth;

// Option 2: Use string literals directly (more common)
async function routeByRealm(req, res) {
  const realm = req.query.realm;

  switch (realm) {
    case 'idp': // or AuthRealm.idp
      // Customer/shopper authentication
      const shopperAuth = await gasket.actions.checkAuth(req, {
        realm: 'idp',
        type: ['basic', 'e2s']
      });
      break;

    case 'jomax': // or AuthRealm.jomax
      // Employee authentication
      const employeeAuth = await gasket.actions.checkAuth(req, {
        realm: 'jomax',
        groups: ['employee']
      });
      break;

    case 'pass': // or AuthRealm.pass
      // PASS authentication
      const passAuth = await gasket.actions.checkAuth(req, {
        realm: 'pass'
      });
      break;

    case 'cert': // or AuthRealm.cert
      // Certificate authentication
      const certAuth = await gasket.actions.checkAuth(req, {
        realm: 'cert',
        certs: ['api.godaddy.com']
      });
      break;

    case 'awsiam': // or AuthRealm.awsiam
      // AWS IAM authentication
      const iamAuth = await gasket.actions.checkAuth(req, {
        realm: 'awsiam',
        roles: ['arn:aws:iam::123456789:role/AppRole']
      });
      break;

    case 'oauth': // or AuthRealm.oauth
      // OAuth resource-server authentication
      const oauthAuth = await gasket.actions.checkAuth(req, {
        realm: 'oauth',
        scopes: ['uxp.gasket-canary.demo:read']
      });
      break;

    default:
      res.status(400).json({ error: 'Invalid realm' });
      return;
  }

  res.json({ success: true });
}
```

### AuthRisk

Enum values for authentication risk levels. These can be imported from the plugin or used as string literals.

```js
import gasket from '../gasket.js';
import pluginAuth from '@godaddy/gasket-plugin-auth';

// Option 1: Import from plugin
const { AuthRisk } = pluginAuth;

// Option 2: Use string literals directly (more common)
async function handleSensitiveOperation(req, res) {
  const operation = req.params.operation;
  let requiredRisk;

  // Determine required risk level based on operation
  switch (operation) {
    case 'view-profile':
      requiredRisk = 'low'; // or AuthRisk.low
      break;
    case 'update-settings':
      requiredRisk = 'medium'; // or AuthRisk.medium
      break;
    case 'delete-account':
      requiredRisk = 'high'; // or AuthRisk.high
      break;
    default:
      requiredRisk = 'medium';
  }

  const authResult = await gasket.actions.checkAuth(req, {
    realm: 'idp',
    risk: requiredRisk
  });

  if (authResult.valid) {
    res.json({ operation, risk: requiredRisk, allowed: true });
  } else {
    res.status(401).json({
      operation,
      risk: requiredRisk,
      error: `${requiredRisk} risk authentication required`
    });
  }
}
```
