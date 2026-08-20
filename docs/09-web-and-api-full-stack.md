# Chapter 9: Web App + API App — A Complete Gasket Stack

## Chapter Overview

A production GoDaddy product often needs **two Gasket apps**:

1. **Web app** (`aiusage-next`) — UI, SSR, thin BFF routes
2. **API app** (`aiusage-api`) — business logic, REST endpoints, shared services

This chapter walks through creating the API app, running both locally, configuring them to work together, and deploying as a complete stack.

---

## The Existing World

A single Next.js repo can host UI and `pages/api/*` routes. That works for small features, but breaks down when:

- Other services need the same API
- Backend and frontend must scale/deploy independently
- Business logic outgrows “API routes beside pages”

GoDaddy’s architecture separates **Customer Experience** (web) from **Service Layer** (API).

---

## The Complete Stack

```text
┌─────────────────────────────────────────────────────────────┐
│  aiusage-next (Web App)          Experience Layer           │
│  ─────────────────────────────────────────────────────────  │
│  pages/index.tsx              UI                            │
│  pages/api/*                  thin BFF (optional)           │
│  server.ts                    HTTPS proxy → Next.js :3000   │
│  https://local.gasket.dev-godaddy.com:8443                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │  HTTP(S) — server-side or BFF proxy
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  aiusage-api (API App)           Service Layer              │
│  ─────────────────────────────────────────────────────────  │
│  plugins/routes-plugin.ts     Express REST routes          │
│  server.ts                    gasket.actions.startServer()│
│  /default, /usage, ...        Swagger/OpenAPI docs          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                    Databases, external services, GoCaaS, etc.
```

**Dependency rule:** web app calls API. API never calls web app.

---

## Step 1: Create the API App

From a sibling directory to `aiusage-next`:

```bash
cd ..
npx create-gasket-app aiusage-api --template @godaddy/gasket-template-api-express
```

Or with the preset (CLI prompts for Express vs Fastify):

```bash
npx create-gasket-app aiusage-api --presets @godaddy/gasket-preset-api
```

Requirements:

- VPN connected
- GoDaddy Artifactory npm registry configured

```bash
cd aiusage-api
npm install
npm run local
```

The API starts with hot reload via `tsx watch server.ts`. Check terminal output for the HTTPS URL and port (configured by `@gasket/plugin-https`).

---

## Step 2: Compare the Two Apps

| | **Web app** (`aiusage-next`) | **API app** (`aiusage-api`) |
|---|---|---|
| **Preset** | `@godaddy/gasket-preset-webapp` | `@godaddy/gasket-preset-api` |
| **Template** | `gasket-template-webapp-pages` | `gasket-template-api-express` |
| **Framework** | Next.js Pages Router | Express.js |
| **Server entry** | `gasket.actions.startProxyServer()` | `gasket.actions.startServer()` |
| **Routes** | `pages/*.tsx`, `pages/api/*` | `plugins/routes-plugin.ts` (Express hooks) |
| **UI** | React pages + UXCore2 | None |
| **Key plugins** | `plugin-nextjs`, `plugin-uxp`, `plugin-auth` | `plugin-express`, `plugin-swagger` |
| **Docs** | Docusaurus (app plugins) | Swagger/OpenAPI + Docusaurus |
| **Dev command** | `npm run local` (3 processes) | `npm run local` (1 process) |

### Web app `server.ts`

```ts
import gasket from './gasket.js';
gasket.actions.startProxyServer();  // proxy → Next.js
```

### API app `server.ts`

```ts
import gasket from './gasket.js';
gasket.actions.startServer();  // Express HTTPS server
```

---

## Step 3: Add Your First API Endpoint

This stack implements a **`GET /usage`** endpoint in `aiusage-api` that returns AI usage summary data. The web app consumes it at `/usage` via server-side rendering.

### API route — `plugins/routes-plugin.ts`

Edit `plugins/routes-plugin.ts` in the API app:

