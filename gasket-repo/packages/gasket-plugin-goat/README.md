# @godaddy/gasket-plugin-goat

Gasket plugin for AI-powered translation via the GOAT API (GoDaddy Automated Translations).

Exposes a single `getGoat` gasket action that returns a fully configured
[`@godaddy/goat`](https://github.com/gdcorp-uxp/goat/tree/main/packages/goat) SDK client.

## Installation

### New apps

```sh
gasket create <app-name> --plugins @godaddy/gasket-plugin-goat
```

### Existing apps

```sh
npm i @godaddy/gasket-plugin-goat @godaddy/goat
```

This plugin requires the following peer plugins at runtime:

- **@godaddy/gasket-plugin-jwt** — service-to-service auth (mints JWTs via IAM)
- **@godaddy/gasket-plugin-auth** — forward-auth path (forwards caller's Jomax token)

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginGoat from '@godaddy/gasket-plugin-goat';
+ import pluginJwt from '@godaddy/gasket-plugin-jwt';
+ import pluginAuth from '@godaddy/gasket-plugin-auth';

export default makeGasket({
  plugins: [
+   pluginJwt,
+   pluginAuth,
+   pluginGoat
  ]
});
```

## Configuration

| Name             | Description               | Type             | Required |
|------------------|---------------------------|------------------|----------|
| `goat.baseUrl`   | GOAT API base URL         | string           | Yes      |
| `goat.appId`     | Hub application id        | string \| number | Yes      |
| `goat.projectId` | Hub project id            | string \| number | Yes      |

The `configure` hook throws at boot if any of the three is missing.

| Environment | `baseUrl`                                    |
|-------------|----------------------------------------------|
| Prod        | `https://goat.api.int.godaddy.com`           |
| Test        | `https://goat.api.int.test-godaddy.com`      |
| Dev Private | `https://goat.api.int.dev-godaddy.com`       |

Tokens are environment-scoped: a prod-issued token gets a 401 from the test API and
vice versa, so `baseUrl` and the SSO environment behind `jwt.goat` must agree.

```js
// gasket.js
export default makeGasket({
  goat: {
    baseUrl: 'https://goat.api.int.godaddy.com',
    appId: 7774,
    projectId: 6554
  },
  auth: {
    appName: 'your-app-name'
  },
  jwt: {
    goat: {
      ssoHost: 'sso.godaddy.com'
    }
  }
});
```

## Authentication

The plugin supports two auth paths, chosen per-call by whether a request is passed:

- **Service (IAM)** — no request passed; mints a JWT from AWS IAM credentials via
  `@godaddy/gasket-plugin-jwt` using the `jwt.goat` config block.
- **Forward (employee)** — request passed; forwards the caller's Jomax token via
  `@godaddy/gasket-plugin-auth`.

Both emit `Authorization: sso-jwt <token>`. The forward path never falls back to the
service identity: passing an argument that is not request-shaped (a bare `Headers`,
a framework context object) throws on the first authenticated call rather than
quietly using the app's broader identity.

The consumer must configure a `jwt.goat` block in their gasket config (the plugin
uses the key name `'goat'` by convention):

```js
jwt: {
  goat: {
    ssoHost: 'sso.godaddy.com'  // IAM-based (no cert fields)
  }
}
```

The IAM ARN used by the app must be registered as a service identity against the
target application in GOAT. If it isn't, calls fail with
`No application access for identity <arn>` — distinct from a 401, which means the
token itself didn't validate (usually a wrong-environment token).

A service (`awsiam`) identity is granted per **application**. It can read the
application it is registered against, but sibling applications in the same project
return 404 on `applications.get`/`getConfig`, and the employee-only endpoints
(`identities.*`) return 403 — those require the forward-auth path.

## Actions

### getGoat

**Signature:** `gasket.actions.getGoat(req?)` → `GoatClient`

Returns a configured `@godaddy/goat` SDK client. When `req` is passed, the client
uses the caller's forwarded Jomax token; when omitted, it mints a service JWT via IAM.

## Usage

### Service-to-service calls

```js
const goat = gasket.actions.getGoat();

const result = await goat.translate({
  units: [{ key: 'greeting', text: 'Hello' }],
  targetLocales: ['es-MX', 'ja-JP'],
  sourceLocale: 'en-US',
  chunkSize: 30,                              // optional — auto-chunks large unit arrays
  model: 'gpt-5-mini',                        // optional
  translationMode: 'ai_only',                 // optional
  qualityThresholds: { mqm_score: 90 },       // optional
  doNotTranslate: [{ term: 'GoDaddy' }],      // optional
  translationInstructions: 'Use formal tone', // optional
  contentMode: 'marketing',                   // optional
  placeholderPatterns: ['\\{\\{.*?\\}\\}']    // optional
});
```

### Forwarding an employee's token

```js
const goat = gasket.actions.getGoat(req);

const { models } = await goat.models.list();
```

### Available client methods

The returned client exposes the full `@godaddy/goat` SDK surface — `translate()`,
`health()`, `me()`, and the `jobs`, `projects`, `applications`,
`applications.delivery`, `applications.phrase`, `glossary`, `providers`, `tm`,
`identities`, `models`, and `settings` namespaces.

See [EXAMPLES.md](./EXAMPLES.md) for every method mapped to its endpoint, plus
per-namespace usage, and the
[`@godaddy/goat` SDK README](https://github.com/gdcorp-uxp/goat/blob/main/packages/goat/README.md)
for full type definitions and options.

## Errors and logging

Failed calls throw from the SDK, not the plugin — import the error classes from
`@godaddy/goat` to classify them:

- `GoatApiError` — non-2xx response or network failure. Carries `status`, `code`,
  `appId`, `detail`, and the original `cause`.
- `GoatValidationError` — pre-flight input validation (missing `appId`, empty
  `units`, too many keys). Carries `field`, and throws before any HTTP call.

Every request is logged through `gasket.logger`: `debug` on dispatch and on any
response below 400 (with status and duration), `error` at 400 and above. A 304 from
an ETag-aware delivery read is a cache hit, so a polling consumer logs at `debug` in
its steady state. Query strings are stripped before logging, since they can carry
tokens or PII. Note that an expected 404 — such as a delivery read before the first
publish — still logs at `error` level.

## Types

All SDK types are re-exported from the plugin:

```ts
import type {
  GoatClient,
  TranslateOptions,
  TranslateResult,
  JobStatus,
  Model
} from '@godaddy/gasket-plugin-goat';
```
