# Chapter 8: Extending Your App

## Chapter Overview

The starter repo is intentionally minimal. This chapter covers practical patterns for adding features while keeping clean architectural boundaries.

---

## The Existing World

Without clear extension patterns, teams tend to:

- Put everything in `pages/index.tsx`
- Call SSO/Traffic APIs directly from components
- Add Express routes to the web app for backend logic
- Edit generated files like `intl.ts`

These approaches work briefly, then become hard to test, upgrade, and scale.

---

## Extension Patterns Overview

```text
What you want to add          Where it belongs
────────────────────          ────────────────
New UI page                   pages/my-page.tsx
Shared UI component           components/
Experience-layer API route    pages/api/*
Platform integration          New plugin in gasket.ts plugins[]
App-specific hook/logic       plugins/my-plugin.ts (local)
Backend business API          Separate gasket-preset-api app
Translation string            locales/*.json + gasket.ts intl config
SSR config for client         gasket-data.ts public block
```

---

## Adding a New Page

Create a file in `pages/` — Next.js Pages Router handles routing automatically.

```tsx
// pages/dashboard.tsx
import React from 'react';
import Head from '../components/head.tsx';
import Box from '@ux/box';
import '@ux/box/dist/styles.css';

export default function DashboardPage() {
  return (
    <Box inlinePadding='xl'>
      <Head title='Dashboard' description='User dashboard' />
      <h1>Dashboard</h1>
    </Box>
  );
}
```

Available automatically: auth context, intl provider, locale props from `_app.tsx`.

---

## Adding Translations

1. Add keys to `locales/en-US.json`:

```json
{
  "dashboard_title": "My Dashboard"
}
```

2. Add translated strings to other locale files (e.g., `locales/fr-FR.json`).

3. Use in components:

```tsx
import { FormattedMessage } from '@godaddy/react-mintl';

<h1><FormattedMessage id='dashboard_title' /></h1>
```

4. If adding a new locale, update `gasket.ts`:

```ts
intl: {
  locales: ['en-US', 'fr-FR', 'de-DE'],
  defaultLocale: 'en-US'
}
```

The intl plugin regenerates `intl.ts` on build.

---

## Adding an Experience-Layer API Route

Use for auth checks, BFF proxies, or server-side operations tied to the UI — not core business logic.

```ts
// pages/api/my-proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import gasket from '@/gasket';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const logger = gasket.actions.getLogger();

  try {
    // Delegate to gasket actions or fetch from a service-layer API
    logger.info('Handling my-proxy request');
    res.status(200).json({ ok: true });
  } catch (err) {
    logger.error('my-proxy failed', { err });
    res.status(500).json({ error: 'Internal error' });
  }
}
```

**Do not** implement core business APIs here. Create a separate `@godaddy/gasket-preset-api` app for service-layer endpoints.

---

## Adding a Published Gasket Plugin

Example: adding Switchboard for feature flags.

```bash
npm install @godaddy/gasket-plugin-switchboard
```

```ts
// gasket.ts
import pluginSwitchboard from '@godaddy/gasket-plugin-switchboard';

export default makeGasket({
  plugins: [
    // ...existing plugins
    pluginSwitchboard
  ],
  switchboard: {
    // plugin-specific config
  }
});
```

Run `npm run docs` to discover new actions and lifecycles.

---

## Writing a Local Plugin

For app-specific behavior that should not live in `gasket.ts`:

```ts
// plugins/my-plugin.ts
export default {
  name: 'my-plugin',
  hooks: {
    ready(gasket) {
      gasket.logger.info({ msg: 'my-plugin ready' });
    },

    visitor(gasket, visitor, { req }) {
      // App-specific visitor overrides
      return visitor;
    },

    tccData(gasket, data, { req }) {
      // Customize Traffic data layer
      return data;
    }
  }
};
```

Register in `gasket.ts`:

```ts
import myPlugin from './plugins/my-plugin.js';

export default makeGasket({
  plugins: [
    // ...existing
    myPlugin
  ]
});
```

Add `plugins/` to `tsconfig.server.json` include if not already present.

**When to use local plugins vs. pages:**