```ts
export const usageHandler = async (req, res) => {
  res.status(200).json({
    totalTokens: 128_450,
    period: '2026-08'
  });
};

export default {
  name: 'routes-plugin',
  hooks: {
    express(gasket, app) {
      /**
      * @swagger
      *
      * /usage:
      *   get:
      *     summary: "Get AI usage summary"
      *     produces:
      *       - "application/json"
      *     responses:
      *       "200":
      *         description: "Returns usage summary."
      *         content:
      *           application/json
      */
      app.get('/usage', usageHandler);
    }
  }
};
```

Exporting `usageHandler` separately makes it easy to unit test (see `aiusage-api/test/index.test.ts`).

Register the plugin in `gasket.ts` (already included in the template):

```ts
import pluginRoutes from './plugins/routes-plugin.js';

plugins: [
  // ...
  pluginRoutes
]
```

The API listens on port **8444** locally (configured in `gasket.ts` so it does not clash with the web app proxy on 8443).

Test locally:

```bash
curl -k https://local.gasket.dev-godaddy.com:8444/usage
# → {"totalTokens":128450,"period":"2026-08"}
```

Run `npm run docs` to regenerate Swagger documentation.

---

## Step 4: Run Both Apps Locally

Open two terminals:

**Terminal 1 — Web app**

```bash
cd aiusage-next
npm run local
# → https://local.gasket.dev-godaddy.com:8443
```

**Terminal 2 — API app**

```bash
cd aiusage-api
npm run local
# → note HTTPS URL from startup logs
```

```text
Terminal 1:  Browser → :8443 (proxy) → :3000 (Next.js)
Terminal 2:  curl/browser → API HTTPS server (Express)
```

Both apps use `@godaddy/gasket-plugin-dev-certs` for local HTTPS. Keep VPN connected.

---

## Step 5: Configure Both Apps

Each app has its own `gasket.ts`, `.env`, and Katana appcode. They share **patterns**, not a single config file.

### 5a. Environment-specific config

Both apps use `gdEnv()`:

```ts
import { gdEnv } from '@godaddy/gasket-utils';

export default makeGasket({
  env: gdEnv(),
  environments: {
    local: {
      // local-only overrides
    },
    test: {
      // test env overrides
    },
    production: {
      // production overrides
    }
  }
});
```

Katana sets `GD_ENV` per deployment. Override locally with `GASKET_ENV=local`.

### 5b. Expose API URL to the web app

**Web app `gasket-data.ts`:**

```ts
export default {
  apiServiceUrl: process.env.API_SERVICE_URL,  // server-only
  public: {
    // Do NOT put internal API URLs here if they should stay server-only
  }
};
```

**Web app `.env` (local):**

```bash
# Use the dev-godaddy.com hostname — localhost fails TLS with Gasket dev certs
API_SERVICE_URL=https://local.gasket.dev-godaddy.com:8444
```

In Katana, set `API_SERVICE_URL` to the internal service URL for the API app (not the public browser URL if they differ).

> **Local dev hostname rule:** Both apps use `@godaddy/gasket-plugin-dev-certs`. Certs are issued for `*.dev-godaddy.com`, not `localhost`. Browser and server-side fetch must use `local.gasket.dev-godaddy.com`, not `localhost`.

### 5c. API app `gasket-data.ts`

Same pattern for API-only config (DB connection hints, feature flags):

```ts
export default {
  databaseUrl: process.env.DATABASE_URL,  // server-only, never public
  public: {}
};
```

Secrets belong in Katana env vars or secrets manager — not committed to git.

### 5d. Swagger config (API app only)

```ts
swagger: {
  jsdoc: {
    definition: {
      info: {
        title: 'aiusage-api',
        version: '1.0.0'
      }
    },
    apis: ['./plugins/*']
  }
}
```

---

---

## Step 6: Connect Web App to API — `/usage` Worked Example

This section documents the **actual `/usage` implementation** in this stack: API endpoint → config → server-side fetch → UI page.

### End-to-end flow

