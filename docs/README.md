# Gasket App Tutorials

A guided tour of the `aiusage-next` starter — a bare-minimum GoDaddy Gasket web application built from `@godaddy/gasket-template-webapp-pages`.

These chapters move from high-level architecture to file-level details. Each chapter is self-contained, but they are best read in order.

## Chapters

| # | Chapter | What you'll learn |
|---|---------|-------------------|
| 1 | [Introduction to Gasket](./01-introduction-to-gasket.md) | What Gasket is, why it exists, and where it sits in GoDaddy's architecture |
| 2 | [Creating a Gasket App](./02-creating-a-gasket-app.md) | Presets, templates, and how this repo was scaffolded |
| 3 | [Repo Structure](./03-repo-structure.md) | Every important file and directory in the starter app |
| 4 | [Core Concepts](./04-core-concepts.md) | `makeGasket`, plugins, lifecycles, actions, and environments |
| 5 | [Runtime and Dev Workflow](./05-runtime-and-dev-workflow.md) | What happens when you run `npm run local`, build, and deploy |
| 6 | [Key Files Deep Dive](./06-key-files-deep-dive.md) | How `gasket.ts`, `_app.tsx`, `_document.ts`, and related files connect |
| 7 | [GoDaddy Integrations](./07-godaddy-integrations.md) | Auth, Presentation Central, Traffic, Intl, Atlas, and more |
| 8 | [Extending Your App](./08-extending-your-app.md) | Adding pages, plugins, local hooks, and keeping clean boundaries |
| 9 | [Web + API Full Stack](./09-web-and-api-full-stack.md) | Creating the API app, configuring both apps, and wiring them together |
| 10 | [Local HTTPS and Dev Certs](./10-local-https-and-dev-certs.md) | Why HTTPS locally, dev-certs, browser trust, and "Not Secure" warnings |

## Prerequisites

- VPN access (required for GoDaddy internal npm registry and services)
- Node.js and npm installed
- Basic familiarity with React and Next.js

## Quick start

```bash
cd aiusage-next
npm install
npm run local
```

Open https://local.gasket.dev-godaddy.com:8443

## Related resources

- [Project README](../../README.md)
- [Gasket upstream docs](../../gasket-repo/docs/quick-start.md)
- [Gasket public docs](https://gasket.dev/)
