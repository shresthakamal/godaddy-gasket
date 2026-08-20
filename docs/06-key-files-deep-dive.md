# Chapter 6: Key Files Deep Dive

## Chapter Overview

This chapter traces how the most important files connect — from configuration through SSR to the rendered page.

---

## The Request-to-Page Pipeline

```text
HTTPS Proxy (server.ts)
        │
        ▼
Next.js Middleware (middleware.ts)     ← edge: healthcheck only in starter
        │
        ▼
pages/_document.ts                     ← SSR HTML shell, GasketData, PC scripts
        │
        ▼
pages/_app.tsx                         ← React providers: auth, intl, layout
        │
        ▼
pages/index.tsx (or other route)       ← your UI
```

---

## `gasket.ts` — Configuration Hub

```ts
export default makeGasket({
  env: gdEnv(),
  plugins: [ /* 17 plugins */ ],
  httpsProxy: { port: 8443, target: { port: 3000 } },
  intl: { locales: ['en-US', 'fr-FR'], managerFilename: 'intl.ts' },
  uxp: { useMintl: true },
  presentationCentral: {
    params: { app: 'gasket-template-webapp-pages', manifest: 'internal-header', react: '19' }
  },
  data: gasketData
});
```

**Owns:** plugin list, integration config, environment overrides.

**Does not own:** page UI, business rules, API implementation details.

**Consumed by:** `server.ts`, `next.config.js`, `_document.ts`, `_app.tsx`, API routes — all import `@/gasket` (compiled `dist/gasket.js`).

---

## `gasket-data.ts` — SSR Data Contract

```ts
export default {
  examplePrivateSetting: 'privateValue',
  public: {
    examplePublicSetting: 'publicValue'
  }
};
```

Injected into the HTML document via `withGasketData(gasket)` in `_document.ts`.

```text
Server render
  │
  ├── private fields → available server-side only
  └── public fields  → serialized into page for client hydration
```

Use `public` for feature flags, API base URLs safe for browsers, and client-readable config. Keep secrets in server-only env vars, not `gasket-data.ts`.

---

## `next.config.js` — Gasket-Owned Next Config

```ts
import 'tsx';

const gasket = (await import('./gasket.ts')).default;
export default gasket.actions.getNextConfig({
  typescript: { ignoreBuildErrors: true }
});
```

Plugins contribute via the `nextConfig` lifecycle:

- `@gasket/plugin-webpack` — webpack customization
- `@godaddy/gasket-plugin-uxp` — UXCore2 externals, CSS imports
- `@gasket/plugin-intl` — locale bundling
- `@godaddy/gasket-plugin-auth` — auth-related Next config

You rarely edit this file directly. Change behavior in `gasket.ts` or add plugins.

---

## `server.ts` — Proxy Entry Point

```ts
import gasket from './gasket.js';
gasket.actions.startProxyServer();
```

Two lines by design. All proxy behavior (certs, port, forwarding) comes from `httpsProxy` config and `@gasket/plugin-https-proxy`.

Compiled to `dist/server.js` for production.

---

## `pages/_document.ts` — HTML Shell

```ts
import { makeDocument } from '@godaddy/gasket-next/document';
import { withGasketData } from '@gasket/nextjs/document';
import * as NextDocument from 'next/document';
import gasket from '@/gasket';

export default withGasketData(gasket)(makeDocument(gasket, NextDocument));
```

**What happens here:**

1. `makeDocument` — Gasket builds the HTML document structure (head, body, scripts)
2. Presentation Central header/footer scripts injected
3. Traffic analytics tags added
4. `withGasketData` — serializes public gasket-data into the page
5. Security headers and CSP hashes (via security plugin)

**Knowledge boundary:** Your pages should not manually duplicate `<script>` tags that plugins already inject here.

---

## `pages/_app.tsx` — React App Shell

