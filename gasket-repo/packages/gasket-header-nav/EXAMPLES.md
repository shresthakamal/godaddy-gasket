# Gasket Header Nav Examples

This document provides working examples for all methods, HOCs, and functions available in `@godaddy/gasket-header-nav`.

## Table of Contents

- [withHeaderNav HOC (Pages Router)](#withheadernav-hoc-pages-router)
  - [Basic HOC Usage](#basic-hoc-usage)
  - [HOC with Function Configuration](#hoc-with-function-configuration)
  - [HOC with Navigation Object](#hoc-with-navigation-object)
- [withHeaderNav HOC (App Router)](#withheadernav-hoc-app-router)
  - [App Router HOC Usage](#app-router-hoc-usage)
  - [App Router HOC with Props](#app-router-hoc-with-props)
- [Navigation Component (Pages Router)](#navigation-component-pages-router)
  - [Basic Usage](#basic-usage)
  - [Multi-Section Navigation](#multi-section-navigation)
  - [Navigation with Custom Active Check](#navigation-with-custom-active-check)
  - [Navigation with Callbacks](#navigation-with-callbacks)
  - [Complex Navigation Items](#complex-navigation-items)
- [AppRouterNavigation Component (App Router)](#approuternavigation-component-app-router)
  - [Basic Usage with App Router](#basic-usage-with-app-router)
  - [App Router with Dynamic Navigation](#app-router-with-dynamic-navigation)
- [Active Check Functions](#active-check-functions)
  - [defaultActiveCheck](#defaultactivecheck)
  - [nonExactActiveCheck](#nonexactactivecheck)
  - [Custom Active Check](#custom-active-check)
- [Utility Functions](#utility-functions)
- [Advanced Examples](#advanced-examples)
  - [Navigation with Header API Integration](#navigation-with-header-api-integration)
  - [Conditional Navigation Based on User Permissions](#conditional-navigation-based-on-user-permissions)
  - [Navigation with Analytics Tracking](#navigation-with-analytics-tracking)
  - [Multi-Level Navigation with Children](#multi-level-navigation-with-children)

## withHeaderNav HOC (Pages Router)

### Basic HOC Usage

```jsx
// pages/products.js
import { withHeaderNav } from '@godaddy/gasket-header-nav';

function ProductsPage() {
  return (
    <div>
      <h1>Products</h1>
      <p>Product listings here...</p>
    </div>
  );
}

export default withHeaderNav([
  { caption: 'All Products', href: '/products' },
  { caption: 'Featured', href: '/products/featured' },
  { caption: 'On Sale', href: '/products/sale' }
])(ProductsPage);
```

### HOC with Function Configuration

```jsx
import { withHeaderNav } from '@godaddy/gasket-header-nav';

function DynamicPage({ category }) {
  return (
    <div>
      <h1>Category: {category}</h1>
    </div>
  );
}

export default withHeaderNav((props) => ({
  bottom: [
    { caption: 'All Categories', href: '/categories' },
    { caption: `Current: ${props.category}`, href: `/categories/${props.category}` }
  ],
  right: [
    { caption: 'Filter', href: '/filter' }
  ]
}))(DynamicPage);
```

### HOC with Navigation Object

```jsx
import { withHeaderNav } from '@godaddy/gasket-header-nav';

function AdminPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
    </div>
  );
}

export default withHeaderNav({
  top: { caption: 'Admin Panel', href: '/admin' },
  bottom: [
    { caption: 'Users', href: '/admin/users' },
    { caption: 'Settings', href: '/admin/settings' }
  ],
  side: [
    { caption: 'Analytics', href: '/admin/analytics' },
    { caption: 'Reports', href: '/admin/reports' }
  ]
})(AdminPage);
```

## withHeaderNav HOC (App Router)

### App Router HOC Usage

```jsx
// app/products/page.js
'use client';
import { withHeaderNav } from '@godaddy/gasket-header-nav/layout';

function ProductsPage() {
  return (
    <div>
      <h1>Products</h1>
      <p>Product listings here...</p>
    </div>
  );
}

export default withHeaderNav([
  { caption: 'All Products', href: '/products' },
  { caption: 'Categories', href: '/products/categories' },
  { caption: 'Brands', href: '/products/brands' }
])(ProductsPage);
```

### App Router HOC with Props

```jsx
'use client';
import { withHeaderNav } from '@godaddy/gasket-header-nav/layout';

function UserDashboard({ userId }) {
  return (
    <div>
      <h1>User Dashboard</h1>
      <p>User ID: {userId}</p>
    </div>
  );
}

export default withHeaderNav((props) => [
  { caption: 'Dashboard', href: '/dashboard' },
  { caption: 'Profile', href: `/users/${props.userId}` },
  { caption: 'Settings', href: '/settings' }
])(UserDashboard);
```

## Navigation Component (Pages Router)

### Basic Usage

```jsx
// pages/_app.js
import Navigation from '@godaddy/gasket-header-nav';

function Layout({ Component, pageProps }) {
  return (
    <>
      <Navigation
        bottom={[
          { caption: 'Home', href: '/' },
          { caption: 'About', href: '/about' },
          { caption: 'Contact', href: '/contact' }
        ]}
      />
      <Component {...pageProps} />
    </>
  );
}

export default Layout;
```

### Multi-Section Navigation

```jsx
import Navigation from '@godaddy/gasket-header-nav';

function App() {
  return (
    <>
      <Navigation
        top={{ caption: 'Dashboard', href: '/dashboard' }}
        bottom={[
          { caption: 'Products', href: '/products' },
          { caption: 'Services', href: '/services' }
        ]}
        right={[
          { caption: 'Profile', href: '/profile' },
          { caption: 'Settings', href: '/settings' }
        ]}
        side={[
          { caption: 'Analytics', href: '/analytics' },
          { caption: 'Reports', href: '/reports' }
        ]}
      />
      {/* Your app content */}
    </>
  );
}
```

### Navigation with Custom Active Check

```jsx
import Navigation, { nonExactActiveCheck } from '@godaddy/gasket-header-nav';

function customActiveCheck(navItem, currentURL) {
  // Custom logic for determining active state
  return navItem.href && currentURL.startsWith(navItem.href);
}

function App() {
  return (
    <Navigation
      activeCheck={customActiveCheck}
      bottom={[
        {
          caption: 'Products',
          href: '/products',
          activeCheck: nonExactActiveCheck // Per-item override
        },
        { caption: 'Services', href: '/services' }
      ]}
    />
  );
}
```

### Navigation with Callbacks

```jsx
import Navigation from '@godaddy/gasket-header-nav';

function App() {
  const handleUpdate = (header) => {
    console.log('Navigation updated:', header);
    // Additional header customizations
    header.updateHelpUrl('https://help.example.com');
  };

  const handleClear = (header) => {
    console.log('Navigation cleared:', header);
  };

  return (
    <Navigation
      bottom={[
        { caption: 'Home', href: '/' },
        { caption: 'About', href: '/about' }
      ]}
      onUpdate={handleUpdate}
      onClear={handleClear}
    />
  );
}
```

### Complex Navigation Items

```jsx
import Navigation from '@godaddy/gasket-header-nav';

function App() {
  const navigationItems = [
    {
      caption: 'Products',
      href: '/products',
      eid: 'products-click', // Analytics tracking
      children: [
        { caption: 'Web Hosting', href: '/products/hosting' },
        { caption: 'Domains', href: '/products/domains' }
      ]
    },
    {
      caption: 'External Link',
      href: 'https://external.com',
      target: '_blank',
      fullLoad: true // Forces full page load
    },
    {
      caption: 'Custom Action',
      onClick: () => alert('Custom action triggered!'),
      active: true // Explicitly set active state
    }
  ];

  return (
    <Navigation
      bottom={navigationItems}
    />
  );
}
```

## AppRouterNavigation Component (App Router)

### Basic Usage with App Router

```jsx
// app/layout.js
'use client';
import AppRouterNavigation from '@godaddy/gasket-header-nav/layout';

export default function Layout({ children }) {
  return (
    <>
      <AppRouterNavigation
        bottom={[
          { caption: 'Home', href: '/' },
          { caption: 'About', href: '/about' },
          { caption: 'Contact', href: '/contact' }
        ]}
      />
      {children}
    </>
  );
}
```

### App Router with Dynamic Navigation

```jsx
'use client';
import AppRouterNavigation from '@godaddy/gasket-header-nav/layout';
import { useUser } from '@/hooks/useUser';

export default function DynamicNav() {
  const { user, isAdmin } = useUser();

  const navigationItems = [
    { caption: 'Home', href: '/' },
    { caption: 'Dashboard', href: '/dashboard' }
  ];

  if (isAdmin) {
    navigationItems.push({ caption: 'Admin', href: '/admin' });
  }

  return (
    <AppRouterNavigation
      bottom={navigationItems}
      right={user ? [
        { caption: user.name, href: '/profile' }
      ] : [
        { caption: 'Login', href: '/login' }
      ]}
    />
  );
}
```

## Active Check Functions

### defaultActiveCheck

```jsx
import { defaultActiveCheck } from '@godaddy/gasket-header-nav';

// Usage in custom logic
const navItem = { href: '/products' };
const currentURL = '/products?plid=123';
const isActive = defaultActiveCheck(navItem, currentURL); // true

// Usage with Navigation component (default behavior)
function App() {
  return (
    <Navigation
      bottom={[
        { caption: 'Products', href: '/products' } // Uses defaultActiveCheck
      ]}
    />
  );
}
```

### nonExactActiveCheck

```jsx
import Navigation, { nonExactActiveCheck } from '@godaddy/gasket-header-nav';

// Usage in custom logic
const navItem = { href: '/products' };
const currentURL = '/products/123?category=electronics';
const isActive = nonExactActiveCheck(navItem, currentURL); // true

// Usage with Navigation component
function App() {
  return (
    <Navigation
      activeCheck={nonExactActiveCheck}
      bottom={[
        { caption: 'Products', href: '/products' } // Will match /products/*
      ]}
    />
  );
}
```

### Custom Active Check

```jsx
import Navigation from '@godaddy/gasket-header-nav';

function startPathActiveCheck(navItem, currentURL) {
  return navItem.href && currentURL.startsWith(navItem.href);
}

function regexActiveCheck(navItem, currentURL) {
  if (!navItem.pattern) return false;
  return new RegExp(navItem.pattern).test(currentURL);
}

function App() {
  return (
    <Navigation
      bottom={[
        {
          caption: 'Blog',
          href: '/blog',
          activeCheck: startPathActiveCheck // Custom per-item check
        },
        {
          caption: 'Articles',
          pattern: '^/articles/\\d+',
          activeCheck: regexActiveCheck
        }
      ]}
    />
  );
}
```

## Advanced Examples

### Navigation with Header API Integration

```jsx
import Navigation from '@godaddy/gasket-header-nav';

function App() {
  const handleUpdate = (header) => {
    // Update cart count
    header.updateCart && header.updateCart(5);

    // Update help URL
    header.updateHelpUrl && header.updateHelpUrl('https://help.example.com');

    // Update waffle menu links
    header.updateWaffleLinks && header.updateWaffleLinks({
      topLinks: [
        { caption: 'My Account', href: '/account' },
        { caption: 'Support', href: '/support' }
      ],
      quickLinks: [
        { caption: 'Billing', href: '/billing' },
        { caption: 'Domains', href: '/domains' }
      ]
    });

    // For application-sidebar headers
    if ('updateSidebarNav' in header) {
      header.updateSidebarNav([
        { caption: 'Dashboard', href: '/dashboard' },
        { caption: 'Analytics', href: '/analytics' }
      ]);
    }
  };

  return (
    <Navigation
      bottom={[
        { caption: 'Home', href: '/' },
        { caption: 'Products', href: '/products' }
      ]}
      onUpdate={handleUpdate}
    />
  );
}
```

### Conditional Navigation Based on User Permissions

```jsx
import Navigation from '@godaddy/gasket-header-nav';
import { useAuth } from '@/hooks/useAuth';

function ConditionalNav() {
  const { user, hasPermission } = useAuth();

  const getNavigationItems = () => {
    const items = [
      { caption: 'Home', href: '/' }
    ];

    if (user) {
      items.push({ caption: 'Dashboard', href: '/dashboard' });
    }

    if (hasPermission('admin')) {
      items.push({ caption: 'Admin', href: '/admin' });
    }

    if (hasPermission('reports')) {
      items.push({ caption: 'Reports', href: '/reports' });
    }

    return items;
  };

  return (
    <Navigation
      bottom={getNavigationItems()}
      right={user ? [
        { caption: user.name, href: '/profile' },
        { caption: 'Logout', onClick: () => logout() }
      ] : [
        { caption: 'Login', href: '/login' }
      ]}
    />
  );
}
```

### Navigation with Analytics Tracking

```jsx
import Navigation from '@godaddy/gasket-header-nav';

function AnalyticsNav() {
  const trackNavClick = (item) => {
    // Custom analytics tracking
    analytics.track('nav_click', {
      page: item.href,
      caption: item.caption,
      section: 'main_nav'
    });
  };

  const navigationItems = [
    {
      caption: 'Products',
      href: '/products',
      eid: 'main_nav_products', // Built-in analytics
      onClick: (e) => {
        trackNavClick({ href: '/products', caption: 'Products' });
        // Don't prevent default - let normal navigation happen
      }
    },
    {
      caption: 'Services',
      href: '/services',
      eid: 'main_nav_services'
    }
  ];

  return <Navigation bottom={navigationItems} />;
}
```

### Multi-Level Navigation with Children

```jsx
import Navigation from '@godaddy/gasket-header-nav';

function MultiLevelNav() {
  const navigation = [
    {
      caption: 'Products',
      href: '/products',
      children: [
        {
          caption: 'Web Hosting',
          href: '/products/hosting',
          children: [
            { caption: 'Shared Hosting', href: '/products/hosting/shared' },
            { caption: 'VPS Hosting', href: '/products/hosting/vps' }
          ]
        },
        { caption: 'Domains', href: '/products/domains' },
        { caption: 'Email', href: '/products/email' }
      ]
    },
    {
      caption: 'Support',
      href: '/support',
      children: [
        { caption: 'Help Center', href: '/support/help' },
        { caption: 'Contact Us', href: '/support/contact' }
      ]
    }
  ];

  return <Navigation bottom={navigation} />;
}
```
