# Gasket HCS Examples

This document provides working examples for all methods, HOCs, and functions available in the `@godaddy/gasket-hcs` package.

## Table of Contents

- [withManifest HOC](#withmanifest-hoc)
- [Events Emitted by withManifest](#events-emitted-by-withmanifest)
- [mergeProps Function](#mergeprops-function)
- [Browser Globals](#browser-globals)

## withManifest HOC

The `withManifest` Higher-Order Component wraps React components to provide HCS (Header Component System) functionality, including customer state, navigation management, traffic initialization, and internationalization.

### Basic Usage

```jsx
import React from 'react';
import { withManifest } from '@godaddy/gasket-hcs';

function MyHeader() {
  return (
    <div>
      <h1>My Application Header</h1>
    </div>
  );
}

export default withManifest(MyHeader);
```

### Complete Example with All Options

```jsx
import React from 'react';
import { withManifest } from '@godaddy/gasket-hcs';

function MyAdvancedHeader({
  customer,
  navigation,
  navigationRight,
  headerMethods,
  market,
  privateLabelId,
  orderId,
  // Props from usePageConfig are spread in
  // Props from useHivemind are spread in
  ...otherProps
}) {
  const handleUpdateNavigation = () => {
    headerMethods.updateNavigation([
      { href: '/new-page', text: 'New Page' }
    ]);
  };

  return (
    <div>
      <h1>Welcome {customer?.customer?.displayName || 'Guest'}</h1>
      <p>Market: {market}</p>
      <p>Private Label ID: {privateLabelId}</p>
      <p>Order ID: {orderId}</p>
      <p>Logged In: {customer?.loggedIn ? 'Yes' : 'No'}</p>

      <nav>
        {navigation?.map((item, index) => (
          <a key={index} href={item.href}>{item.text}</a>
        ))}
      </nav>

      <button onClick={handleUpdateNavigation}>
        Update Navigation
      </button>
    </div>
  );
}

export default withManifest(MyAdvancedHeader, {
  renderAccountDelegation: true,
  initCustomerState: true,
  initTraffic: true,
  additionalHeaderMethods: {
    customMethod: () => console.log('Custom header method'),
    anotherMethod: (data) => console.log('Processing:', data)
  },
  componentName: 'header'
});
```

### Footer Component Example

```jsx
import React from 'react';
import { withManifest } from '@godaddy/gasket-hcs';

function MyFooter({ customer, market, urls }) {
  return (
    <footer>
      <p>&copy; 2024 My Company</p>
      <p>Market: {market}</p>
      {customer?.loggedIn && (
        <a href={urls?.sso?.exitDelegation?.href}>Sign Out</a>
      )}
    </footer>
  );
}

export default withManifest(MyFooter, {
  componentName: 'footer',
  initCustomerState: true,
  renderAccountDelegation: false
});
```

### Using with Custom Target Window

```jsx
import React from 'react';
import { withManifest } from '@godaddy/gasket-hcs';

function MyComponent({ headerMethods }) {
  React.useEffect(() => {
    // Custom target allows testing or iframe scenarios
    headerMethods.updateNavigation([
      { href: '/custom', text: 'Custom Link' }
    ]);
  }, [headerMethods]);

  return <div>Component with custom window target</div>;
}

// Usage with custom target
function AppWithCustomTarget() {
  const customTarget = {
    // Mock window object for testing
    location: { href: 'http://example.com' },
    document: { querySelector: () => null }
  };

  const WrappedComponent = withManifest(MyComponent);

  return (
    <WrappedComponent
      target={customTarget}
      market="en-US"
      messages={{}}
      supportMatrix={{}}
      urls={{
        gui: { href: 'https://api.example.com' },
        sso: {
          exitDelegation: { href: '/logout' },
          restoreCookie: { href: '/restore' }
        }
      }}
    />
  );
}
```

### Accessing Header Methods

```jsx
import React from 'react';
import { withManifest } from '@godaddy/gasket-hcs';
import { events } from '@ux/header-util';

function NavigationManager() {
  React.useEffect(() => {
    // Listen for header mount event
    const handleHeaderMount = (componentName, methods) => {
      if (componentName === 'header') {
        // Update left navigation with callback
        methods.updateNavigation([
          { href: '/', text: 'Home' },
          { href: '/about', text: 'About' },
          { href: '/contact', text: 'Contact' }
        ], false, () => {
          console.log('Left navigation updated successfully');
        });

        // Update right navigation with callback
        methods.updateNavigation([
          { href: '/login', text: 'Login' },
          { href: '/signup', text: 'Sign Up' }
        ], true, () => {
          console.log('Right navigation updated successfully');
        });

        // Alternative syntax - if second param is function, it's treated as callback for left nav
        methods.updateNavigation([
          { href: '/help', text: 'Help' }
        ], () => {
          console.log('Left navigation updated (alternative syntax)');
        });
      }
    };

    events.on('mount', handleHeaderMount);

    return () => events.off('mount', handleHeaderMount);
  }, []);

  return <div>Navigation will be updated via events</div>;
}

function MyHeader({ navigation, navigationRight, headerMethods }) {
  // Note: navigation and navigationRight get their initial values from usePageConfig(target)
  // They can be updated via headerMethods.updateNavigation()

  return (
    <header>
      <nav className="left-nav">
        {navigation?.map((item, index) => (
          <a key={index} href={item.href}>{item.text}</a>
        ))}
      </nav>

      <nav className="right-nav">
        {navigationRight?.map((item, index) => (
          <a key={index} href={item.href}>{item.text}</a>
        ))}
      </nav>

      <NavigationManager />
    </header>
  );
}

export default withManifest(MyHeader, {
  initCustomerState: true,
  additionalHeaderMethods: {
    customAction: () => console.log('Custom action triggered')
  }
});
```

### With Hivemind Integration

```jsx
import React from 'react';
import { withManifest } from '@godaddy/gasket-hcs';

function MyHivemindHeader({ customer, hivemind }) {
  const experimentData = hivemind?.experiments || {};
  const showNewFeature = experimentData.newFeatureExperiment === 'treatment';

  return (
    <header>
      <h1>My App {showNewFeature && '✨ NEW!'}</h1>
      {customer?.loggedIn && (
        <p>Welcome back, {customer.customer?.displayName}!</p>
      )}
    </header>
  );
}

export default withManifest(MyHivemindHeader, {
  initCustomerState: true,
  renderAccountDelegation: true
});

// Usage with hivemind props
function App() {
  return (
    <MyHivemindHeader
      enableHivemindProvider={true}
      hivemind={{
        experiments: {
          newFeatureExperiment: 'treatment'
        }
      }}
      market="en-US"
      messages={{}}
      urls={{
        gui: { href: 'https://api.example.com' },
        sso: {
          exitDelegation: { href: '/logout' },
          restoreCookie: { href: '/restore' }
        }
      }}
      supportMatrix={{}}
    />
  );
}
```

### With Browser Support and Skip Navigation

```jsx
import React from 'react';
import { withManifest } from '@godaddy/gasket-hcs';

function AccessibleHeader() {
  return (
    <header>
      <h1>Accessible Header</h1>
      <main id="main-content">
        <p>Main content starts here</p>
      </main>
    </header>
  );
}

export default withManifest(AccessibleHeader, {
  componentName: 'header'
});

// Usage with accessibility and browser support
function App() {
  return (
    <AccessibleHeader
      market="en-US"
      messages={{
        'Shared:Common:SkipToMainContent': 'Skip to main content'
      }}
      skipToMainContentLink={{
        id: 'main-content', // defaults to 'uxContent' if not provided
        caption: 'Jump to main content',
        optionalAttributes: {
          'aria-label': 'Skip navigation and go to main content'
        }
      }}
      supportMatrix={{
        chrome: { min: '90' },
        firefox: { min: '88' },
        safari: { min: '14' }
      }}
      whitelistedUserAgents={[
        'MyApp/1.0',
        'CustomBot/2.0'
      ]}
      blacklistedBrowsers={[
        { browser: 'Internet Explorer', version: 11 },
        { browser: 'Edge', version: 18 }
      ]}
      disableDeprecationBanner={false}
      urls={{
        gui: { href: 'https://api.example.com' },
        sso: {
          exitDelegation: { href: '/logout' },
          restoreCookie: { href: '/restore' }
        }
      }}
      supportMatrix={{}}
    />
  );
}
```

## Events Emitted by withManifest

The `withManifest` HOC emits several events via the `@ux/header-util` events system that you can listen to in your application.

### Mount Events

```javascript
import { events } from '@ux/header-util';

// Listen for any component mount
events.on('mount', (componentName, headerMethods) => {
  console.log(`Component ${componentName} mounted with methods:`, headerMethods);
});

// Listen for specific component mount (e.g., 'header' or 'footer')
events.on('mount:header', (headerMethods) => {
  console.log('Header mounted with methods:', headerMethods);
  // headerMethods contains: { updateNavigation, ...additionalHeaderMethods }
});

events.on('mount:footer', (headerMethods) => {
  console.log('Footer mounted with methods:', headerMethods);
});
```

### Navigation Update Events

```javascript
import { events } from '@ux/header-util';

// Listen for navigation updates
events.on('navigation:updated', () => {
  console.log('Left navigation was updated');
});

events.on('navigationRight:updated', () => {
  console.log('Right navigation was updated');
});

// Example: Synchronize external state with navigation changes
function NavigationSync() {
  React.useEffect(() => {
    const handleNavUpdate = () => {
      // Sync with external analytics, state management, etc.
      analytics.track('navigation_updated');
    };

    events.on('navigation:updated', handleNavUpdate);
    events.on('navigationRight:updated', handleNavUpdate);

    return () => {
      events.off('navigation:updated', handleNavUpdate);
      events.off('navigationRight:updated', handleNavUpdate);
    };
  }, []);

  return null;
}
```

### Complete Event Integration Example

```javascript
import React from 'react';
import { withManifest } from '@godaddy/gasket-hcs';
import { events } from '@ux/header-util';

function EventAwareHeader({ navigation, navigationRight }) {
  const [eventLog, setEventLog] = React.useState([]);

  React.useEffect(() => {
    const logEvent = (eventName) => (data) => {
      setEventLog(prev => [...prev, {
        event: eventName,
        timestamp: Date.now(),
        data: typeof data === 'object' ? JSON.stringify(data) : data
      }]);
    };

    // Listen to all relevant events
    events.on('mount', logEvent('mount'));
    events.on('mount:header', logEvent('mount:header'));
    events.on('navigation:updated', logEvent('navigation:updated'));
    events.on('navigationRight:updated', logEvent('navigationRight:updated'));

    return () => {
      events.off('mount', logEvent('mount'));
      events.off('mount:header', logEvent('mount:header'));
      events.off('navigation:updated', logEvent('navigation:updated'));
      events.off('navigationRight:updated', logEvent('navigationRight:updated'));
    };
  }, []);

  return (
    <div>
      <h1>Event-Aware Header</h1>

      <nav>
        {navigation?.map((item, index) => (
          <a key={index} href={item.href}>{item.text}</a>
        ))}
      </nav>

      <details>
        <summary>Event Log ({eventLog.length} events)</summary>
        <ul>
          {eventLog.map((log, index) => (
            <li key={index}>
              {new Date(log.timestamp).toLocaleTimeString()}: {log.event}
              {log.data && <pre>{log.data}</pre>}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export default withManifest(EventAwareHeader, {
  initCustomerState: true,
  componentName: 'header'
});
```

### updateNavigation Method Examples

```javascript
import { withManifest } from '@godaddy/gasket-hcs';

function NavigationExamples({ headerMethods }) {
  const handleDemoNavigation = () => {
    // Example 1: Update left navigation only
    headerMethods.updateNavigation([
      { href: '/', text: 'Home' },
      { href: '/products', text: 'Products' }
    ]);

    // Example 2: Update left navigation with callback
    headerMethods.updateNavigation([
      { href: '/', text: 'Home' },
      { href: '/about', text: 'About' }
    ], () => {
      console.log('Left navigation updated');
    });

    // Example 3: Update right navigation only
    headerMethods.updateNavigation([
      { href: '/login', text: 'Login' },
      { href: '/signup', text: 'Sign Up' }
    ], true);

    // Example 4: Update right navigation with callback
    headerMethods.updateNavigation([
      { href: '/account', text: 'Account' },
      { href: '/logout', text: 'Logout' }
    ], true, () => {
      console.log('Right navigation updated');
    });

    // Example 5: Explicitly update left navigation with callback
    headerMethods.updateNavigation([
      { href: '/dashboard', text: 'Dashboard' }
    ], false, () => {
      console.log('Left navigation explicitly updated');
    });

    // Example 6: Clear navigation (empty array)
    headerMethods.updateNavigation([], true); // Clear right nav
    headerMethods.updateNavigation([]);       // Clear left nav
  };

  return (
    <div>
      <button onClick={handleDemoNavigation}>
        Demo All Navigation Patterns
      </button>
    </div>
  );
}

export default withManifest(NavigationExamples);
```

## mergeProps Function

The `mergeProps` function performs deep merging of multiple props objects. It's available both as a named export and as a browser global at `window.ux.hcs.mergeProps`.

### Basic Usage

```javascript
import { mergeProps } from '@godaddy/gasket-hcs';

const baseProps = {
  theme: 'dark',
  navigation: [
    { href: '/', text: 'Home' }
  ],
  config: {
    api: {
      timeout: 5000
    }
  }
};

const headerProps = {
  navigation: [
    { href: '/about', text: 'About' }
  ],
  config: {
    api: {
      retries: 3
    },
    features: {
      newDesign: true
    }
  }
};

const footerProps = {
  copyright: '2024 My Company',
  config: {
    analytics: {
      enabled: true
    }
  }
};

const mergedProps = mergeProps(baseProps, headerProps, footerProps);

console.log(mergedProps);
// Output:
// {
//   theme: 'dark',
//   navigation: [
//     { href: '/', text: 'Home' },
//     { href: '/about', text: 'About' }
//   ],
//   copyright: '2024 My Company',
//   config: {
//     api: {
//       timeout: 5000,
//       retries: 3
//     },
//     features: {
//       newDesign: true
//     },
//     analytics: {
//       enabled: true
//     }
//   }
// }
```

### React Component Example

```jsx
import React from 'react';
import { mergeProps } from '@godaddy/gasket-hcs';

function ConfigurableComponent({ baseConfig, userConfig, ...otherProps }) {
  const finalConfig = mergeProps(
    {
      // Default configuration
      theme: 'light',
      features: {
        darkMode: false,
        animations: true
      },
      api: {
        timeout: 3000,
        baseUrl: '/api'
      }
    },
    baseConfig || {},
    userConfig || {},
    otherProps
  );

  return (
    <div className={`theme-${finalConfig.theme}`}>
      <h1>Configurable Component</h1>
      <pre>{JSON.stringify(finalConfig, null, 2)}</pre>
    </div>
  );
}

// Usage
function App() {
  const baseConfig = {
    features: {
      darkMode: true
    },
    api: {
      retries: 2
    }
  };

  const userConfig = {
    theme: 'dark',
    features: {
      animations: false
    },
    customSettings: {
      autoSave: true
    }
  };

  return (
    <ConfigurableComponent
      baseConfig={baseConfig}
      userConfig={userConfig}
      api={{ timeout: 5000 }}
    />
  );
}
```

### Advanced Merging with Arrays

```javascript
import { mergeProps } from '@godaddy/gasket-hcs';

const defaultNavigation = {
  items: [
    { id: 'home', href: '/', text: 'Home' },
    { id: 'about', href: '/about', text: 'About' }
  ],
  settings: {
    position: 'top',
    style: 'horizontal'
  }
};

const userNavigation = {
  items: [
    { id: 'contact', href: '/contact', text: 'Contact' },
    { id: 'blog', href: '/blog', text: 'Blog' }
  ],
  settings: {
    style: 'vertical',
    showIcons: true
  }
};

const adminNavigation = {
  items: [
    { id: 'admin', href: '/admin', text: 'Admin Panel' }
  ],
  settings: {
    requireAuth: true
  }
};

const finalNavigation = mergeProps(
  defaultNavigation,
  userNavigation,
  adminNavigation
);

console.log(finalNavigation);
// Output:
// {
//   items: [
//     { id: 'home', href: '/', text: 'Home' },
//     { id: 'about', href: '/about', text: 'About' },
//     { id: 'contact', href: '/contact', text: 'Contact' },
//     { id: 'blog', href: '/blog', text: 'Blog' },
//     { id: 'admin', href: '/admin', text: 'Admin Panel' }
//   ],
//   settings: {
//     position: 'top',
//     style: 'vertical',
//     showIcons: true,
//     requireAuth: true
//   }
// }
```

### Complex Nested Object Merging

```javascript
import { mergeProps } from '@godaddy/gasket-hcs';

const appDefaults = {
  api: {
    endpoints: {
      users: '/api/users',
      orders: '/api/orders'
    },
    config: {
      timeout: 3000,
      retries: 1
    }
  },
  ui: {
    theme: {
      primary: '#blue',
      secondary: '#gray'
    },
    layout: {
      sidebar: true,
      header: true
    }
  }
};

const environmentConfig = {
  api: {
    endpoints: {
      products: '/api/v2/products'
    },
    config: {
      timeout: 5000,
      baseUrl: 'https://api.production.com'
    }
  },
  ui: {
    theme: {
      primary: '#green'
    }
  }
};

const userPreferences = {
  ui: {
    theme: {
      dark: true
    },
    layout: {
      sidebar: false
    },
    accessibility: {
      highContrast: true,
      fontSize: 'large'
    }
  }
};

const finalConfig = mergeProps(
  appDefaults,
  environmentConfig,
  userPreferences
);

console.log(JSON.stringify(finalConfig, null, 2));
// Output:
// {
//   "api": {
//     "endpoints": {
//       "users": "/api/users",
//       "orders": "/api/orders",
//       "products": "/api/v2/products"
//     },
//     "config": {
//       "timeout": 5000,
//       "retries": 1,
//       "baseUrl": "https://api.production.com"
//     }
//   },
//   "ui": {
//     "theme": {
//       "primary": "#green",
//       "secondary": "#gray",
//       "dark": true
//     },
//     "layout": {
//       "sidebar": false,
//       "header": true
//     },
//     "accessibility": {
//       "highContrast": true,
//       "fontSize": "large"
//     }
//   }
// }
```

## Browser Globals

The package automatically adds the `mergeProps` function to the browser's global scope when running in a browser environment.

### Using Browser Global

```html
<!DOCTYPE html>
<html>
<head>
    <title>HCS Browser Example</title>
</head>
<body>
    <script src="path/to/gasket-hcs.js"></script>
    <script>
        // Access mergeProps from global scope
        const baseProps = {
            theme: 'light',
            navigation: [{ href: '/', text: 'Home' }]
        };

        const userProps = {
            theme: 'dark',
            navigation: [{ href: '/profile', text: 'Profile' }]
        };

        // Use the global mergeProps function
        const merged = window.ux.hcs.mergeProps(baseProps, userProps);

        console.log('Merged props:', merged);
        // Output:
        // {
        //   theme: 'dark',
        //   navigation: [
        //     { href: '/', text: 'Home' },
        //     { href: '/profile', text: 'Profile' }
        //   ]
        // }
    </script>
</body>
</html>
```

### Integration with Existing UX Object

```javascript
// The package extends the existing window.ux object
if (typeof window !== 'undefined') {
  console.log(window.ux);
  // Output:
  // {
  //   hcs: {
  //     mergeProps: function(...)
  //   }
  //   // ... other ux properties
  // }

  // Safe access pattern
  const mergeProps = window.ux?.hcs?.mergeProps;
  if (mergeProps) {
    const result = mergeProps({ a: 1 }, { b: 2 });
    console.log(result); // { a: 1, b: 2 }
  }
}
```

### Polyfill Detection

```javascript
// Check if mergeProps is available globally
function getMyMergeProps() {
  // Prefer global version if available
  if (typeof window !== 'undefined' && window.ux?.hcs?.mergeProps) {
    return window.ux.hcs.mergeProps;
  }

  // Fallback to imported version
  return require('@godaddy/gasket-hcs').mergeProps;
}

// Usage
const mergeProps = getMyMergeProps();
const result = mergeProps({ a: 1 }, { b: 2 }, { c: 3 });
console.log(result); // { a: 1, b: 2, c: 3 }
```

## Important Implementation Details

### Required Props

The following props are **required** when using `withManifest`:

- `market` (string) - Customer's market locale
- `messages` (object) - i18n translations for components
- `supportMatrix` (object) - List of supported browsers
- `urls` (object) - Collection of GoDaddy URLs with required structure:
  ```javascript
  {
    gui: { href: string },
    sso: {
      exitDelegation: { href: string },
      restoreCookie: { href: string }
    }
  }
  ```

### Props Automatically Injected by withManifest

The wrapped component receives these additional props automatically:

- `customer` - From `useCustomerDetails()` with structure:
  ```javascript
  {
    customer: { displayName, ... }, // customer data object
    loggedIn: boolean // derived from customer state + account delegation
  }
  ```
- `orderId` - From `useOrderDetails(target)`
- `navigation` - From `usePageConfig(target).navigation` (array)
- `navigationRight` - From `usePageConfig(target).navigationRight` (array)
- `headerMethods` - Object containing `updateNavigation` + any `additionalHeaderMethods`
- Spread of `pageConfig` result from `usePageConfig(target)` (excluding navigation properties)
- Spread of `useHivemind(target, props.hivemind)` result

### Navigation Behavior

- Initial navigation comes from `usePageConfig(target)`
- Navigation can be updated via `headerMethods.updateNavigation(nav, right, done)`

**Method Signatures (all valid patterns):**
- `updateNavigation(nav)` - Updates left navigation, no callback
- `updateNavigation(nav, callback)` - Updates left navigation with callback
- `updateNavigation(nav, true)` - Updates right navigation, no callback
- `updateNavigation(nav, false)` - Updates left navigation, no callback
- `updateNavigation(nav, true, callback)` - Updates right navigation with callback
- `updateNavigation(nav, false, callback)` - Updates left navigation with callback

**Parameter Shift Logic:** If the second parameter is a function, it's treated as the callback and `right` defaults to `false` (left navigation).

- Events are emitted when navigation updates: `'navigation:updated'` and `'navigationRight:updated'`

### Skip Navigation Default

- `skipToMainContentLink.id` defaults to `'uxContent'` if not provided
- Only rendered when `componentName === 'header'`

### Account Delegation Logic

Account delegation banner is shown when ALL conditions are met:
- `props.features?.accountDelegationBanner !== false`
- `renderAccountDelegation === true` (from HOC options)
- `customer?.customer` exists (user is logged in)
- `props.preset !== 'internal-header'`

### @ux/header-util Hook Signatures

These are the expected signatures for hooks from `@ux/header-util`:

**useCustomerDetails(guiUrl, options)**
- `guiUrl` (string) - Fixed GUI URL from `url.fixGuiUrl(urls.gui.href)`
- `options` (object) - `{ shouldAuthenticate, privateLabelId, preset, initCustomerState }`
- Returns: `{ customer?: object, loggedIn?: boolean, ...otherProps }`

**useOrderDetails(target)**
- `target` (object) - Window object or mock target
- Returns: Order ID (string/number) or undefined

**usePageConfig(target)**
- `target` (object) - Window object or mock target
- Returns: `{ navigation?: array, navigationRight?: array, ...otherPageConfig }`

**useHivemind(target, hivemindConfig)**
- `target` (object) - Window object or mock target
- `hivemindConfig` (object) - Hivemind configuration from props
- Returns: Object that gets spread into component props

**useTraffic(traffic, options)**
- `traffic` (boolean) - Traffic initialization flag from props
- `options` (object) - `{ initTraffic }` from HOC options
- Returns: void (side effect only)

**events**
- `events.emit(eventName, ...args)` - Emit an event
- `events.once(eventName, callback)` - Listen for event once
- `events.on(eventName, callback)` - Listen for event (for user code)
- `events.off(eventName, callback)` - Remove event listener (for user code)

**url**
- `url.fixGuiUrl(url)` - Fix/normalize GUI URL

## Complete Integration Example

Here's a complete example showing how to use all the features together:

```jsx
import React from 'react';
import { withManifest, mergeProps } from '@godaddy/gasket-hcs';
import { events } from '@ux/header-util';

function CompleteHCSExample({
  customer,
  navigation,
  navigationRight,
  headerMethods,
  market,
  privateLabelId,
  baseProps,
  userProps
}) {
  // Merge configuration props
  const config = mergeProps(
    {
      // Default configuration
      features: {
        showUserName: true,
        showNavigation: true
      },
      styling: {
        theme: 'light',
        compact: false
      }
    },
    baseProps || {},
    userProps || {}
  );

    // Handle navigation updates
  React.useEffect(() => {
    const handleNavigationUpdate = (methods) => {
      if (config.features.showNavigation && methods) {
        methods.updateNavigation([
          { href: '/', text: 'Home' },
          { href: '/products', text: 'Products' },
          { href: '/support', text: 'Support' }
        ]);
      }
    };

    // Listen for mount:header event (emitted when header mounts)
    // Also listen for generic 'mount' event which passes componentName as first arg
    events.on('mount:header', handleNavigationUpdate);

    return () => events.off('mount:header', handleNavigationUpdate);
  }, [config.features.showNavigation]);

  return (
    <header className={`theme-${config.styling.theme} ${config.styling.compact ? 'compact' : ''}`}>
      <h1>My Application</h1>

      {config.features.showUserName && customer?.loggedIn && (
        <div className="user-info">
          Welcome, {customer.customer?.displayName}!
        </div>
      )}

      {config.features.showNavigation && (
        <>
          <nav className="main-nav">
            {navigation.map((item, index) => (
              <a key={index} href={item.href}>{item.text}</a>
            ))}
          </nav>

          <nav className="secondary-nav">
            {navigationRight.map((item, index) => (
              <a key={index} href={item.href}>{item.text}</a>
            ))}
          </nav>
        </>
      )}

      <div className="meta-info">
        <p>Market: {market}</p>
        <p>Private Label: {privateLabelId}</p>
      </div>
    </header>
  );
}

export default withManifest(CompleteHCSExample, {
  renderAccountDelegation: true,
  initCustomerState: true,
  initTraffic: true,
  additionalHeaderMethods: {
    resetNavigation: (methods) => {
      methods.updateNavigation([]);
    },
    addNavigationItem: (methods, item) => {
      methods.updateNavigation(prev => [...prev, item]);
    }
  },
  componentName: 'header'
});

// Usage
function App() {
  const baseProps = {
    features: {
      showUserName: true
    },
    styling: {
      theme: 'dark'
    }
  };

  const userProps = {
    styling: {
      compact: true
    }
  };

  return (
    <CompleteHCSExample
      baseProps={baseProps}
      userProps={userProps}
      market="en-US"
      privateLabelId={1}
      messages={{
        'Shared:Common:SkipToMainContent': 'Skip to main content'
      }}
      urls={{
        gui: { href: 'https://api.example.com' },
        sso: {
          exitDelegation: { href: '/logout' },
          restoreCookie: { href: '/restore' }
        }
      }}
      supportMatrix={{}}
      shouldAuthenticate={true}
      enableHivemindProvider={false}
    />
  );
}
```