```text
Browser → https://local.gasket.dev-godaddy.com:8443/usage
              │
              ▼
         getServerSideProps (pages/usage.tsx)
              │
              ▼
         fetchFromApi('/usage')  (lib/fetch-api.ts)
              │
              │  reads apiServiceUrl via gasket.actions.getGasketData()
              ▼
         https://local.gasket.dev-godaddy.com:8444/usage
              │
              ▼
         usageHandler (plugins/routes-plugin.ts)
              │
              ▼
         { totalTokens: 128450, period: "2026-08" }
```

### 6a. Config — `gasket-data.ts` + `.env`

Map the env var once in `gasket-data.ts` (server-only — not under `public`):

```ts
// aiusage-next/gasket-data.ts
export default {
  apiServiceUrl: process.env.API_SERVICE_URL,
  public: {}
};
```

Set the value in `.env`:

```bash
API_SERVICE_URL=https://local.gasket.dev-godaddy.com:8444
```

App code reads config through Gasket — not `process.env` directly:

```ts
const { apiServiceUrl } = await gasket.actions.getGasketData();
```

### 6b. Server-side fetch helper — `lib/fetch-api.ts`

A shared helper for calling the API from Next.js server code:

```ts
// aiusage-next/lib/fetch-api.ts
import https from 'node:https';
import gasket from '@/gasket';

export async function fetchFromApi<T>(path: string): Promise<T> {
  const { apiServiceUrl } = await gasket.actions.getGasketData();

  if (!apiServiceUrl) {
    throw new Error('apiServiceUrl is not configured in gasket-data.ts');
  }

  const url = `${apiServiceUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const isLocalDev = process.env.NODE_ENV === 'development';

  const response = isLocalDev
    ? await fetchWithDevTls(url)
    : await fetch(url);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function fetchWithDevTls(url: string): Promise<Response> {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve(new Response(Buffer.concat(chunks), {
          status: res.statusCode ?? 500,
          headers: res.headers as HeadersInit
        }));
      });
    }).on('error', reject);
  });
}
```

`fetchWithDevTls` accepts self-signed dev certs during local SSR. Production uses normal `fetch` with trusted Katana certs.

### 6c. UI page — `pages/usage.tsx`

Server-side rendering via `getServerSideProps`. The browser never calls the API directly.

```tsx
// aiusage-next/pages/usage.tsx
import React from 'react';
import type { GetServerSideProps } from 'next';
import { fetchFromApi } from '../lib/fetch-api.ts';

export interface UsageSummary {
  totalTokens: number;
  period: string;
}

interface UsagePageProps {
  usage: UsageSummary | null;
  error: string | null;
}

