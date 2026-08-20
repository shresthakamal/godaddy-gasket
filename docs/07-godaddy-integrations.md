# Chapter 7: GoDaddy Integrations

## Chapter Overview

Your starter app ships with the standard GoDaddy webapp integrations pre-wired. This chapter maps each system to its plugin, config, and usage in your code.

For the full integration catalog, see `gasket-repo/docs/system-integrations.md`.

---

## Integration Map

```text
gasket.ts (config)
    │
    ├── plugin-auth ──────────────► SSO / Authentication Platform
    ├── plugin-visitor ───────────► Market, PLID, reseller detection
    ├── plugin-uxp ───────────────► Presentation Central + UXCore2
    ├── plugin-traffic ───────────► GoDaddy Traffic (analytics/RUM)
    ├── plugin-atlas ─────────────► Brand/market configuration
    ├── plugin-intl ──────────────► Localization + GoLF
    ├── plugin-security ──────────► CSP, security headers
    ├── plugin-otel ──────────────► OpenTelemetry
    └── plugin-dev-certs ─────────► Local HTTPS certificates
```

---

## Authentication (SSO)

**Plugin:** `@godaddy/gasket-plugin-auth`  
**React module:** `@godaddy/gasket-auth`

### What it provides

- SSO middleware and validation via Gasket actions
- React `withAuthProvider()` in `_app.tsx`
- API route pattern for auth checks

### In your app

`_app.tsx` wraps the tree:

```tsx
export default [
  withAuthProvider(),
  withLocaleInitialProps(gasket)
].reduce((cmp, hoc) => hoc(cmp), App);
```

API example at `pages/api/auth/validate.ts`:

```ts
const checkAuth = gasket.actions.getCheckAuth(req);
const auth = await checkAuth(req.query);
```

### Realms supported

`idp`, `jomax`, `pass`, `cert`, `awsiam` — configured via plugin options in `gasket.ts` when needed.

### Resources

- `gasket-repo/packages/gasket-plugin-auth/docs/authentication.md`
- Slack: `#sso-support`

---

## Presentation Central (Headers/Footers)

**Plugin:** `@godaddy/gasket-plugin-uxp`

### What it provides

- Fetches shared header/footer HTML from Presentation Central
- Injects scripts into `_document.ts` via `makeDocument`
- UXCore2 webpack configuration

### In your app

```ts
presentationCentral: {
  params: {
    app: 'gasket-template-webapp-pages',
    manifest: 'internal-header',
    react: '19'
  }
}
```

Change `app` to your registered Presentation Central app name when going to production.

### Lifecycle hook

Use `presentationCentral` lifecycle to customize request params (e.g., venture ID, store ID).

### Resources

