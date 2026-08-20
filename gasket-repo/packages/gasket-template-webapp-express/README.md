# @godaddy/gasket-template-webapp-express

> Gasket template for Next.js Pages Router webapp with Express server and TypeScript

## Overview

This template creates a modern webapp using Next.js Pages Router with Express server integration and TypeScript, pre-configured with GoDaddy's standard tools and patterns.

## Stack

- **Next.js 14+** with Pages Router
- **Express.js** server integration
- **TypeScript** (strict mode disabled for gradual adoption)
- **React 18+**
- **Gasket Framework** with webapp plugins
- **PostCSS** for styling with UX intents
- **Vitest** for testing
- **ESLint** with TypeScript and GoDaddy React config
- **OpenTelemetry** for observability

## Usage

```bash
npx create-gasket-app my-app --template @godaddy/gasket-template-webapp-express
```

## What's Included

### Core Configuration
- `gasket.ts` - Main Gasket configuration with webapp plugins
- `gasket-data.ts` - Gasket data configuration for server-side rendering
- `next.config.js` - Next.js configuration integrated with Gasket
- `server.ts` - Express server with Next.js integration
- `instrumentation.ts` - OpenTelemetry instrumentation setup

### TypeScript Configuration
- `tsconfig.json` - Main TypeScript configuration optimized for Next.js
- `tsconfig.server.json` - Server-specific TypeScript configuration
- `next-env.d.ts` - Next.js TypeScript declarations

### Express Server
- **Custom Express Server**: Full control over server middleware and routing
- **Next.js Integration**: Seamless integration with Next.js pages
- **HTTPS Support**: Built-in HTTPS development server
- **Middleware Support**: Express middleware ecosystem compatibility
- **TypeScript Support**: Fully typed Express server

### Pages Router Structure
- `pages/_app.tsx` - App component with Gasket integration
- `pages/_document.ts` - Document component with server-side rendering
- `pages/_error.tsx` - Error page component
- `pages/index.tsx` - Homepage component
- `components/head.tsx` - Reusable head component

### Development Tools
- **TypeScript**: Type safety with gradual adoption
- **TSX**: Fast TypeScript execution for development
- **Concurrently**: Run multiple dev processes simultaneously
- **Vitest**: Fast testing with TypeScript support
- **ESLint**: Code linting with TypeScript parser
- **Stylelint**: CSS linting

### Styling
- **PostCSS**: CSS transformations and optimizations with UX intents support
- **`@ux/postcss-intents`**: Resolve UXCore2 design tokens via `intent()` in CSS
- **UXCore2**: GoDaddy's design system components
- **Responsive**: Mobile-first responsive design

### Testing
- **Vitest**: Modern test runner with TypeScript support
- **React Testing Library**: Component testing utilities
- **JSDOM**: Browser environment simulation
- **Coverage**: Built-in coverage reporting

### Build System
- **TypeScript Compilation**: Separate server and client builds
- **Next.js Build**: Optimized production builds
- **Asset Optimization**: Automatic image and font optimization
- **Bundle Analysis**: Built-in bundle analyzer

## Key Features

### Type Safety
- Full TypeScript coverage across the application
- Gradual type adoption with strict mode disabled
- Type-safe API routes and server functions
- Runtime type validation where needed

### Express Server Benefits
- **Custom Middleware**: Add Express middleware for authentication, logging, etc.
- **API Customization**: Full control over API route handling
- **Server-Side Logic**: Custom server-side processing with TypeScript
- **Performance Optimization**: Fine-tune server performance

### Pages Router Benefits
- **File-based Routing**: Intuitive page structure
- **SSR/SSG**: Server-side rendering and static generation
- **API Routes**: Built-in API endpoint support
- **Custom Document/App**: Full control over HTML structure

### GoDaddy Integration
- **Atlas**: Brand and market configuration
- **Visitor Detection**: Automatic private label detection
- **Authentication**: SSO integration ready
- **UXP Integration**: Header/footer from Presentation Central
- **Traffic Analytics**: Built-in analytics tracking

### Performance
- **Express Optimization**: Optimized Express server configuration
- **Image Optimization**: Automatic image optimization
- **Font Optimization**: Optimized web font loading
- **Bundle Splitting**: Automatic code splitting

### Development Experience
- **Hot Reload**: Instant development feedback
- **TypeScript**: Full IDE support with autocomplete
- **Linting**: Consistent code style enforcement
- **Testing**: Integrated test runner with watch mode

## Project Structure

```
├── pages/                  # Next.js Pages Router
│   ├── _app.tsx           # App component
│   ├── _document.ts       # Document component
│   ├── _error.tsx         # Error page
│   └── index.tsx          # Homepage
├── components/            # Reusable components
├── locales/              # Internationalization
├── styles/               # Global styles
├── test/                 # Test files
├── dist/                 # Compiled TypeScript output
├── gasket.ts            # Main Gasket config
├── server.ts            # Express server
├── tsconfig.json        # TypeScript config
├── tsconfig.server.json # Server TypeScript config
└── package.json         # Dependencies
```