```tsx
import { createApp, reportWebVitals } from '@godaddy/gasket-next';
import { withAuthProvider } from '@godaddy/gasket-auth';
import { IntlProvider } from '@godaddy/react-mintl';
import { withMessagesProvider } from '@gasket/react-intl';
import { withLocaleInitialProps } from '@gasket/nextjs';
import intlManager from '../intl';
import gasket from '@/gasket';

const IntlMessagesProvider = withMessagesProvider(intlManager)(IntlProvider);

function Layout({ Component, pageProps, locale }) {
  return (
    <IntlMessagesProvider locale={locale ?? 'en-US'}>
      <Component {...pageProps} />
    </IntlMessagesProvider>
  );
}

const App = createApp({ Layout, initialProps: true });

export default [
  withAuthProvider(),
  withLocaleInitialProps(gasket)
].reduce((cmp, hoc) => hoc(cmp), App);

export { reportWebVitals };
```

**Layer stack (outer to inner):**

```text
withLocaleInitialProps(gasket)   ← fetches locale/market from server
  └── withAuthProvider()         ← SSO context for React tree
        └── createApp Layout     ← intl messages + page component
```

Every page automatically gets auth context, locale, and translated messages.

---

## `pages/index.tsx` — A Typical Page

Uses three integration layers in one file:

```tsx
import { FormattedMessage } from '@godaddy/react-mintl';  // i18n
import Box from '@ux/box';                                   // UXCore2
import Head from '../components/head.tsx';                   // page metadata
```

Pattern for UXCore2: import component + its CSS:

```tsx
import Box from '@ux/box';
import '@ux/box/dist/styles.css';
```

Translation keys come from `locales/en-US.json`:

```json
{ "gasket_welcome": "Welcome to Gasket!" }
```

---

## `pages/api/auth/validate.ts` — API Route Pattern

```ts
import gasket from '@/gasket';

export default async function handler(req, res) {
  const checkAuth = gasket.actions.getCheckAuth(req);
  const auth = await checkAuth(req.query);
  res.json(auth);
}
```

Thin handler → delegates to Gasket action. The auth plugin owns SSO validation logic.

Use this pattern for experience-layer API routes (auth checks, BFF proxies). Not for core business APIs (those belong in service-layer apps).

---

## `intl.ts` — Generated Locale Manager

```ts
/* -- GENERATED FILE - DO NOT EDIT -- */
import { makeIntlManager } from '@gasket/intl';

const manifest = {
  defaultLocale: 'en-US',
  locales: ['en-US', 'fr-FR'],
  imports: {
    'locales/en-US': () => import('./locales/en-US.json'),
    'locales/fr-FR': () => import('./locales/fr-FR.json')
  }
};

export default makeIntlManager(manifest);
```

Regenerated when intl config changes. Edit `gasket.ts` intl block and `locales/*.json` instead.

---

## `instrumentation.ts` — OpenTelemetry

```ts
import { registerOTel } from '@vercel/otel';

export function register() {
  registerOTel({ serviceName: process.env.OTEL_SERVICE_NAME || 'gasket-app' });
}
```

Next.js calls `register()` at startup. Works with `@godaddy/gasket-plugin-otel` for GoDaddy-specific OTel configuration.

---

## How Files Import Gasket

```text
gasket.ts  ──tsc──►  dist/gasket.js
                           ▲
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
  _document.ts        _app.tsx          api/auth/validate.ts
  (via @/gasket)      (via @/gasket)    (via @/gasket)

server.ts imports ./gasket.js directly (same compiled output)
next.config.js imports ./gasket.ts via tsx at config load time
```

---

## Takeaways

1. **`_document.ts`** owns the HTML shell and server-injected scripts/data.
2. **`_app.tsx`** owns React-level providers (auth, intl, layout).
3. **`pages/*.tsx`** owns UI — use UXCore2 + FormattedMessage, not raw platform calls.
4. **API routes** should be thin wrappers around `gasket.actions`.
5. **`next.config.js` and `server.ts`** should stay minimal — configure via `gasket.ts`.

---

## Next chapter

Continue to [Chapter 7: GoDaddy Integrations](./07-godaddy-integrations.md).
