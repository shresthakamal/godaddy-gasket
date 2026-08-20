# Express API Template

A TypeScript-based API template using Express.js and [Gasket](https://gasket.dev/).

## Overview

This template provides a production-ready Express.js API with TypeScript, comprehensive security features, observability, and GoDaddy-specific integrations. It includes automatic API documentation generation, development certificate management, and enterprise-grade logging.

### Key Features

- **Express.js** - Fast, unopinionated web framework
- **TypeScript** - Type-safe development with ES modules
- **Swagger/OpenAPI** - Automatic API documentation generation
- **HTTPS Development** - Self-signed and development certificates
- **Security** - Helmet security headers and CSP policies
- **Observability** - OpenTelemetry integration for tracing and metrics
- **GoDaddy Integration** - Visitor context and private label support
- **Enterprise Logging** - Winston with structured logging
- **Testing** - Vitest testing framework with coverage
- **Documentation** - Integrated Docusaurus documentation

## Getting Started

### Development

To start the API locally, run:

```bash
npm install
npm run local
```

The API will start with hot-reloading enabled using the [tsx] runtime.

### Building for Production

To compile the TypeScript code for production:

```bash
npm run build
npm start
```

Or run both commands together:

```bash
npm run preview
```

Compiled code will be placed in the `dist` directory.

### Testing

Run the test suite:

```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### API Documentation

This template automatically generates Swagger/OpenAPI documentation from JSDoc comments in your code.

#### Generating Documentation

```bash
npm run docs
```

Generated docs will be placed in the `.docs` directory and served via [Docusaurus] at `http://localhost:3000`.

#### Adding API Definitions

Use `@swagger` JSDoc comments to document your endpoints:

```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of users
 */
app.get('/api/users', (req, res) => {
  // endpoint logic
});
```

Visit the generated [swagger.json] endpoint to see the full API specification.

### Debugging

Enable debug logging:

```bash
DEBUG=* npm run local
```

Filter debug output by namespace:

```bash
DEBUG=gasket:* npm run local    # Gasket operations only
DEBUG=express:* npm run local   # Express operations only
```

### HTTPS Development

The template includes automatic HTTPS setup for local development:

- Self-signed certificates are generated automatically
- Development certificates can be configured via `@godaddy/gasket-plugin-dev-certs`
- Visitor context works seamlessly with GoDaddy domains

### TypeScript & ESM

This project uses ES modules with TypeScript. When importing `.ts` files, use the `.js` extension:

```typescript
import { myFunction } from './myModule.js';
```

TypeScript will resolve `myModule.ts` to `myModule.js` at runtime. For more details, see the [Gasket TypeScript] documentation.

### Observability

The template includes OpenTelemetry integration for:

- Distributed tracing
- Metrics collection
- Performance monitoring
- Error tracking

Telemetry is automatically configured and can be customized via the `@godaddy/gasket-plugin-otel` plugin.

### Security

Security features are enabled by default:

- **Helmet** - Security headers and CSP policies
- **HTTPS** - Automatic HTTPS redirect and HSTS
- **Input Validation** - Request validation and sanitization
- **Rate Limiting** - Configurable rate limiting

### GoDaddy Integration

The template includes GoDaddy-specific features:

- **Visitor Context** - Automatic detection of market, currency, and private label
- **Development Certificates** - Integration with GoDaddy development infrastructure
- **Security Policies** - GoDaddy-compliant security configurations

<!-- LINKS -->
[EcmaScript Modules]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
[Docusaurus]: https://docusaurus.io/
[tsx]: https://tsx.is/
[@gasket/plugin-typescript]: https://gasket.dev/docs/plugins/plugin-typescript/
[Gasket TypeScript]: https://gasket.dev/docs/typescript/
[swagger-jsdoc]: https://github.com/Surnet/swagger-jsdoc/
[swagger.json]: /swagger.json
