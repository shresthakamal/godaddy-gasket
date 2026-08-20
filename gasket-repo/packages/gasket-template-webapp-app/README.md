# @godaddy/gasket-template-webapp-app

> Gasket template for Next.js App Router webapp with TypeScript

## Overview

This template creates a modern webapp using Next.js App Router with TypeScript, pre-configured with GoDaddy's standard tools and patterns.

## Stack

- **Next.js 14+** with App Router
- **TypeScript** (strict mode enabled)
- **React 18+**
- **Gasket Framework** with webapp plugins
- **PostCSS** for styling with UX intents
- **Vitest** for testing
- **ESLint** with TypeScript and GoDaddy React config
- **Stylelint** for CSS linting
- **OpenTelemetry** for observability

## Usage

```bash
npx create-gasket-app my-app --template @godaddy/gasket-template-webapp-app
```

## What's Included

### Core Configuration
- `gasket.ts` - Main Gasket configuration with webapp plugins
- `gasket.edge.ts` - Edge runtime configuration for middleware
- `gasket-data.ts` - Gasket data configuration for server-side rendering
- `next.config.js` - Next.js configuration integrated with Gasket
- `middleware.ts` - Next.js middleware for routing and visitor detection
- `server.ts` - Proxy server for HTTPS development
- `instrumentation.ts` - OpenTelemetry instrumentation setup

### TypeScript Configuration
- `tsconfig.json` - Main TypeScript configuration optimized for Next.js
- `tsconfig.server.json` - Server-specific TypeScript configuration
- `next-env.d.ts` - Next.js TypeScript declarations

### App Router Structure
- `app/layout.tsx` - Root layout with Gasket integration
- `app/page.tsx` - Homepage component
- `app/error.tsx` - Global error boundary
- `app/[plid]/[market]/[currency]/` - Dynamic routing for private labels
- `app/api/auth/validate/route.ts` - API route example

### Development Tools
- **TypeScript**: Full type safety with strict mode
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
- Strict type checking enabled
- Type-safe API routes and server functions
- Runtime type validation where needed

### App Router Benefits
- **Server Components**: Reduced JavaScript bundle size
- **Streaming**: Progressive page loading
- **Layouts**: Shared UI across routes
- **Dynamic Routes**: Flexible routing patterns

### GoDaddy Integration
- **Atlas**: Brand and market configuration
- **Visitor Detection**: Automatic private label detection
- **Authentication**: SSO integration ready
- **UXP Integration**: Header/footer from Presentation Central
- **Traffic Analytics**: Built-in analytics tracking

### Performance
- **Server Components**: Zero JavaScript by default
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
├── app/                    # Next.js App Router
│   ├── [plid]/            # Dynamic private label routing
│   │   └── [market]/
│   │       └── [currency]/
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Homepage
│   └── error.tsx         # Error boundary
├── locales/              # Internationalization
├── styles/               # Global styles
├── test/                 # Test files
├── gasket.ts            # Main Gasket config
├── gasket.edge.ts       # Edge runtime config
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

### Strict Type Checking
All TypeScript strict mode features are enabled for maximum type safety:
- `noImplicitAny`
- `strictNullChecks`
- `strictFunctionTypes`
- `strictPropertyInitialization`

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

## License

UNLICENSED - Internal GoDaddy use only