| Use local plugin | Use page/component |
|------------------|-------------------|
| Modify visitor, traffic, or PC params | Render UI |
| Hook into build lifecycle | Handle user interactions |
| Cross-cutting request logic | Page-specific logic |

---

## Securing Pages with Auth

Use `@godaddy/gasket-auth` React components and HOCs rather than manual cookie checks.

See `gasket-repo/packages/gasket-plugin-auth/docs/authentication.md` for:

- Protecting pages by realm
- Redirect flows
- Authenticated fetch patterns (`auth-fetch` guide)

---

## Exposing Config to the Client

Use `gasket-data.ts`:

```ts
export default {
  apiBaseUrl: 'https://internal-only.example.com',  // server-only
  public: {
    featureFlags: {
      newDashboard: true
    }
  }
};
```

Read public data in pages via GasketData (injected by `_document.ts`) or pass through `getInitialProps` / server props patterns from `@gasket/nextjs`.

Never put secrets in the `public` block.

---

## Going to Production

### 1. Register your app

Create an appcode in GoDaddy Cloud UI:

https://cloud.int.godaddy.com/grouping/appregs/new

### 2. Update integration identifiers

Replace template defaults:

```ts
presentationCentral: {
  params: {
    app: 'your-app-name',  // not gasket-template-webapp-pages
    manifest: 'internal-header',
    react: '19'
  }
}
```

### 3. Deploy via Katana

Katana sets `GD_ENV`, injects secrets, routes traffic, and sends logs to CloudWatch.

- `/healthcheck` middleware supports deploy health probes
- `npm run build` → `npm run start` in container

See `gasket-repo/packages/gasket-plugin-nextjs/docs/deployment.md`.

### 4. Monitor

- CloudWatch logs (via Katana)
- OpenTelemetry traces (via `@godaddy/gasket-otel`)

---

## Common Mistakes

### Putting backend logic in the web app

```text
Bad:  pages/api/orders.ts implements full order processing
Good: pages/api/orders.ts proxies to orders-service API
```

### Editing generated files

```text
Bad:  manually edit intl.ts
Good: edit gasket.ts intl config + locales/*.json
```

### Bypassing Gasket actions

```text
Bad:  import SSO library directly in a page
Good: gasket.actions.getCheckAuth(req) or withAuthProvider()
```

### Upward architectural dependencies

```text
Bad:  service API calls web app's Express/proxy endpoint
Good: web app calls service API (dependency flows down)
```

---

## Upgrade Path

When Gasket packages release new versions:

```bash
npx @gasket/upgrade <target-version>
```

See `gasket-repo/docs/upgrades.md` and version-specific guides (`upgrade-to-7.md`, etc.).

---

## Checklist: Adding a Feature

```text
□ Is this UI?           → pages/ or components/
□ Is this a translation? → locales/ + FormattedMessage
□ Is this platform wiring? → plugin in gasket.ts
□ Is this app-specific cross-cutting logic? → local plugin
□ Is this a backend API?  → separate gasket-preset-api app
□ Does the client need config? → gasket-data.ts public block
□ Did I run npm run build:tsc after gasket.ts changes?
□ Did I run npm run docs to verify new plugin surface?
```

---

## Takeaways

1. **Pages and components** for UI; **plugins** for platform wiring; **local plugins** for app-specific hooks.
2. **Keep service APIs in separate apps** — this web app is the experience layer.
3. **Use gasket.actions and auth/intl React providers** — don't reimplement platform clients.
4. **Update template identifiers** (Presentation Central app name, etc.) before production.
5. **Run `npm run docs`** after adding plugins to discover available actions and lifecycles.

---

## Next chapter

Continue to [Chapter 9: Web + API Full Stack](./09-web-and-api-full-stack.md) for creating a separate API app and configuring both services as a complete stack.

---

## References

[1] Architecture Layers — `gasket-repo/docs/architecture-layers.md`  
[2] Start to Finish — `gasket-repo/docs/start-to-finish.md`  
[3] Auth Guide — `gasket-repo/packages/gasket-plugin-auth/docs/authentication.md`  
[4] Deployment — `gasket-repo/packages/gasket-plugin-nextjs/docs/deployment.md`  
[5] Upgrade Guide — `gasket-repo/docs/upgrades.md`  
[6] Gasket public docs — https://gasket.dev/