export function UsagePage({ usage, error }: UsagePageProps) {
  return (
    <div>
      <h1>AI Usage</h1>
      {error && <p>{error}</p>}
      {usage && (
        <>
          <p>Period: {usage.period}</p>
          <p>Total tokens: {usage.totalTokens.toLocaleString('en-US')}</p>
        </>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<UsagePageProps> = async () => {
  try {
    const usage = await fetchFromApi<UsageSummary>('/usage');
    return { props: { usage, error: null } };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { props: { usage: null, error: message } };
  }
};

export default UsagePage;
```

Use `toLocaleString('en-US')` with a fixed locale to avoid hydration mismatches between server and client.

Add a link from the homepage (`pages/index.tsx`) so users can navigate to `/usage`.

### 6d. Verify locally

```text
□ aiusage-api running  → curl -k https://local.gasket.dev-godaddy.com:8444/usage
□ aiusage-next running → open https://local.gasket.dev-godaddy.com:8443/usage
□ Page shows period and token count
```

---

## Step 7: Alternative Connection Patterns

The `/usage` example uses **Pattern A (SSR)**. Two other patterns work when client-side fetch is needed.

### Pattern A: Server-side fetch in `getServerSideProps` (used by `/usage`)

**Pros:** No CORS issues, API URL stays server-side.  
**Cons:** Data fetched on each request (add caching as needed).

See [Step 6](#step-6-connect-web-app-to-api--usage-worked-example) for the full implementation.

---

### Pattern B: BFF proxy via `pages/api/*` (recommended for client-side fetch)

Browser calls your web app; web app forwards to the API.

```ts
// pages/api/usage.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import gasket from '@/gasket';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const logger = gasket.actions.getLogger();

  try {
    const { apiServiceUrl } = await gasket.actions.getGasketData();
    const response = await fetch(`${apiServiceUrl}/usage`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    logger.error({ msg: 'BFF proxy failed', err });
    res.status(502).json({ error: 'Upstream API unavailable' });
  }
}
```

Client page:

```tsx
useEffect(() => {
  fetch('/api/usage').then(r => r.json()).then(setUsage);
}, []);
```

**Pros:** Same-origin from browser, hides internal API URL.  
**Cons:** Extra hop through Next.js.

---

### Pattern C: Gasket proxy plugin (path-based proxy)

Install on the **web app**:

```bash
npm install @godaddy/gasket-plugin-proxy
```

Configure in `gasket.ts`:

```ts
import pluginProxy from '@godaddy/gasket-plugin-proxy';

export default makeGasket({
  plugins: [
    // ...existing plugins
    pluginProxy
  ],
  proxy: {
    proxies: {
      usageApi: {
        url: '/api/usage',
        targetUrl: async () => {
          const { apiServiceUrl } = await gasket.actions.getGasketData();
          return `${apiServiceUrl}/usage`;
        }
      }
    }
  }
});
```

**Pros:** Declarative, no hand-written proxy handler.  
**Cons:** Adds plugin; best for simple pass-through proxies.

See `gasket-repo/packages/gasket-plugin-proxy/docs/quickstart.md`.

---

### Authenticated calls (SSO JWT)

When the API requires GoDaddy SSO, use `@gasket/request` or authenticated fetch patterns from the auth plugin — not raw `fetch` without credentials.

See `gasket-repo/packages/gasket-plugin-auth/docs/fetch.md` for:

- Passing cookies (`credentials: 'same-origin'`)
- Proxying authenticated calls through the web server
- JWT attachment for service-to-service calls

---

## Step 8: Shared Conventions Across Both Apps

Keep these aligned for easier operations:

| Concern | Web app | API app |
|---------|---------|---------|
| **Appcode** | Separate Katana appcode | Separate Katana appcode |
| **`OTEL_SERVICE_NAME`** | `aiusage-next` | `aiusage-api` |
| **`GD_ENV`** | Set by Katana per env | Set by Katana per env |
| **Logging** | Winston via Gasket | Winston via Gasket |
| **Visitor context** | `plugin-visitor` | `plugin-visitor` |
| **Security** | `plugin-security` | `plugin-security` |

Both apps log JSON via Winston — use consistent field names (`msg`, `traceId`) for CloudWatch queries.

---

## Step 9: Deploy the Complete Stack

Each app deploys independently on **Katana**:

```text
1. Create two appcodes in GoDaddy Cloud UI
   - aiusage-next  (web)
   - aiusage-api   (service)

2. Deploy aiusage-api first
   - Katana sets GD_ENV, secrets, internal URL

3. Deploy aiusage-next
   - Set API_SERVICE_URL → internal Katana URL of aiusage-api

4. Verify
   - Web: /healthcheck → { status: 'ok' }
   - API: GET /usage → 200
   - End-to-end: load https://<web-app>/usage
```

```text
Production traffic:

User browser
    → aiusage-next (Katana)
        → aiusage-api (Katana, internal network)
            → database / external services
```

Web and API scale independently. A spike in API traffic does not require scaling the Next.js UI tier (and vice versa).

---

## Recommended Repo Layout

```text
~/projects/
├── aiusage-next/          # web app (this repo)
└── aiusage-api/           # API app (separate repo)
```

Two repos, two appcodes, two Katana deployments. Some teams use a monorepo — that is an organizational choice, but deployments remain separate services.

---

## What Goes Where — Decision Table

| Feature | Web app | API app |
|---------|---------|---------|
| React pages, UXCore2 | Yes | No |
| Presentation Central header | Yes | No |
| SSO login UI | Yes | No |
| `/api/auth/validate` (auth check) | Yes | No |
| CRUD for business entities | Proxy only | Yes |
| Database access | Avoid | Yes |
| Swagger/OpenAPI docs | No | Yes |
| Shared by multiple clients | No | Yes |

---

## Common Mistakes

### Using `localhost` instead of `local.gasket.dev-godaddy.com`

```text
Bad:  API_SERVICE_URL=https://localhost:8444
Good: API_SERVICE_URL=https://local.gasket.dev-godaddy.com:8444
```

Gasket dev certs are issued for `*.dev-godaddy.com`. Server-side fetch to `localhost` fails TLS even when the API is running.

### Reading `process.env` directly in page code

```text
Bad:  const url = process.env.API_SERVICE_URL in pages/usage.tsx
Good: gasket-data.ts maps env → apiServiceUrl; app code uses gasket.actions.getGasketData()
```

### Hydration mismatch from `toLocaleString()`

```text
Bad:  usage.totalTokens.toLocaleString()           // server/client locale may differ
Good: usage.totalTokens.toLocaleString('en-US')   // fixed locale on both sides
```

### Putting business logic in `pages/api/*`

```text
Bad:  pages/api/users.ts implements full user CRUD + DB access
Good: pages/api/users.ts proxies to aiusage-api/users
```

### Hardcoding API URL in client components

```text
Bad:  fetch('https://aiusage-api.internal.gdcorp.tools/...')
Good: fetch('/api/usage')  → BFF route uses process.env.API_SERVICE_URL
```

### Same appcode for both apps

```text
Bad:  one Katana app trying to run Next.js + Express
Good: two appcodes, two services, env var linking them
```

### API calling the web app

```text
Bad:  API fetches https://aiusage-next/... for data
Good: shared data lives in DB or API; web calls API
```

---

## End-to-End Checklist

```text
□ Create aiusage-api with gasket-template-api-express
□ Add GET /usage in plugins/routes-plugin.ts
□ Run both apps locally (two terminals)
□ Set API_SERVICE_URL in web app .env (use dev-godaddy.com hostname)
□ Add lib/fetch-api.ts and pages/usage.tsx (SSR pattern)
□ Choose alternative pattern if needed (BFF / proxy plugin)
□ Create two appcodes in GoDaddy Cloud UI
□ Deploy API, then web app
□ Set API_SERVICE_URL in Katana for web app
□ Verify /healthcheck (web) and GET /usage (API)
□ Confirm OTEL_SERVICE_NAME differs per app
```

---

## Takeaways

1. **Two apps, two repos, two deployments** — web for UI, API for business logic.
2. **`aiusage-next` already exists** — create `aiusage-api` separately with `create-gasket-app`.
3. **Configure linkage via env vars** (`API_SERVICE_URL` → `gasket-data.ts` → `getGasketData()`), not raw `process.env` in pages.
4. **The `/usage` example** shows the full path: API route → config → `fetchFromApi` → SSR page.
5. **Use `local.gasket.dev-godaddy.com` locally** — not `localhost` — for Gasket dev cert compatibility.
6. **Prefer server-side or BFF calls** from web to API — avoid exposing internal URLs to the browser.
7. **Both apps share Gasket patterns** (plugins, `gdEnv()`, logging, OTel) but different presets and server models.

---

## References

[1] API Template — `gasket-repo/packages/gasket-template-api-express/README.md`  
[2] API Preset — `gasket-repo/packages/gasket-preset-api/README.md`  
[3] Architecture Layers — `gasket-repo/docs/architecture-layers.md`  
[4] Proxy Plugin Quickstart — `gasket-repo/packages/gasket-plugin-proxy/docs/quickstart.md`  
[5] Authenticated Fetch — `gasket-repo/packages/gasket-plugin-auth/docs/fetch.md`  
[6] Start to Finish — `gasket-repo/docs/start-to-finish.md`  
[7] Katana — https://tdl.gdcorp.tools/docs/products/compute/managed/katana/
