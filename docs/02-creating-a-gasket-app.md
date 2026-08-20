# Chapter 2: Creating a Gasket App

## Chapter Overview

This repo was not hand-crafted file by file. It was **scaffolded** by the Gasket CLI using a **template** and backed by a **preset**. Understanding that distinction is essential for knowing what you can change vs. what Gasket generates for you.

---

## The Existing World

Without scaffolding, you would:

1. Create a Next.js app manually
2. Install dozens of `@gasket/*` and `@godaddy/gasket-*` packages
3. Wire each plugin into a config file
4. Add server, middleware, intl, and document files
5. Configure TypeScript, PostCSS, ESLint, and test tooling

That is hours of setup before writing a single feature.

---

## The Gap / Problem

Teams needed a **repeatable, correct starting point** that included all GoDaddy-standard integrations without copy-pasting from an old project.

---

## Two Building Blocks: Presets and Templates

| Concept | Answers | Example |
|---------|---------|---------|
| **Preset** | *What capabilities?* | `@godaddy/gasket-preset-webapp` — auth, traffic, uxp, visitor, otel, etc. |
| **Template** | *What file structure?* | `@godaddy/gasket-template-webapp-pages` — Pages Router + TypeScript |

```text
create-gasket-app
        │
        ├── preset  → selects plugins + default config
        └── template → scaffolds files (pages/, gasket.ts, server.ts, ...)
```

---

## How This Repo Was Created

```bash
npx create-gasket-app aiusage-next --template @godaddy/gasket-template-webapp-pages
```

Requirements:

- VPN connected (internal npm registry)
- Artifactory npm registry configured (see GoDaddy NPM setup guide)

The CLI asks questions during creation (TypeScript, server type, etc.) and writes the scaffolded project.

---

## What the Preset Chooses

The webapp preset (`@godaddy/gasket-preset-webapp`) registers plugins via its `presetConfig` hook. Default plugins include:

- `@gasket/plugin-command`, `@gasket/plugin-data`, `@gasket/plugin-nextjs`
- `@godaddy/gasket-plugin-auth`, `@godaddy/gasket-plugin-security`
- `@godaddy/gasket-plugin-traffic`, `@godaddy/gasket-plugin-visitor`
- `@godaddy/gasket-plugin-uxp`, `@godaddy/gasket-plugin-atlas`
- `@godaddy/gasket-plugin-otel`, `@godaddy/gasket-plugin-dev-certs`

Server type branching:

```text
nextServerType === 'customServer'
  → adds Express + HTTPS plugins

nextDevProxy === true  (your app)
  → adds @gasket/plugin-https-proxy
```

Your app uses the **HTTPS proxy** path: Next.js on port 3000, proxy on port 8443.

See `gasket-repo/packages/gasket-preset-webapp/lib/preset-config.js` for the full list.

---

## What the Template Provides

The `@godaddy/gasket-template-webapp-pages` template scaffolds:

| Category | Files |
|----------|-------|
| Gasket config | `gasket.ts`, `gasket-data.ts`, `intl.ts` |
| Server | `server.ts`, `middleware.ts`, `instrumentation.ts` |
| Next.js | `next.config.js`, `pages/_app.tsx`, `pages/_document.ts`, `pages/index.tsx` |
| Tooling | `tsconfig.json`, `tsconfig.server.json`, `vitest.config.js` |
| i18n | `locales/`, `manifest.xml` |
| Styling | `styles/global.css`, PostCSS config in `package.json` |

---

## Available Templates and Presets

From the Gasket ecosystem:

**Presets**

| Preset | Purpose |
|--------|---------|
| `@godaddy/gasket-preset-webapp` | Customer-facing web apps |
| `@godaddy/gasket-preset-api` | Backend API services |
| `@godaddy/gasket-preset-hcs` | Header Content Service apps |

**Templates**

| Template | Router | Server |
|----------|--------|--------|
| `@godaddy/gasket-template-webapp-pages` | Pages Router | Default Next + HTTPS proxy |
| `@godaddy/gasket-template-webapp-app` | App Router | Default Next |
| `@godaddy/gasket-template-webapp-express` | Pages Router | Custom Express server |

---

## After Creation

```bash
cd aiusage-next
npm install
npm run local
```

App available at: https://local.gasket.dev-godaddy.com:8443

---

## Common Mistakes

**Mistake:** Editing generated files like `intl.ts` manually.

**Why it's wrong:** The Intl plugin regenerates this file from `gasket.ts` intl config.

**Better approach:** Change locales in `gasket.ts` and locale JSON files; let the plugin manage `intl.ts`.

---

## Takeaways

1. **Preset = plugins + config defaults.** Template = files on disk.
2. This repo uses **Pages Router + HTTPS proxy** — a deliberate template choice.
3. The scaffold is a starting point; `gasket.ts` is where you customize after creation.
4. Use `npm run docs` to generate documentation for your app's plugins and actions.

---

## References

[1] Quick Start — `gasket-repo/docs/quick-start.md`  
[2] Template README — `gasket-repo/packages/gasket-template-webapp-pages/README.md`  
[3] Preset README — `gasket-repo/packages/gasket-preset-webapp/README.md`  
[4] Start to Finish — `gasket-repo/docs/start-to-finish.md`
