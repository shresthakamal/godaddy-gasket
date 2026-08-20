# Chapter 5: Runtime and Dev Workflow

## Chapter Overview

Understanding what runs when you execute `npm run local`, `npm run build`, or `npm run start` helps you debug issues and know which process owns which port.

---

## Development: `npm run local`

From `package.json`:

```json
"local": "concurrently \"npm run build:tsc:watch\" \"npm run local:https\" \"next dev --webpack\""
```

Three processes start in parallel:

```text
┌─────────────────────────────────────────────────────────────┐
│  npm run local                                              │
├─────────────────────────────────────────────────────────────┤
│  1. build:tsc:watch   → tsc watches gasket.ts, server.ts    │
│                         outputs to dist/                    │
│                                                             │
│  2. local:https       → tsx watch server.ts                  │
│                         HTTPS proxy on port 8443            │
│                                                             │
│  3. next dev          → Next.js dev server on port 3000     │
└─────────────────────────────────────────────────────────────┘
```

### Request flow

```text
Browser
  │
  ▼
https://local.gasket.dev-godaddy.com:8443
  │
  ▼
server.ts → gasket.actions.startProxyServer()
  │         (terminates TLS, forwards headers)
  ▼
http://localhost:3000
  │
  ▼
Next.js (pages, API routes, middleware)
```

### Why the proxy exists

1. **SSO cookies** often require HTTPS and realistic domains
2. **Dev cert plugins** provide trusted local certificates for `*.dev-godaddy.com`
3. **Production parity** — Katana deployments can use the same proxy pattern

Proxy config in `gasket.ts`:

```ts
httpsProxy: {
  protocol: 'https',
  port: 8443,
  xfwd: true,
  ws: true,
  target: { host: 'localhost', port: 3000 }
}
```

---

## Build: `npm run build`

```text
npm run build
  │
  ├── prebuild: tsx gasket.ts build
  │     └── Runs Gasket 'build' lifecycle (plugins prepare assets)
  │
  ├── build:tsc: tsc -p tsconfig.server.json
  │     └── Compiles gasket.ts, server.ts → dist/
  │
  └── next build --webpack
        └── Production Next.js bundle → .next/
```

The `--webpack` flag is explicit because this template uses webpack-based Next builds (Gasket plugins hook into webpack config).

---

## Production: `npm run start`

```json
"start": "NODE_OPTIONS='--import @godaddy/gasket-otel/register' ... npm run start:https & next start"
```

Two processes:

| Process | Command | Port |
|---------|---------|------|
| HTTPS proxy | `node dist/server.js` | 8443 |
| Next.js | `next start` | 3000 |

OpenTelemetry is preloaded via `@godaddy/gasket-otel/register` for production observability.

---

## Other Useful Scripts

| Script | Purpose |
|--------|---------|
| `npm run preview` | Build + start (production-like locally) |
| `npm run analyze` | Bundle analysis with `@gasket/plugin-analyze` |
| `npm run docs` | Generate plugin/docs markdown + Docusaurus site |
| `npm run test` | Run Vitest tests |
| `npm run lint` | ESLint |
| `npm run stylelint` | CSS linting |

---

## Environment Variables

| Variable | Source | Purpose |
|----------|--------|---------|
| `GASKET_ENV` | Local override | Force a Gasket environment |
| `GD_ENV` | Katana (production) | Deployment environment |
| `OTEL_SERVICE_NAME` | Katana / `.env` | OpenTelemetry service name |

Local development typically uses `local` (default when neither is set, via `gdEnv()`).

---

## TypeScript Compile Watch

Why compile Gasket separately from Next.js?

```text
gasket.ts, server.ts  → Node ESM, run outside Next.js
pages/*.tsx           → Bundled by Next.js

Different module targets → separate tsconfig files
```

While developing:

- Edit `gasket.ts` → `tsc --watch` recompiles to `dist/gasket.js`
- Next.js pages import `@/gasket` → `./dist/gasket.js`
- Restart may be needed if a plugin config change affects Next config (rare in dev due to HMR limits on config)

---

## Middleware and Health Checks

`middleware.ts` handles `/healthcheck` for deployment probes:

```ts
export const config = { matcher: ['/healthcheck'] };

export async function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/healthcheck')) {
    return Response.json({ status: 'ok' }, { status: 200 });
  }
}
```

Katana uses this during deploys to verify the app is healthy before routing traffic.

---

## Observability

### Development

Next.js dev logging in `.next/dev/logs/`. Gasket logger (Winston) outputs structured JSON logs from plugins.

### Production

- `instrumentation.ts` registers OTel via `@vercel/otel`
- `@godaddy/gasket-otel` preloaded in `npm run start`
- Katana sends logs to CloudWatch

---

## Debugging Tips

| Symptom | Check |
|---------|-------|
| `@/gasket` import fails | Run `npm run build:tsc` — `dist/gasket.js` must exist |
| HTTPS cert errors locally | VPN + dev certs plugin; visit `*.dev-godaddy.com` not `localhost` |
| Port 8443 in use | Kill stale proxy process |
| Plugin config not applied | Verify `gasket.ts` change compiled to `dist/` |
| Auth not working locally | HTTPS required; check visitor plugin and SSO config |

See `gasket-repo/docs/debugging.md` for platform-specific issues.

---

## Server Options (Context)

Your app uses **Pages Router + Default Next Server + HTTPS Proxy**.

Alternatives in the Gasket ecosystem:

| Option | When to use |
|--------|-------------|
| Pages + HTTPS proxy | **Default** — simplest, your app |
| Pages + Custom Express | Need Express middleware |
| App Router | New Next.js features; some Gasket integrations still maturing |

See `gasket-repo/docs/server-features.md` for the support matrix.

---

## Takeaways

1. **`npm run local` = 3 processes**: tsc watch, HTTPS proxy, Next dev.
2. **Browser hits :8443**, proxy forwards to Next on :3000.
3. **`prebuild` runs Gasket build lifecycle** before Next production build.
4. **`dist/` must exist** before Next can import `@/gasket`.
5. **`/healthcheck` middleware** supports Katana deployment health probes.

---

## Next chapter

Continue to [Chapter 6: Key Files Deep Dive](./06-key-files-deep-dive.md).

## References

[1] Project README — `README.md`  
[2] Server Features — `gasket-repo/docs/server-features.md`  
[3] Debugging — `gasket-repo/docs/debugging.md`  
[4] Start to Finish — `gasket-repo/docs/start-to-finish.md`
