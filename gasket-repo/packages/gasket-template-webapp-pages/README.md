# @godaddy/gasket-template-webapp-pages

> Gasket template for Next.js Pages Router webapp with TypeScript

## Overview

This template creates a modern webapp using Next.js Pages Router with TypeScript, pre-configured with GoDaddy's standard tools and patterns.

## Stack

- **Next.js 14+** with Pages Router
- **TypeScript** (strict mode disabled for gradual adoption)
- **React 18+**
- **Gasket Framework** with webapp plugins
- **PostCSS** for styling with UX intents
- **Vitest** for testing
- **ESLint** with TypeScript and GoDaddy React config
- **OpenTelemetry** for observability

## Usage

```bash
npx create-gasket-app my-app --template @godaddy/gasket-template-webapp-pages
```

## What's Included

### Core Configuration
- `gasket.ts` - Main Gasket configuration with webapp plugins
- `gasket-data.ts` - Gasket data configuration for server-side rendering
- `next.config.js` - Next.js configuration integrated with Gasket
- `middleware.ts` - Next.js middleware for routing and visitor detection
- `server.ts` - Proxy server for HTTPS development
- `instrumentation.ts` - OpenTelemetry instrumentation setup

### TypeScript Configuration
- `tsconfig.json` - Main TypeScript configuration optimized for Next.js
- `tsconfig.server.json` - Server-specific TypeScript configuration
- `next-env.d.ts` - Next.js TypeScript declarations

### Pages Router Structure
- `pages/_app.tsx` - App component with Gasket integration
- `pages/_document.ts` - Document component with server-side rendering
- `pages/_error.tsx` - Error page component
- `pages/index.tsx` - Homepage component
- `pages/api/auth/validate.ts` - API route example
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

### Pages Router Benefits
- **File-based Routing**: Intuitive page structure
- **SSR/SSG**: Server-side rendering and static generation
- **API Routes**: Built-in API endpoint support
- **Custom Server**: Full control over server configuration

### GoDaddy Integration
- **Atlas**: Brand and market configuration
- **Visitor Detection**: Automatic private label detection
- **Authentication**: SSO integration ready
- **UXP Integration**: Header/footer from Presentation Central
- **Traffic Analytics**: Built-in analytics tracking

### Performance
- **Static Generation**: Pre-rendered pages for optimal performance
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
│   ├── index.tsx          # Homepage
│   └── api/               # API routes
├── components/            # Reusable components
├── locales/              # Internationalization
├── styles/               # Global styles
├── test/                 # Test files
├── gasket.ts            # Main Gasket config
├── server.ts            # Development server
├── middleware.ts        # Next.js middleware
├── tsconfig.json        # TypeScript config
└── package.json         # Dependencies
```

## Development Commands

```bash
# Install dependencies
npm ci

# Start development server
npm run local

# Start HTTPS development server
npm run local:https

# Build for production
npm run build

# Start production server
npm run start

# Start HTTPS production server
npm run start:https

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
- Gasket types
- UX component types

## Configuration

### Environment Variables
The template supports various environment configurations:
- Development (`local`)
- Testing (`test`)
- Production (`production`)

### Gasket Configuration
The main configuration includes:
- Plugin management
- Asset handling
- Internationalization
- Authentication setup
- Analytics integration

### Next.js Configuration
Optimized for:
- TypeScript compilation
- PostCSS processing with UX intents
- Image optimization
- Bundle analysis

## Pages Router vs App Router

This template uses the **Pages Router**, which provides:
- **Familiar Structure**: Traditional file-based routing
- **Mature Ecosystem**: Extensive community and plugin support
- **SSR/SSG**: Proven server-side rendering patterns
- **Custom Server**: Full control over server configuration
- **API Routes**: Built-in API endpoint support

## License

UNLICENSED - Internal GoDaddy use only
