# @godaddy/gasket-next Examples

This document provides working examples for all methods, HOCs, and functions in the `@godaddy/gasket-next` package.

## Core Components and Functions

### App

The default Gasket app component.

```jsx
// pages/_app.js
import { App } from '@godaddy/gasket-next';

export default App;
```

### createApp

Create a custom Gasket app with layout and configuration options.

```jsx
// pages/_app.js
import { createApp } from '@godaddy/gasket-next';

// Basic usage
const BasicApp = createApp();
export default BasicApp;

// With custom layout
function CustomLayout({ Component, pageProps }) {
  return (
    <div className="app-container">
      <header>My App Header</header>
      <Component {...pageProps} />
      <footer>My App Footer</footer>
    </div>
  );
}

const AppWithLayout = createApp({
  Layout: CustomLayout,
  strictMode: true,
  mainRole: true,
  initialProps: false
});

export default AppWithLayout;
```

### withPageEnhancers

Apply HOCs to all pages in your application.

```jsx
// pages/_app.js
import { withPageEnhancers, createApp } from '@godaddy/gasket-next';
import { withAuthRequired } from '@godaddy/gasket-auth';
import { withLocaleRequired } from '@gasket/intl';

// Create enhancers array
const enhancers = [
  withAuthRequired({ realm: 'jomax' }),
  withLocaleRequired('my-app')
];

// Apply to app
const App = createApp();
export default withPageEnhancers(enhancers)(App);

// With options
export default withPageEnhancers(enhancers, {
  initialProps: true
})(App);
```

### reportWebVitals

Report web vitals for performance monitoring.

```jsx
// pages/_app.js
import { createApp, reportWebVitals } from '@godaddy/gasket-next';

const App = createApp();

// Export the reportWebVitals function
export { reportWebVitals };
export default App;
```

### VisitorLink

Link component that automatically includes visitor parameters for secureserver.net domains.

```jsx
// components/navigation.js
import { VisitorLink } from '@godaddy/gasket-next';

export default function Navigation() {
  return (
    <nav>
      {/* Basic usage */}
      <VisitorLink href="/products">Products</VisitorLink>

      {/* With additional visitor keys */}
      <VisitorLink
        href="/pricing"
        visitorKeys={['currency', 'market']}
      >
        Pricing
      </VisitorLink>

      {/* With URL object */}
      <VisitorLink
        href={{
          pathname: '/search',
          query: { q: 'domains' }
        }}
        visitorKeys={['currency']}
      >
        Search Domains
      </VisitorLink>

      {/* With Next.js Link props */}
      <VisitorLink
        href="/dashboard"
        prefetch={false}
        scroll={false}
        replace
      >
        Dashboard
      </VisitorLink>
    </nav>
  );
}
```

## Document Functions

### makeDocument

Create a custom document with Gasket integration.

```jsx
// pages/_document.js
import { makeDocument } from '@godaddy/gasket-next/document';
import * as NextDocument from 'next/document';
import gasket from '../gasket.js';

// Basic usage
export default makeDocument(gasket, NextDocument);

// With custom Presentation class
import { Presentation } from '@godaddy/gasket-next/document';

class CustomPresentation extends Presentation {
  renderPreAppScriptContent() {
    return <script src="//custom.script.js" />;
  }

  static async getProps(gasket, req) {
    const baseProps = await Presentation.getProps(gasket, req);
    return {
      ...baseProps,
      customProp: 'custom-value'
    };
  }
}

export default makeDocument(gasket, NextDocument, CustomPresentation);
```

### withStaticReq

Wrapper for static page generation with required parameters.

```jsx
// pages/_document.js
import { makeDocument, withStaticReq } from '@godaddy/gasket-next/document';
import { withGasketData } from '@godaddy/gasket-next/document';
import * as NextDocument from 'next/document';
import gasket from '../gasket.js';

// With static request handling
export default withStaticReq()(
  withGasketData(gasket)(
    makeDocument(gasket, NextDocument)
  )
);
```

## Layout Functions

### makeLayout

Create a layout component for App Router applications.

```jsx
// app/layout.js
import { makeLayout } from '@godaddy/gasket-next/layout';
import gasket from '../gasket.js';

// Basic usage
export default makeLayout(gasket);

// With custom Presentation
import { Presentation } from '@godaddy/gasket-next/layout';

class CustomPresentation extends Presentation {
  renderPreAppScriptContent() {
    return <script src="//custom-layout.js" />;
  }
}

export default makeLayout(gasket, CustomPresentation);

// With revalidation for static pages
export default makeLayout(gasket);
export const revalidate = 600; // 10 minutes
```

