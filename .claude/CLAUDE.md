# Your Core Instructions

This project defines your basic behaviour and your rules. The full instructions live in two rule files under `.claude/rules/`.

## Where to find instructions

| File | Path | Purpose |
|------|------|---------|
| **Teaching** | `.claude/rules/teaching.md` | How concepts are researched, explained, structured, and taught |
| **Coding standards** | `.claude/rules/coding-standard.md` | How software is designed, structured, implemented, tested, and deployed |

You load every `.md` file in `.claude/rules/` automatically at session start. You do not need to read them manually unless you want to review or edit them.

## How to apply both

- **When teaching or writing curriculum chapters:** follow `teaching.md` for explanation style, chapter structure, references, and progressive examples.
- **When writing or reviewing code:** follow `coding-standard.md` for design, contracts, knowledge boundaries, testing, and deployment.
- **When teaching includes code examples:** both apply — teach using `teaching.md`, and make every code snippet conform to `coding-standard.md`.


## Updates 

If there is an `UPDATES.md` file that is maintained in the repo, always update that file whenever you make changes in the codebase so that there is a log of whatever has been changed. Now, the schema and the style to maintain the updates file is based on the repo and the team. So, Look into the pre-existing `UPDATES.md` file and make changes accordingly. If there are no `UPDATES.md` file then no need for any changes.

If guidance ever conflicts, prefer the file that matches the primary task (teaching vs. implementation).

## Project context

This workspace is a **Gasket learning stack**. Before answering questions about the apps, architecture, or Gasket concepts, read the project context file:

**[`claude.md`](../claude.md)** — workspace layout, core concepts, key files, web/API comparison, integration map, and debugging tips.

Human-facing overview: **[`README.md`](../README.md)**

| Path | Role |
|------|------|
| `aiusage-next/` | Customer Experience web app (Next.js Pages Router + Gasket) |
| `aiusage-api/` | Service Layer API app (Express + Gasket) |
| `docs/` | 9-chapter guided tutorial |
| `gasket-repo/` | Upstream Gasket monorepo (reference only) |

**Dependency rule:** web app calls API; API never calls web app.

Tutorial chapters live in `docs/` — read in numeric order when teaching or explaining Gasket.



# Gasket Learning Stack — Agent Context

Use this file for project context when answering questions about Gasket, this workspace, or its apps.

## Workspace

| Path | Role |
|------|------|
| `aiusage-next/` | Customer Experience web app — Next.js Pages Router + Gasket |
| `aiusage-api/` | Service Layer API app — Express + Gasket |
| `docs/` | 9-chapter guided tutorial for this stack |
| `gasket-repo/` | Upstream Gasket monorepo — reference only, never imported at runtime |

Human-facing overview: [`README.md`](./README.md)

## Gasket Summary

Gasket is GoDaddy's **plugin orchestrator**. It wires Next.js or Express to platform services (SSO, Presentation Central, Traffic, Intl, security, OTel) via `gasket.ts`, plugins, lifecycles, and actions.

- **You own:** pages, components, business logic
- **Plugins own:** platform integration wiring
- **Rule:** dependencies flow down — web calls API, never the reverse

## Core Concepts

| Concept | Where / How |
|---------|-------------|
| `makeGasket()` | `gasket.ts` — creates the kernel |
| Plugins | Register lifecycle hooks; do not import each other directly |
| Lifecycles | `init`, `configure`, `ready`, `build`, `visitor`, `presentationCentral`, … |
| Actions | `getNextConfig`, `startProxyServer`, `startServer`, `getCheckAuth`, `getVisitor`, `getLogger`, … |
| Environments | `gdEnv()` from `@godaddy/gasket-utils` — reads `GD_ENV` or `GASKET_ENV` |
| Dynamic plugins | Loaded per command/env (e.g. `@gasket/plugin-analyze`, docs plugins) |
| Compiled instance | `dist/gasket.js`, imported as `@/gasket` in Next.js |

## Architecture

```text
Browser → aiusage-next (:8443 proxy → :3000 Next.js)
              │
              │  HTTP (SSR, BFF, or proxy plugin)
              ▼
         aiusage-api (:8444 Express)
              │
              ▼
         DB / external services
```

### App Comparison

| | Web (`aiusage-next`) | API (`aiusage-api`) |
|---|---|---|
| Preset | `@godaddy/gasket-preset-webapp` | `@godaddy/gasket-preset-api` |
| Server | `startProxyServer()` in `server.ts` | `startServer()` in `server.ts` |
| Routes | `pages/*.tsx`, `pages/api/*` | `plugins/routes-plugin.ts` (`express` hook) |
| HTTPS port | 8443 (proxy) + 3000 (Next) | 8444 |
| UI | React + UXCore2 | None |

