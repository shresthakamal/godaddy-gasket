# Chapter 3: Repo Structure

## Chapter Overview

Every file in a Gasket starter has a role. This chapter maps the full directory tree of `aiusage-next` and explains what each part owns.

---

## Top-Level Layout

```text
aiusage-next/
├── gasket.ts              # Central config — plugins, env, integrations
├── gasket-data.ts         # SSR-safe data injected into pages
├── server.ts              # Starts HTTPS proxy
├── next.config.js         # Next.js config (generated via Gasket actions)
├── middleware.ts          # Next.js edge middleware
├── instrumentation.ts     # OpenTelemetry registration
├── intl.ts                # Generated intl manager (do not edit)
├── manifest.xml           # GoLF translation manifest
│
├── pages/                 # Next.js Pages Router
├── components/            # Shared React components
├── locales/               # Translation JSON files
├── styles/                # Global CSS
├── test/                  # Vitest tests
│
├── tsconfig.json          # Client / Next TypeScript config
├── tsconfig.server.json   # Server-side TypeScript (gasket, server)
├── dist/                  # Compiled server output (gasket.js, server.js)
├── package.json           # Scripts, dependencies, PostCSS, lint config
└── gasket-repo/           # Reference copy of upstream Gasket monorepo (not runtime)
```

---

## Configuration Layer

### `gasket.ts`

The **single source of truth** for your Gasket app. Registers plugins, sets environment-specific config, and defines integration parameters (intl, uxp, httpsProxy, etc.).

### `gasket-data.ts`

Data contract for server-side rendering:

```ts
export default {
  examplePrivateSetting: 'privateValue',  // server-only
  public: {
    examplePublicSetting: 'publicValue'   // exposed to browser via SSR
  }
};
```

Only `public` values reach the client through `withGasketData`.

### `.env`

Local environment variables. Never commit secrets. Katana injects production env via `GD_ENV`.

---

## Runtime Layer

### `server.ts`

Minimal entry point for the HTTPS proxy:

```ts
import gasket from './gasket.js';
gasket.actions.startProxyServer();
```

Compiled to `dist/server.js` for production (`npm run start:https`).

### `next.config.js`

Delegates to Gasket:

```ts
const gasket = (await import('./gasket.ts')).default;
export default gasket.actions.getNextConfig({ ... });
```

Plugins contribute webpack, postcss, and other Next settings via lifecycle hooks.

### `middleware.ts`

Next.js edge middleware. In this starter, it serves `/healthcheck` for deployment probes:

```ts
export const config = { matcher: ['/healthcheck'] };
```

### `instrumentation.ts`

Registers OpenTelemetry via `@vercel/otel` for Next.js observability.

---

## UI Layer

### `pages/`

| File | Role |
|------|------|
| `_app.tsx` | App shell — auth, intl, gasket-next wrappers |
| `_document.ts` | HTML document — headers, GasketData, Presentation Central scripts |
| `_error.tsx` | Error page |
| `index.tsx` | Homepage |
| `api/auth/validate.ts` | Example API route using `gasket.actions.getCheckAuth` |

### `components/`

Reusable React components. `head.tsx` wraps `next/head` for page metadata.

### `styles/global.css`

Global styles imported in `_app.tsx`.

---

## Internationalization

| File | Role |
|------|------|
| `intl.ts` | Generated locale manifest — imports locale JSON dynamically |
| `locales/en-US.json` | English strings |
| `locales/fr-FR.json` | French strings |
| `manifest.xml` | GoLF configuration for professional translation workflows |

Locale list is configured in `gasket.ts`:

```ts
intl: {
  locales: ['en-US', 'fr-FR'],
  defaultLocale: 'en-US',
  managerFilename: 'intl.ts',
  nextRouting: false
}
```

---

## TypeScript Dual Build

| Config | Compiles | Output |
|--------|----------|--------|
| `tsconfig.json` | Pages, components, app code | Next.js handles (no emit) |
| `tsconfig.server.json` | `gasket.ts`, `server.ts`, `gasket-data.ts` | `dist/` |

The `@/gasket` path alias in `tsconfig.json` points to `./dist/gasket.js` so Next.js imports the compiled Gasket instance.

**ESM note:** With `"type": "module"`, import TypeScript files using `.js` extensions:

```ts
import gasket from './gasket.js';  // resolves to gasket.ts
```

---

## Tooling and Quality

| File | Role |
|------|------|
| `package.json` | Scripts, dependencies, PostCSS, ESLint, Stylelint, browserslist |
| `vitest.config.js` | Test runner configuration |
| `test/index.test.tsx` | Example component test |

---

## Generated / Build Artifacts

| Path | Role |
|------|------|
| `dist/` | Compiled server-side Gasket code |
| `.next/` | Next.js build output |
| `.docs/` | Generated docs from `npm run docs` |
| `next-env.d.ts` | Next.js TypeScript declarations |

Add these to `.gitignore` (already configured).

---

## What Is NOT Part of Your App

| Path | Note |
|------|------|
| `gasket-repo/` | Upstream Gasket monorepo for reference — not imported at runtime |
| `node_modules/` | Installed dependencies |

---

## Knowledge Boundaries

```text
pages/index.tsx       → UI only
pages/api/*           → thin handlers; delegate to gasket.actions
gasket.ts             → config + plugin registration
gasket-data.ts        → SSR data contract
server.ts             → proxy startup only
plugins (npm packages) → platform integration logic
```

---

## Takeaways

1. **`gasket.ts` is the center of gravity** — start here when exploring the repo.
2. **`pages/_app.tsx` and `pages/_document.ts`** are the main Gasket ↔ Next.js integration points.
3. **Server code compiles to `dist/`** separately from Next.js client/server bundles.
4. **`intl.ts` is generated** — configure locales in `gasket.ts` instead.

---

## Next chapter

Continue to [Chapter 4: Core Concepts](./04-core-concepts.md) to learn how plugins, lifecycles, and actions work.