- [Presentation Central Repo](https://github.com/gdcorp-uxp/presentation-central)
- Slack: `#uxcore2-support`

---

## UXCore2 (Design System)

**Plugin:** `@godaddy/gasket-plugin-uxp` (webpack/CSS integration)  
**Components:** `@ux/*` packages

### In your app

`pages/index.tsx` demonstrates the pattern:

```tsx
import Box from '@ux/box';
import Button from '@ux/button';
import '@ux/box/dist/styles.css';
import '@ux/button/dist/styles.css';
```

PostCSS is configured in `package.json` with `@ux/postcss-intents` for design token resolution.

### Resources

- [UXCore2 Docs](https://uxcore.uxp.gdcorp.tools)
- Slack: `#uxcore2-support`

---

## Visitor Detection

**Plugin:** `@godaddy/gasket-plugin-visitor`

### What it provides

- Detects market, PLID (private label ID), reseller context from the request
- Feeds data to auth, uxp, traffic, and intl plugins

### Usage

```ts
const visitor = await gasket.actions.getVisitor(req);
```

### Customization

Override via `visitor` lifecycle in a local plugin:

```ts
hooks: {
  visitor(gasket, visitor, { req }) {
    return { ...visitor, /* overrides */ };
  }
}
```

Visitor data also flows into `withLocaleInitialProps(gasket)` for automatic locale selection.

---

## Traffic (Analytics / RUM)

**Plugin:** `@godaddy/gasket-plugin-traffic`

### What it provides

- Behavioral analytics instrumentation
- Real User Monitoring (RUM)
- Experiment tracking data layer

Injected into the document by the uxp/traffic plugin chain. Customize via `tccData` lifecycle.

### Resources

- [Web Instrumentation Docs](https://godaddy-corp.atlassian.net/wiki/spaces/CKPT/pages/92315500/Web+Instrumentation)
- Slack: `#traffic`

---

## Atlas (Brand/Market Config)

**Plugin:** `@godaddy/gasket-plugin-atlas`

Provides brand and market configuration used by other plugins (visitor, uxp, intl). Typically requires no direct page-level code — configure in `gasket.ts` when needed.

---

## Localization (Intl + GoLF)

**Plugins:** `@gasket/plugin-intl`, `@gasket/react-intl`, `@godaddy/react-mintl`

### Config in `gasket.ts`

```ts
intl: {
  locales: ['en-US', 'fr-FR'],
  defaultLocale: 'en-US',
  managerFilename: 'intl.ts',
  nextRouting: false
}
```

### Translation files

`locales/en-US.json`, `locales/fr-FR.json` — key/value string pairs.

### In components

```tsx
import { FormattedMessage } from '@godaddy/react-mintl';

<h1><FormattedMessage id='gasket_welcome' /></h1>
```

### GoLF (professional translation)

`manifest.xml` declares handoff paths for the GoDaddy Localization Framework:

```xml
<Translation>
  <File HoPath="locales/en-US.json"
        HbPath="locales/{Culture}.json"
        Cultures="en-US, fr-FR, ..." />
</Translation>
```

GoLF handles translation workflows beyond local JSON editing.

### Resources

- Slack: `#golf`

---

## Security

**Plugin:** `@godaddy/gasket-plugin-security`

Provides Content Security Policy (CSP) headers and related security features. Works with the uxp plugin for CSP hash/nonce management on injected scripts.

Generally zero-config in the starter — customize when adding external scripts or styles.

---

## OpenTelemetry

**Plugins:** `@godaddy/gasket-plugin-otel`, `@godaddy/gasket-otel`  
**File:** `instrumentation.ts`

Production start preloads OTel:

```json
"start": "NODE_OPTIONS='--import @godaddy/gasket-otel/register' ... next start"
```

Service name from `OTEL_SERVICE_NAME` env var (Katana sets this in deployed environments).

---

## HTTPS / Dev Certificates

**Plugins:** `@godaddy/gasket-plugin-dev-certs`, `@godaddy/gasket-plugin-self-certs`, `@gasket/plugin-https-proxy`

Enable trusted HTTPS at https://local.gasket.dev-godaddy.com:8443 during development.

Requires VPN for certificate services.

---

## Optional Integrations (Not in Starter)

These are available as additional plugins when needed:

| System | Plugin |
|--------|--------|
| Switchboard (feature flags) | `@godaddy/gasket-plugin-switchboard` |
| GoCaaS (generative AI) | `@godaddy/gasket-plugin-gocaas` |
| Shared Header | `@godaddy/gasket-plugin-shared-header` |
| HCS (Header Content Service) | `@godaddy/gasket-plugin-hcs` |
| JWT generation | `@godaddy/gasket-plugin-jwt` |
| Server-side proxy | `@godaddy/gasket-plugin-proxy` |

Install, add to `plugins` in `gasket.ts`, configure, run `npm run docs` to see new actions.

---

## Integration Dependency Flow

```text
Request arrives
      │
      ▼
plugin-visitor ──► market, PLID, locale hints
      │
      ├──► plugin-auth ──► SSO context
      ├──► plugin-atlas ──► brand config
      ├──► plugin-uxp ──► header/footer + UXCore2
      ├──► plugin-traffic ──► analytics tags
      └──► plugin-intl ──► locale messages
```

Plugins consume visitor context rather than each re-detecting market independently.

---

## Takeaways

1. **Most integrations need no page-level code** — plugins wire them via `_document.ts` and `_app.tsx`.
2. **Use `gasket.actions` and lifecycle hooks** to customize, not reimplement platform clients.
3. **Update `presentationCentral.params.app`** when moving beyond the template name.
4. **Add new integrations by installing plugins** and registering them in `gasket.ts`.
5. **Keep service APIs separate** — Gasket webapp plugins are for the experience layer.

---

## Next chapter

Continue to [Chapter 8: Extending Your App](./08-extending-your-app.md).

## References

[1] System Integrations — `gasket-repo/docs/system-integrations.md`  
[2] Auth Guide — `gasket-repo/packages/gasket-plugin-auth/docs/authentication.md`  
[3] UXP White Labeling — `gasket-repo/packages/gasket-plugin-uxp/docs/white-labeling.md`  
[4] Gasket README (Plugins list) — `gasket-repo/README.md`
