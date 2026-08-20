# FFI Library Integration Guide

The `@godaddy/gasket-plugin-auth` now supports the new `@godaddy/gd-auth-lib` FFI-based authentication library as an optional feature. This provides better performance and additional features while maintaining backward compatibility with the existing `gd-auth` library.

## Configuration

To enable the new FFI-based library, add the `useFFILibrary` flag to your authentication configuration:

```javascript
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginAuth from '@godaddy/gasket-plugin-auth';

export default makeGasket({
  plugins: [
    pluginAuth,
    // ... other plugins
  ],
  auth: {
    appName: 'my-app',
    host: ['godaddy.com'],
    useFFILibrary: true,  // Enable the new FFI library
    client: 'my-client',  // App-level config: set once globally
    pcpId: '12345',       // App-level config: set once globally
    // ... other auth config
  }
  // ... other config
});
```

### Architecture: App Config vs Auth Options

The FFI library uses a two-tier configuration approach:

1. **App Config** (set once globally):
   - `appName`: Application identifier
   - `client`: Client identifier 
   - `pcpId`: PCP identifier
   - `testMode`: Test mode flag

2. **Auth Options** (per request):
   - `host`: Request host
   - `securityLevel`: Security level for this request (renamed from `riskLevel` in v0.11.0+)
   - `auths`: Authentication methods for this request
   - `authType`: Authentication type for this request

## Feature Flag Behavior

### When `useFFILibrary: false` (default)
- Uses the traditional `gd-auth` library
- All existing functionality remains unchanged
- No additional configuration required

### When `useFFILibrary: true`
- Uses the new `@godaddy/gd-auth-lib` FFI-based library
- Provides better performance for token validation
- Requires additional configuration:
  - `client`: Client identifier (defaults to 'gasket' if not provided)
  - `pcpId`: PCP identifier (**REQUIRED** for production environments)

#### Important: pcpId Configuration
- **Production environments**: `pcpId` is required and the application will throw an error if not configured
- **Development environments** (`NODE_ENV=development` or `NODE_ENV=local`): A default value will be used with a warning message
- This ensures proper configuration in production while allowing easy local development

## JWT Configuration with FFI Library

When using the FFI library, JWT configurations can specify per-request authentication parameters using constants from the library:

```javascript
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginAuth from '@godaddy/gasket-plugin-auth';
import pluginJwt from '@godaddy/gasket-plugin-jwt';
import { SecurityLevel, Auths, AuthType } from '@godaddy/gd-auth-lib';

export default makeGasket({
  plugins: [
    pluginAuth,
    pluginJwt,
    // ... other plugins
  ],
  auth: {
    useFFILibrary: true,
    // App-level config (set once globally)
    appName: 'my-app',
    pcpId: 'your-pcp-id',
    client: 'your-client'
  },
  jwt: {
    'my-service': {
      ssoHost: 'sso.godaddy.com',
      ttl: 3600,
      // Per-request auth options (passed with each authentication call)
      securityLevel: SecurityLevel.MEDIUM,  // Default: SecurityLevel.LOW
      auths: [Auths.S2S],                   // Default: [Auths.BASIC]
      authType: AuthType.JOMAX               // Default: AuthType.IDP
    }
  }
  // ... other config
});
```

### Available Constants

#### Security Levels (formerly Risk Levels in v0.10.x)
- `SecurityLevel.NONE` (0)
- `SecurityLevel.LOW` (1) - **Default**
- `SecurityLevel.MEDIUM` (2)
- `SecurityLevel.HIGH` (3)

**Note:** The configuration key was renamed from `riskLevel` to `securityLevel` to match the `@godaddy/gd-auth-lib` v0.11.0+ API. For backward compatibility, `riskLevel` is still accepted but will log a deprecation warning. Please migrate to `securityLevel`.

#### Authentication Types
- `Auths.BASIC` - **Default**
- `Auths.S2S`
- `Auths.S2SNPR`
- `Auths.E2S`
- `Auths.E2S2S`
- `Auths.E2S2SNPR`
- `Auths.CERT2S`

#### Auth Types
- `AuthType.IDP` - **Default**
- `AuthType.JOMAX`
- `AuthType.IDP_INT`
- `AuthType.PASS`
- `AuthType.AWSIAM`
- `AuthType.CERT`

## Compatibility

The integration is designed to be fully backward compatible:

1. **Token Validation**: Both libraries validate tokens the same way
2. **API Surface**: The same authentication APIs work with both libraries
3. **Error Handling**: Error formats are consistent between libraries
4. **Caching**: Token and authentication caching works with both libraries

## Benefits of the FFI Library

1. **Performance**: Native Rust implementation provides faster token parsing and validation
2. **Memory Efficiency**: Lower memory footprint for high-throughput applications
3. **Additional Features**: 
   - Enhanced token introspection
   - Better error reporting
   - More granular authentication controls
4. **Future-Proof**: Built on modern architecture for long-term maintainability

## Migration Guide

### Step 1: Enable Feature Flag
```javascript
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginAuth from '@godaddy/gasket-plugin-auth';

export default makeGasket({
  plugins: [
    pluginAuth,
    // ... other plugins
  ],
  auth: {
    useFFILibrary: true,
    pcpId: 'your-pcp-id', // Required for production
    // ... existing config
  }
  // ... other config
});
```

### Step 2: Test Your Application
- Run your test suite to ensure compatibility
- Monitor authentication flows in development
- Verify performance improvements

### Step 3: Configure Authentication Parameters (Optional)
```javascript
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginAuth from '@godaddy/gasket-plugin-auth';
import pluginJwt from '@godaddy/gasket-plugin-jwt';
import { SecurityLevel, Auths, AuthType } from '@godaddy/gd-auth-lib';

export default makeGasket({
  plugins: [
    pluginAuth,
    pluginJwt,
    // ... other plugins
  ],
  jwt: {
    'my-service': {
      // Use constants instead of hardcoded values
      securityLevel: SecurityLevel.MEDIUM,
      auths: [Auths.S2S],
      authType: AuthType.JOMAX
    }
  }
  // ... other config
});
```

### Step 4: Deploy and Monitor
- Deploy to staging environment first
- Monitor authentication metrics
- Gradually roll out to production

## Troubleshooting

### Common Issues

1. **Missing pcpId in Production**
   ```
   Error: FFI Library: pcpId is required when useFFILibrary is enabled
   ```
   **Solution**: Configure `auth.pcpId` in your gasket.js

2. **Performance Differences**
   - FFI library may have different performance characteristics
   - Monitor authentication latency and adjust if needed

3. **Token Validation Differences**
   - Both libraries should validate tokens identically
   - Report any discrepancies as bugs

### Debug Mode

Enable debug logging to troubleshoot authentication issues:

```javascript
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginAuth from '@godaddy/gasket-plugin-auth';
import pluginLogger from '@gasket/plugin-logger';

export default makeGasket({
  plugins: [
    pluginAuth,
    pluginLogger,
    // ... other plugins
  ],
  auth: {
    useFFILibrary: true,
    // ... config
  },
  logger: {
    level: 'debug'
  }
  // ... other config
});
```

## Support

For issues related to the FFI library integration:
1. Check this documentation first
2. Review the [main authentication documentation](../README.md)
3. File issues in the Gasket repository
4. Contact the authentication team for FFI-specific questions