# Gasket Learning Stack

A GoDaddy Gasket full-stack workspace for learning the framework. It includes a **web app**, an **API app**, guided **tutorial docs**, and a local copy of the **upstream Gasket monorepo** for reference.

## Workspace Layout

| Path | Role |
|------|------|
| [`aiusage-next/`](./aiusage-next/) | Customer Experience web app — Next.js Pages Router + Gasket |
| [`aiusage-api/`](./aiusage-api/) | Service Layer API app — Express + Gasket |
| [`docs/`](./docs/) | Guided tutorial (9 chapters) for this stack |
| [`gasket-repo/`](./gasket-repo/) | Upstream Gasket monorepo — reference only, not imported at runtime |

## What Is Gasket?

Gasket is GoDaddy's **plugin orchestrator** for web applications. It is not a replacement for Next.js or React — it wires Next.js (or Express) to GoDaddy platform services through a central config file and lifecycle system.

**You write UI and business logic. Plugins handle platform wiring** (SSO, headers, analytics, localization, security, OpenTelemetry, and more).

### Core Concepts

| Concept | Description |
|---------|-------------|
| `makeGasket()` | Creates the Gasket kernel in `gasket.ts` |
| **Plugins** | Modules that register lifecycle hooks (`ready`, `visitor`, `build`, …) |
| **Actions** | Runtime functions your app calls (`getCheckAuth`, `getVisitor`, `getNextConfig`, …) |
| **Lifecycles** | Events fired during startup, build, or request handling |
| **Environments** | `gdEnv()` reads `GD_ENV` (Katana) or `GASKET_ENV` (local override) |

The compiled Gasket instance lives at `dist/gasket.js` and is imported as `@/gasket` in Next.js files.

## Architecture

GoDaddy separates **Customer Experience** apps from **Service Layer** APIs. Dependencies flow **down only** — the web app calls the API; the API never calls back into the web app.

```text
Browser
  │
  ▼
aiusage-next (:8443 HTTPS proxy → :3000 Next.js)
  │
  │  HTTP — server-side fetch or BFF proxy
  ▼
aiusage-api (:8444 Express HTTPS)
  │
  ▼
Databases, external services, GoCaaS, etc.
```

### Web vs API

| | **Web** (`aiusage-next`) | **API** (`aiusage-api`) |
|---|---|---|
| Preset | `@godaddy/gasket-preset-webapp` | `@godaddy/gasket-preset-api` |
| Template | `gasket-template-webapp-pages` | `gasket-template-api-express` |
| Framework | Next.js Pages Router | Express.js |
| Server entry | `gasket.actions.startProxyServer()` | `gasket.actions.startServer()` |
| Routes | `pages/*.tsx`, `pages/api/*` | `plugins/routes-plugin.ts` |
| Key plugins | nextjs, uxp, auth, intl, traffic | express, swagger |

## Prerequisites

- VPN access (required for GoDaddy internal npm registry and services)
- Node.js and npm installed
- Basic familiarity with React and Next.js

## Quick Start

### Web app

```bash
cd aiusage-next
npm install
npm run local
```

Open https://local.gasket.dev-godaddy.com:8443

`npm run local` starts three processes:

1. `tsc --watch` — compiles `gasket.ts` and `server.ts` to `dist/`
2. HTTPS proxy on port **8443**
3. Next.js dev server on port **3000**

### API app

```bash
cd aiusage-api
npm install
npm run local
```

The API runs on port **8444** (configured in `gasket.ts` so it does not clash with the web app proxy).

### Run both locally

Open two terminals — one for each app. Set `API_SERVICE_URL` in the web app's `.env` to point at the API (see [Chapter 9](./docs/09-web-and-api-full-stack.md)).

## Key Files

### Web app (`aiusage-next`)

| File | Role |
|------|------|
| `gasket.ts` | Central config — plugins, env, integrations |
| `gasket-data.ts` | SSR-safe data injected into pages |
| `server.ts` | Starts HTTPS proxy |
| `next.config.js` | Delegates to `gasket.actions.getNextConfig()` |
| `pages/_app.tsx` | App shell — auth, intl, gasket-next wrappers |
| `pages/_document.ts` | HTML document — headers, GasketData, Presentation Central |
| `pages/index.tsx` | Homepage |
| `pages/api/auth/validate.ts` | Example API route using `gasket.actions.getCheckAuth` |
| `middleware.ts` | `/healthcheck` for Katana deployment probes |

### API app (`aiusage-api`)

| File | Role |
|------|------|
| `gasket.ts` | Central config — Express, Swagger, security, OTel |
| `server.ts` | Starts Express HTTPS server |
| `plugins/routes-plugin.ts` | REST routes via the `express` lifecycle hook |

## GoDaddy Integrations (Web App)

| Plugin | Responsibility |
|--------|----------------|
| `plugin-auth` | SSO / authentication |
| `plugin-visitor` | Market, PLID, reseller detection |
| `plugin-uxp` | Presentation Central header/footer + UXCore2 |
| `plugin-traffic` | Analytics / RUM |
| `plugin-intl` | Localization (GoLF) |
| `plugin-security` | CSP, security headers |
| `plugin-atlas` | Brand/market configuration |
| `plugin-otel` | OpenTelemetry |

## Tutorial Docs

The [`docs/`](./docs/) folder contains a 9-chapter guided tour. Read them in order:

| # | Chapter | Topic |
|---|---------|-------|
| 1 | [Introduction to Gasket](./docs/01-introduction-to-gasket.md) | What Gasket is and where it sits in GoDaddy architecture |
| 2 | [Creating a Gasket App](./docs/02-creating-a-gasket-app.md) | Presets, templates, scaffolding |
| 3 | [Repo Structure](./docs/03-repo-structure.md) | Every important file and directory |
| 4 | [Core Concepts](./docs/04-core-concepts.md) | makeGasket, plugins, lifecycles, actions |
| 5 | [Runtime and Dev Workflow](./docs/05-runtime-and-dev-workflow.md) | What runs when you build, start, and deploy |
| 6 | [Key Files Deep Dive](./docs/06-key-files-deep-dive.md) | Request-to-page pipeline |
| 7 | [GoDaddy Integrations](./docs/07-godaddy-integrations.md) | SSO, Presentation Central, Traffic, Intl, Atlas |
| 8 | [Extending Your App](./docs/08-extending-your-app.md) | Pages, plugins, local hooks |
| 9 | [Web + API Full Stack](./docs/09-web-and-api-full-stack.md) | Wiring both apps together |

## Connecting Web to API

Three common patterns (detailed in [Chapter 9](./docs/09-web-and-api-full-stack.md)):

1. **Server-side fetch in `getServerSideProps`** — browser never talks to the API directly
2. **BFF proxy via `pages/api/*`** — browser calls your web app; web app forwards to the API
3. **Gasket proxy plugin** — declarative path-based proxy

Set `API_SERVICE_URL` in the web app's `.env` (local) or Katana env vars (deployed).

## Deployment

Each app deploys independently on **Katana** with its own appcode:

1. Deploy `aiusage-api` first
2. Deploy `aiusage-next` with `API_SERVICE_URL` pointing to the API's internal Katana URL
3. Verify `/healthcheck` (web) and API endpoints

## Related Resources

- [Gasket public docs](https://gasket.dev/)
- Upstream quick start — [`gasket-repo/docs/quick-start.md`](./gasket-repo/docs/quick-start.md)
- Architecture layers — [`gasket-repo/docs/architecture-layers.md`](./gasket-repo/docs/architecture-layers.md)
- Agent context — [`claude.md`](./claude.md)
