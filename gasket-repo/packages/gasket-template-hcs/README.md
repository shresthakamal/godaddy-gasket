# Header Content Service (HCS) Template

A JavaScript-based template for building Header Content Services using Express.js and [Gasket](https://gasket.dev/).

## Overview

This template provides a production-ready Header Content Service for serving React-based UI components (headers, footers, etc.) to web applications across GoDaddy's ecosystem. It includes webpack bundling, internationalization support, and comprehensive testing infrastructure.

### What is a Header Content Service?

A Header Content Service (HCS) is a specialized microservice that renders and serves UI components like headers and footers to web applications. It enables:

- **Centralized UI Management** - Maintain shared components across multiple applications
- **Independent Deployments** - Update UI components without redeploying consuming applications
- **Multi-brand Support** - Serve different UI variations based on private label context
- **Internationalization** - Support multiple languages and locales
- **Performance Optimization** - Server-side rendering with client-side hydration

### Key Features

- **React Components** - Build UI components with React and JSX
- **Express.js Server** - Fast, reliable web framework
- **Webpack Bundling** - Modern JavaScript bundling with HMR
- **Internationalization** - Multi-language support with react-intl
- **GoDaddy Integration** - Visitor context and private label detection
- **Security** - Helmet security headers and CSP policies
- **API Documentation** - Swagger/OpenAPI specification generation
- **Testing** - Vitest testing framework with coverage
- **Documentation** - Integrated Docusaurus documentation

## Getting Started

### Development

To start the HCS locally, run:

```bash
npm install
npm run local
```

The service will start with hot-reloading enabled using nodemon.

### Building Assets

To build the client-side assets:

```bash
npm run build
```

This compiles React components and creates optimized bundles via webpack.

### Production

To run in production mode:

```bash
npm run build
npm start
```

### Testing

Run the test suite:

```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### API Documentation

Generate API documentation:

```bash
npm run docs
```

Generated docs will be placed in the `.docs` directory and served via [Docusaurus] at `http://localhost:3000`.

### Debugging

Enable debug logging:

```bash
DEBUG=* npm run local
```

Filter debug output by namespace:

```bash
DEBUG=gasket:* npm run local    # Gasket operations only
DEBUG=express:* npm run local   # Express operations only
DEBUG=gasket:hcs* npm run local # HCS-specific operations
```

## HCS-Specific Features

### Component Development

Create React components in the `components/` directory:

```javascript
// components/MyHeader.js
import React from 'react';
import { withManifest } from '@godaddy/gasket-hcs';

function MyHeader({ market, visitor }) {
  return (
    <header>
      <h1>Welcome to {market}</h1>
      <p>Visitor ID: {visitor.plid}</p>
    </header>
  );
}

export default withManifest(MyHeader);
```

### Internationalization

Add translations in the `locales/` directory:

```json
// locales/en-US.json
{
  "welcome": "Welcome",
  "navigation": {
    "home": "Home",
    "about": "About"
  }
}
```

Use translations in components:

```javascript
import { FormattedMessage } from 'react-intl';

function MyComponent() {
  return (
    <FormattedMessage id="welcome" />
  );
}
```

### Environment Configuration

The HCS is configured for different environments in `gasket.js`:

- **Local** - Development environment with dev PCS URL
- **Development** - Dev environment with dev PCS URL
- **Test** - Test environment with test PCS URL
- **Production** - Production environment with production PCS URL

### Webpack Configuration

Assets are built using webpack with:

- **React** - JSX compilation and React optimizations
- **Babel** - Modern JavaScript transpilation
- **Hot Module Replacement** - Fast development feedback
- **Code Splitting** - Optimized bundle loading
- **Asset Optimization** - Minification and compression

### Publishing to Warehouse

HCS assets can be published to Warehouse for distribution:

```bash
npx wrhs-publish development  # Publish to dev environment
npx wrhs-publish production   # Publish to production
```

### API Endpoints

Use `@swagger` JSDoc comments to document your endpoints:

```javascript
/**
 * @swagger
 * /api/header:
 *   get:
 *     summary: Get header component
 *     parameters:
 *       - name: plid
 *         in: query
 *         description: Private label ID
 *     responses:
 *       200:
 *         description: Header HTML content
 */
app.get('/api/header', (req, res) => {
  // header rendering logic
});
```

Visit the generated [swagger.json] endpoint to see the full API specification.

### GoDaddy Integration

The template includes GoDaddy-specific features:

- **Visitor Context** - Automatic detection of market, currency, and private label
- **Private Label Support** - Render different UI variations based on context
- **Security Policies** - GoDaddy-compliant security configurations
- **Multi-environment Support** - Seamless deployment across GoDaddy environments

<!-- LINKS -->
[EcmaScript Modules]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
[Docusaurus]: https://docusaurus.io/
[swagger-jsdoc]: https://github.com/Surnet/swagger-jsdoc/
[swagger.json]: /swagger.json