## Key Files — Web (`aiusage-next`)

| File | Purpose |
|------|---------|
| `gasket.ts` | 17 plugins, httpsProxy, intl, uxp, presentationCentral config |
| `gasket-data.ts` | SSR data contract; `apiServiceUrl` from `API_SERVICE_URL` |
| `server.ts` | `gasket.actions.startProxyServer()` |
| `next.config.js` | `gasket.actions.getNextConfig()` |
| `pages/_app.tsx` | `createApp`, `withAuthProvider`, `withLocaleInitialProps`, intl |
| `pages/_document.ts` | `makeDocument` + `withGasketData` |
| `pages/index.tsx` | Starter homepage (UXCore2) |
| `pages/api/auth/validate.ts` | Example: `gasket.actions.getCheckAuth(req)` |
| `middleware.ts` | `/healthcheck` only |
| `instrumentation.ts` | OpenTelemetry registration |

### Web dev workflow

`npm run local` = 3 processes: `tsc --watch` → `dist/`, HTTPS proxy :8443, `next dev` :3000.

Browser URL: https://local.gasket.dev-godaddy.com:8443

## Key Files — API (`aiusage-api`)

| File | Purpose |
|------|---------|
| `gasket.ts` | express, swagger, security, visitor, otel; `https.port: 8444` |
| `server.ts` | `gasket.actions.startServer()` |
| `plugins/routes-plugin.ts` | Express routes via `express` lifecycle; Swagger JSDoc |
| `gasket-data.ts` | Server-only config contract |

`npm run local` = single process: `tsx watch server.ts`

## Web App Plugins

| Plugin | Responsibility |
|--------|----------------|
| `@gasket/plugin-nextjs` | Next.js integration |
| `@godaddy/gasket-plugin-auth` | SSO |
| `@godaddy/gasket-plugin-uxp` | Presentation Central + UXCore2 |
| `@godaddy/gasket-plugin-visitor` | Market / PLID detection |
| `@godaddy/gasket-plugin-traffic` | Analytics / RUM |
| `@gasket/plugin-intl` | Localization |
| `@godaddy/gasket-plugin-security` | CSP, security headers |
| `@godaddy/gasket-plugin-atlas` | Brand/market config |
| `@godaddy/gasket-plugin-otel` | OpenTelemetry |
| `@gasket/plugin-https-proxy` | Local/production HTTPS proxy |

## Connecting Web to API

Env var: `API_SERVICE_URL` in web app `.env` (local) or Katana (deployed).

Patterns (see `docs/09-web-and-api-full-stack.md`):

1. **SSR** — `getServerSideProps` fetches API server-side
2. **BFF** — `pages/api/*` proxies to API; client calls `/api/...`
3. **Proxy plugin** — `@godaddy/gasket-plugin-proxy` in `gasket.ts`

Never hardcode internal API URLs in client components. Never put business logic + DB access in `pages/api/*` — keep that in the API app.

## Knowledge Boundaries

```text
pages/components     → UI, React, UXCore2, business presentation
pages/api/*          → thin handlers; delegate to gasket.actions or proxy to API
gasket.ts            → plugins + integration config only (no business rules)
gasket-data.ts       → SSR data contract (public vs server-only)
plugins/routes-plugin.ts (API) → REST endpoints + business logic
gasket-repo/         → upstream reference; grep for docs and package source
```

## Tutorial Docs (`docs/`)

Read in order when teaching or explaining:

1. `01-introduction-to-gasket.md`
2. `02-creating-a-gasket-app.md`
3. `03-repo-structure.md`
4. `04-core-concepts.md`
5. `05-runtime-and-dev-workflow.md`
6. `06-key-files-deep-dive.md`
7. `07-godaddy-integrations.md`
8. `08-extending-your-app.md`
9. `09-web-and-api-full-stack.md`

## Common Debugging

| Symptom | Check |
|---------|-------|
| `@/gasket` import fails | Run `npm run build:tsc` — `dist/gasket.js` must exist |
| HTTPS cert errors | VPN + dev certs; use `*.dev-godaddy.com`, not bare `localhost` |
| Port 8443 in use | Kill stale proxy process |
| Auth not working locally | HTTPS required; check visitor + SSO plugins |
| Plugin config not applied | Verify `gasket.ts` compiled to `dist/` |

## Upstream References

- `gasket-repo/README.md` — full plugin/action/lifecycle catalog
- `gasket-repo/docs/architecture-layers.md`
- `gasket-repo/docs/system-integrations.md`
- `gasket-repo/docs/server-features.md`
- https://gasket.dev/

## Agent Rules

Teaching and coding standards live in `.claude/rules/` (loaded automatically by Claude Code). When explaining concepts, follow `teaching.md`. When writing code, follow `coding-standard.md`.