## Development Commands

```bash
# Install dependencies
npm ci

# Start development server
npm run local

# Build for production
npm run build

# Start production server
npm run start

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Lint styles
npm run stylelint
```

## TypeScript Features

### Gradual Adoption
TypeScript strict mode is disabled to allow for gradual adoption:
- Existing JavaScript can be easily migrated
- Type annotations can be added incrementally
- Full type safety can be enabled later

### Build Process
The template includes a sophisticated TypeScript build process:
- Server code compilation with `tsc`
- Client code handled by Next.js
- Watch mode for development
- Separate configurations for client and server

### Type Definitions
Comprehensive type definitions included:
- Next.js types
- React types
- Express types
- Gasket types
- UX component types

## Key Dependencies

### Core Framework
- `@godaddy/gasket-next` - Gasket Next.js integration
- `@gasket/core` - Gasket framework core
- `@gasket/plugin-express` - Express.js integration
- `@gasket/plugin-https` - HTTPS support
- `express` - Express.js framework
- `next` - Next.js framework
- `react` & `react-dom` - React library
- `tsx` - TypeScript execution
- `typescript` - TypeScript compiler

### GoDaddy Plugins
- `@godaddy/gasket-plugin-atlas` - Brand and market data
- `@godaddy/gasket-plugin-auth` - Authentication
- `@godaddy/gasket-plugin-visitor` - Visitor detection
- `@godaddy/gasket-plugin-uxp` - UX Platform integration
- `@godaddy/gasket-plugin-traffic` - Analytics tracking
- `@godaddy/gasket-plugin-security` - Security headers

### UI Components
- `@ux/*` - GoDaddy UX component library
- `@godaddy/react-mintl` - Internationalization components

## Getting Started

After creating your app with this template:

1. **Install dependencies**:
   ```bash
   npm ci
   ```

2. **Start development server**:
   ```bash
   npm run local
   ```
   This starts TypeScript compilation in watch mode and the Express server.

3. **Run tests**:
   ```bash
   npm test
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Start production server**:
   ```bash
   npm start
   ```

## Available Scripts

- `npm run local` - Start development with TypeScript watch mode and server
- `npm run build` - Build TypeScript and Next.js for production
- `npm run build:tsc` - Compile TypeScript server code
- `npm run build:tsc:watch` - Compile TypeScript in watch mode
- `npm run start` - Start production Express server
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint with TypeScript support
- `npm run lint:fix` - Fix ESLint issues
- `npm run stylelint` - Run Stylelint
- `npm run stylelint:fix` - Fix Stylelint issues
- `npm run analyze` - Analyze bundle size

## Architecture

This template uses Express.js server with Next.js Pages Router integration and full TypeScript support:

### Express Server Setup
The `server.ts` file:
- Configures Express middleware with TypeScript types
- Integrates with Gasket plugins
- Handles Next.js page requests
- Provides HTTPS support

### TypeScript Integration
- Server code compiled to `dist/` directory
- Separate TypeScript configurations for client and server
- Type-safe Express middleware and routes
- Runtime type validation where needed

### Data Fetching
- Type-safe `getServerSideProps` and `getStaticProps`
- Client-side data fetching with `@gasket/data`
- Express middleware for data preprocessing

### Authentication
- Type-safe Express middleware integration
- Integrated with `@godaddy/gasket-plugin-auth`
- SSO and session management

## Configuration

### Environment Variables
The template supports standard Next.js environment variables plus Gasket-specific ones:

- `GASKET_ENV` - Gasket environment (local, dev, test, prod)
- `GASKET_DEV` - Development mode flag
- `NODE_ENV` - Node environment
- `NEXT_PUBLIC_*` - Client-side environment variables

### Gasket Configuration
The main configuration includes:
- Express plugin configuration
- HTTPS plugin setup
- Environment-specific settings
- Build and deployment options

### TypeScript Configuration
Optimized for:
- Next.js Pages Router
- Express server development
- Strict type checking (gradually enabled)
- IDE support and autocomplete

### Express Customization
The Express server can be customized by:
- Adding typed middleware
- Implementing custom API routes with types
- Configuring security headers
- Setting up custom error handling

## Learn More

- [Gasket Documentation](https://gasket.dev)
- [Next.js Custom Server](https://nextjs.org/docs/pages/building-your-application/configuring/custom-server)
- [Express.js with TypeScript](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [GoDaddy UX Platform](https://github.com/gdcorp-uxp)

## License

UNLICENSED - Internal GoDaddy use only