### makeDynamicLayout

Create a dynamic layout component that handles request context.

```jsx
// app/[...params]/layout.js
import { makeDynamicLayout } from '@godaddy/gasket-next/layout';
import gasket from '../../gasket.js';

export default makeDynamicLayout(gasket);
```

### convertScript

Convert script elements to use Next.js Script component.

```jsx
// Custom layout component
import { convertScript } from '@godaddy/gasket-next/layout';
import { createElement } from 'react';

function CustomLayout({ scripts, children }) {
  // Convert raw script elements to Next.js Script components
  const convertedScripts = convertScript(scripts);

  return (
    <div>
      {children}
      {convertedScripts}
    </div>
  );
}
```

## Advanced Usage Examples

### Complete App Setup

```jsx
// pages/_app.js
import { createApp, withPageEnhancers, reportWebVitals } from '@godaddy/gasket-next';
import { withAuthProvider } from '@godaddy/gasket-auth';
import { withMessagesProvider } from '@gasket/react-intl';
import { IntlProvider } from 'react-intl';
import intlManager from '../intl.js';

// Create custom layout
function Layout({ Component, pageProps, locale = 'en-US' }) {
  return (
    <IntlProvider locale={locale}>
      <div className="app-wrapper">
        <header>App Header</header>
        <main>
          <Component {...pageProps} />
        </main>
        <footer>App Footer</footer>
      </div>
    </IntlProvider>
  );
}

// Create app with configuration
const App = createApp({
  Layout,
  strictMode: true,
  mainRole: false, // We have our own main element
  initialProps: true
});

// Apply page enhancers and providers
export default [
  withAuthProvider(),
  withMessagesProvider(intlManager)
].reduce((app, hoc) => hoc(app), App);

export { reportWebVitals };
```

### Custom Document with Presentation

```jsx
// pages/_document.js
import { makeDocument, Presentation } from '@godaddy/gasket-next/document';
import * as NextDocument from 'next/document';
import gasket from '../gasket.js';

class CustomPresentation extends Presentation {
  renderPreAppScriptContent() {
    return (
      <>
        <script src="//cdn.example.com/analytics.js" />
        <script dangerouslySetInnerHTML={{
          __html: `window.APP_CONFIG = ${JSON.stringify(this.props.appConfig)};`
        }} />
      </>
    );
  }

  renderPreCssContent() {
    return (
      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>
    );
  }

  static async getProps(gasket, req) {
    const baseProps = await Presentation.getProps(gasket, req);

    return {
      ...baseProps,
      appConfig: {
        apiUrl: process.env.API_URL,
        version: process.env.npm_package_version
      },
      htmlProps: {
        'data-theme': 'default'
      },
      bodyProps: {
        className: 'app-body'
      }
    };
  }
}

export default makeDocument(gasket, NextDocument, CustomPresentation);
```

### App Router Layout with Gasket

```jsx
// app/layout.js
import { makeLayout, Presentation } from '@godaddy/gasket-next/layout';
import gasket from '../gasket.js';

class CustomPresentation extends Presentation {
  renderPreAppContent() {
    return (
      <div id="loading-banner" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'blue',
        color: 'white',
        padding: '8px',
        textAlign: 'center'
      }}>
        Loading...
      </div>
    );
  }
}

export default makeLayout(gasket, CustomPresentation);

// Metadata
export const metadata = {
  title: 'My Gasket App',
  description: 'Built with Gasket Next.js'
};

// Revalidation for ISR
export const revalidate = 300; // 5 minutes
```

### Dynamic Routes with Visitor Parameters

```jsx
// pages/products/[...params].js
import { VisitorLink } from '@godaddy/gasket-next';

export default function ProductsPage({ products, params }) {
  return (
    <div>
      <h1>Products</h1>
      <nav>
        {products.map(product => (
          <VisitorLink
            key={product.id}
            href={`/products/${product.slug}`}
            visitorKeys={['currency', 'market']}
          >
            {product.name}
          </VisitorLink>
        ))}
      </nav>

      {/* Back to category */}
      <VisitorLink
        href="/products"
        visitorKeys={['currency']}
        replace
      >
        ← Back to All Products
      </VisitorLink>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  return {
    props: {
      products: [], // fetch products
      params
    }
  };
}
```
