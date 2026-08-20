# Chapter 10: Local HTTPS and Dev Certs

## Chapter Overview

Gasket apps run on **HTTPS locally**, not plain `http://localhost`. This chapter explains **why**, how that mirrors production, what `@godaddy/gasket-plugin-dev-certs` does, and why browsers sometimes show **"Your connection is not private"** (`NET::ERR_CERT_AUTHORITY_INVALID`).

If you have seen a green lock on `https://local.gasket.dev-godaddy.com:8443` in one project and a red **Not Secure** warning on `https://geni.dev-godaddy.com:5173` in another — this chapter explains the difference.

---

## The Existing World

Early web development was simple:

```text
Developer machine
      │
      ▼
http://localhost:3000
      │
      ▼
Your app (no encryption)
```

**HTTP** sends everything in plain text. For a todo app on your laptop, that was fine.

**localhost** became the default hostname because:

- It always resolves to your own machine (`127.0.0.1`)
- No DNS setup required
- No certificate needed
- Browsers treat it as a special, local-only case

For years, local dev meant HTTP + localhost. Production meant HTTPS + a real domain. Two different worlds — and that was acceptable because local dev did not need SSO cookies, third-party auth redirects, or strict browser security policies.

---

## The Gap / Problem

GoDaddy web apps integrate with platform services that assume **HTTPS and realistic hostnames**:

| Integration | Why HTTP localhost breaks |
|-------------|---------------------------|
| **SSO / Auth** | Cookies marked `Secure` are not sent over HTTP |
| **OAuth redirects** | Redirect URIs must match registered HTTPS URLs |
| **Presentation Central** | Headers/scripts expect production-like origins |
| **Visitor / PLID detection** | Hostname drives market and reseller context |
| **Browser security** | Modern browsers restrict mixed content and third-party cookies on insecure origins |

```text
http://localhost:8443
      │
      ├── SSO cookie rejected (Secure flag)
      ├── Auth redirect mismatch
      ├── Visitor plugin sees wrong host
      └── "Works on my machine" ≠ works in test/prod
```

Teams need local development that **behaves like production** for auth, cookies, and hostname-sensitive logic — without deploying on every code change.

---

## Requirements

Local development must provide:

1. **TLS encryption** (HTTPS) — same protocol as production
2. **Realistic hostnames** — e.g. `local.gasket.dev-godaddy.com`, not just `localhost`
3. **Trusted certificates** — browsers accept the connection without scary warnings
4. **Production parity** — same proxy pattern Katana can use in deployed environments

---

## The Concept: Dev Certs

**Dev certs** are TLS certificates issued for **development hostnames** (like `*.gasket.dev-godaddy.com`). They are:

- **Not** production certificates
- **Not** publicly trusted by default (unlike Let's Encrypt on godaddy.com)
- **Trusted inside GoDaddy's dev ecosystem** when installed correctly (VPN + plugin setup)

Gasket bundles this into two plugins:

| Plugin | Role |
|--------|------|
| `@godaddy/gasket-plugin-dev-certs` | Download/load GoDaddy dev certs for local `GASKET_ENV=local` |
| `@godaddy/gasket-plugin-self-certs` | Generate self-signed certs for containers / non-local envs |

Both apps in this stack (`aiusage-next`, `aiusage-api`) include both plugins in `gasket.ts`.

---

## Intuition

Think of HTTPS as a **verified envelope**:

```text
┌─────────────────────────────────────┐
│  TLS Certificate                    │
│  "I am local.gasket.dev-godaddy.com"│
│  Signed by: [Certificate Authority] │
└─────────────────────────────────────┘
         │
         ▼
   Browser checks:
   1. Is the cert for this hostname?
   2. Is the signer someone I trust?
   3. Is the cert still valid?
```

- **Production (Katana):** Real certs signed by a trusted CA. Browser trusts automatically.
- **Local (Gasket dev certs):** Dev certs signed by GoDaddy's **dev CA**. Browser trusts them **only if** that CA (or the cert chain) is installed/trusted on your machine — which `installDevCerts` handles during local startup.
- **Ad-hoc HTTPS (Vite, manual mkcert, etc.):** You generate a cert yourself. Browser shows **Not Secure** until **you** install trust — or you click through the warning.

---

## How HTTPS Works (Minimal Model)

You do not need to be a PKI expert. Four pieces matter:

| Piece | What it is |
|-------|------------|
| **Private key** | Secret file on the server. Never shared. |
| **Certificate (cert)** | Public file saying "this key belongs to hostname X," signed by a CA |
| **CA (Certificate Authority)** | Entity browsers trust by default (DigiCert, Let's Encrypt, or GoDaddy dev CA) |
| **Trust store** | List of trusted CAs built into your OS/browser |

When you visit `https://local.gasket.dev-godaddy.com:8443`:

```text
Browser                    Your Gasket app (port 8443)
   │                              │
   │────── TLS ClientHello ──────►│
   │◄───── cert + key proof ──────│
   │                              │
   │  Verify cert chain           │
   │  Match hostname (SNI)        │
   │                              │
   │────── encrypted HTTP ───────►│  (proxy → Next.js :3000)
```

**SNI (Server Name Indication):** The hostname in the URL must match the cert. A cert for `*.gasket.dev-godaddy.com` covers `local.gasket.dev-godaddy.com` but **not** `localhost` or `geni.dev-godaddy.com` (unless you have a cert for that name).

---

## How Gasket Local HTTPS Works

### Architecture in this stack

```text
Browser
  │
  ▼
https://local.gasket.dev-godaddy.com:8443
  │
  ▼
server.ts → gasket.actions.startProxyServer()
  │           (@gasket/plugin-https-proxy + dev certs)
  │           Terminates TLS using dev cert
  ▼
http://localhost:3000
  │
  ▼
Next.js (pages, API routes, SSR)
```

**Two processes, two ports:**

| Port | Protocol | Process | Purpose |
|------|----------|---------|---------|
| **8443** | HTTPS | Gasket proxy (`server.ts`) | What the browser hits |
| **3000** | HTTP | Next.js dev server | App code (no TLS here) |

The API app (`aiusage-api`) is simpler — one HTTPS server on **8444** via `@gasket/plugin-https` + dev certs.

### What happens on `npm run local`

```text
1. GASKET_ENV defaults to "local"
2. plugin-dev-certs prepare hook runs → installDevCerts()
3. Certs downloaded/checked in .certs/ (may prompt for Jomax login)
4. HTTPS proxy starts with cert for *.gasket.dev-godaddy.com
5. Next.js starts on :3000 (plain HTTP, internal only)
```

Relevant plugins in `aiusage-next/gasket.ts`:

```ts
import pluginDevCerts from '@godaddy/gasket-plugin-dev-certs';
import pluginSelfCerts from '@godaddy/gasket-plugin-self-certs';
import pluginHttpsProxy from '@gasket/plugin-https-proxy';

// httpsProxy.port: 8443, target: localhost:3000
```

### Hostname resolution — `/etc/hosts`

`local.gasket.dev-godaddy.com` must resolve to your machine. On VPN, GoDaddy DNS may handle this. Off VPN, add to `/etc/hosts` [1]:

```bash
127.0.0.1  local.gasket.dev-godaddy.com
127.0.0.1  local.gasket.dev-secureserver.net
127.0.0.1  local.gasket.dev-gdcorp.tools
```

Without this, the hostname does not reach your app at all — a different failure from cert errors.

---

## Local vs Production

| | **Local (`GASKET_ENV=local`)** | **Production (Katana)** |
|---|---|---|
| **Certs** | `@godaddy/gasket-plugin-dev-certs` | Infrastructure-managed TLS (ACM, ingress, etc.) |
| **Hostname** | `local.gasket.dev-godaddy.com` | Real service URL |
| **Trust** | Dev CA via `installDevCerts` | Public/internal CA trusted by browsers |
| **Proxy pattern** | `startProxyServer()` → Next :3000 | Same pattern possible on Katana |
| **Next.js internal** | HTTP on :3000 | HTTP or internal network |
| **self-certs plugin** | Disabled for `local` (dev-certs used instead) | May generate self-signed for containers |

**What you are simulating locally:**

- HTTPS termination at the edge (proxy)
- Realistic hostname for SSO, visitor, cookies
- TLS between browser and your app

**What you are not simulating:**

- Katana load balancers, auto-scaling, internal service mesh
- Production certificate rotation and ACM lifecycle

The goal is **behavioral parity** for auth and platform integrations — not identical infrastructure.

---

## Pre-packaged Gasket Dev Cert Domains

From `@godaddy/gasket-plugin-dev-certs` [2], these wildcard certs ship with SNI support enabled by default:

| Cert Common Name | SNI default |
|------------------|-------------|
| `*.gasket.dev-godaddy.com` | Yes |
| `*.gasket.dev-secureserver.net` | Yes |
| `*.gasket.dev-gdcorp.tools` | Yes |
| `*.gasket.int.dev-gdcorp.tools` | Yes |

Your starter URL `https://local.gasket.dev-godaddy.com:8443` matches `*.gasket.dev-godaddy.com`.

Custom domains (e.g. `geni.dev-godaddy.com`) require either:

- Adding the common name to `devCerts.commonNames` in `gasket.ts` and running `installDevCerts`, or
- Your own cert/trust setup (mkcert, corporate CA, etc.)

---

## "Your Connection Is Not Private" — What It Means

The screenshot error **`NET::ERR_CERT_AUTHORITY_INVALID`** means:

> The browser received a TLS certificate, but **does not trust the Certificate Authority** that signed it.

The browser is **not** saying your app is broken. It is saying:

```text
"I got a cert, but I don't know who signed it — so I won't trust this connection."
```

### The trust checklist

For HTTPS to show a **lock icon** (no warning), all of these must be true:

| # | Requirement | If missing |
|---|-------------|------------|
| 1 | Server presents a certificate | Connection fails entirely |
| 2 | Cert covers the hostname (CN/SAN) | `NET::ERR_CERT_COMMON_NAME_INVALID` |
| 3 | Cert is not expired | `NET::ERR_CERT_DATE_INVALID` |
| 4 | **Cert chain leads to a trusted CA** | **`NET::ERR_CERT_AUTHORITY_INVALID`** |
| 5 | Hostname resolves correctly | DNS / hosts error, connection refused |

When you see **Not Secure**, you are usually failing **#3 or #4** — most often **#4** in local dev.

### Gasket app working vs random HTTPS app failing

```text
✅ https://local.gasket.dev-godaddy.com:8443  (Gasket + dev-certs + VPN)
   → installDevCerts ran
   → cert for *.gasket.dev-godaddy.com
   → dev CA trusted on your machine

❌ https://geni.dev-godaddy.com:5173  (e.g. Vite, no dev-certs setup)
   → server may use self-signed or ad-hoc cert
   → browser does not trust the signer
   → NET::ERR_CERT_AUTHORITY_INVALID
```

Nothing is "wrong" with port 5173 or HTTPS itself — **trust was never established** for that cert.

### What you are not setting (common causes)

| Missing piece | Symptom |
|---------------|---------|
| **VPN off** during `installDevCerts` | Certs not downloaded; fallback or stale certs |
| **Never ran `npm run local`** (prepare hook) | Certs not installed |
| **Wrong hostname** (`localhost` vs `local.gasket.dev-godaddy.com`) | TLS handshake fails or name mismatch |
| **No `/etc/hosts` entry** (off VPN) | Cannot reach host at all |
| **Custom domain without dev cert** | Authority invalid for that hostname |
| **Non-Gasket server** (Vite, raw Node) without cert setup | Self-signed cert, browser untrusted |
| **Expired dev cert** | Date invalid; re-run installDevCerts |

### Advanced → Proceed anyway?

Browsers let you bypass the warning ("Advanced" → proceed). That is fine for **your own** local debugging. Never train users or production flows to bypass cert warnings.

For **server-to-server** calls (like `fetchFromApi` in Chapter 9), Node does not have a "click Advanced" option — you must use the correct hostname, trust the CA, or use a dev-only `rejectUnauthorized: false` workaround.

---

## Real-World Example: This Stack

### Web app — trusted local URL

```text
https://local.gasket.dev-godaddy.com:8443/usage
```

- Gasket proxy on 8443 with dev cert
- SSR calls API via `fetchFromApi`

### API app — trusted local URL

```text
https://local.gasket.dev-godaddy.com:8444/usage
```

- Express HTTPS on 8444 with dev cert

### The localhost mistake (Chapter 9)

`.env` originally had:

```bash
API_SERVICE_URL=https://localhost:8444   # ❌
```

Fixed to:

```bash
API_SERVICE_URL=https://local.gasket.dev-godaddy.com:8444   # ✅
```

The API **was running**, but Node's TLS handshake to `localhost` failed because the cert is issued for `*.gasket.dev-godaddy.com`, not `localhost`. The browser worked when you opened the API URL directly with the correct hostname — server-side fetch did not.

---

## Code Example: Dev Cert Actions

From `@godaddy/gasket-plugin-dev-certs` [2] — typically automatic, but available as actions:

```js
// Download/check all configured dev certs (runs on prepare in local env)
await gasket.actions.installDevCerts();

// Get cert + key for a specific common name
const { cert, key } = await gasket.actions.getDevCert('*.gasket.dev-godaddy.com');
```

Custom domains in `gasket.ts`:

```ts
export default makeGasket({
  env: gdEnv(),
  environments: {
    local: {
      devCerts: {
        path: '.certs',
        commonNames: [
          '*.gasket.dev-godaddy.com',
          '*.my-feature.dev-godaddy.com'  // requires download + VPN
        ],
        sniNames: [
          '*.gasket.dev-godaddy.com',
          '*.my-feature.dev-godaddy.com'
        ]
      }
    }
  }
});
```

---

## `@godaddy/gasket-plugin-self-certs` — When Is It Used?

Self-certs **generate** a certificate on the fly (typically for `localhost`). From the plugin README [3]:

- Used for **containerized / non-local** environments where dev-certs do not apply
- **Disabled for `local`** in Gasket starters — dev-certs takes over
- Can be configured with a custom common name if needed

```text
local env        → dev-certs (downloaded, GoDaddy-managed)
test/prod container → self-certs (generated, infrastructure trust)
```

---

## Knowledge Boundaries

```text
Browser
  │ knows: TLS, cookies, hostname, trust store
  │ does NOT know: your Next.js code

HTTPS proxy (server.ts)
  │ knows: dev cert, port 8443, forward to :3000
  │ does NOT know: business logic

plugin-dev-certs
  │ knows: download, cache, SNI cert selection
  │ does NOT know: your routes or pages

Next.js (:3000)
  │ knows: React, SSR, pages
  │ does NOT know: TLS (plain HTTP internally)

Your app code (fetchFromApi)
  │ knows: call API at apiServiceUrl
  │ must use: hostname that matches API's cert
```

---

## Common Mistakes

### Using `http://` for a Gasket web app

```text
Bad:  http://local.gasket.dev-godaddy.com:8443
Good: https://local.gasket.dev-godaddy.com:8443
```

SSO and platform cookies expect HTTPS.

### Using `localhost` with Gasket dev certs

```text
Bad:  https://localhost:8443
Good: https://local.gasket.dev-godaddy.com:8443
```

Cert is wildcard for `*.gasket.dev-godaddy.com`, not localhost.

### Expecting Vite/non-Gasket HTTPS to work like Gasket

```text
Bad:  assume https://geni.dev-godaddy.com:5173 is trusted automatically
Good: set up dev-certs, mkcert, or corporate CA trust for that hostname
```

Gasket's `installDevCerts` only runs for Gasket apps with the plugin configured.

### Committing `.certs/` or private keys

```text
Bad:  git add .certs/
Good: .certs/ in .gitignore; certs are machine-local
```

### Using dev-certs in production

```text
Bad:  plugin-dev-certs in Katana production deploy
Good: infrastructure TLS; dev-certs plugin is local-only by design [2]
```

---

## Tradeoffs

| Benefit | Cost |
|---------|------|
| Production-like auth and cookies locally | VPN + cert setup required |
| Consistent hostname behavior (visitor, PLID) | Must use dev hostnames, not localhost |
| HTTPS proxy matches deploy pattern | Two processes in dev (proxy + Next) |
| Pre-packaged certs for Gasket domains | Custom domains need extra config |
| Platform integrations work locally | Steeper onboarding than `http://localhost:3000` |

---

## When to Use Dev Certs

- Any GoDaddy Gasket web or API app using SSO, visitor, or platform cookies
- When you need `local.gasket.*` hostnames for market/PLID testing
- When debugging HTTPS-only bugs before deploying to test

## When NOT to Use Dev Certs

- Production deployments (use Katana/infrastructure TLS)
- Pure frontend prototypes with no GoDaddy integrations (plain Vite may suffice — with your own cert strategy)
- Scripts and CLI tools that do not serve browser traffic

---

## Debugging Checklist

```text
□ VPN connected
□ npm run local started (installDevCerts runs on prepare)
□ /etc/hosts has local.gasket.dev-godaddy.com → 127.0.0.1 (if off VPN)
□ Browser URL uses https:// (not http://)
□ Browser URL uses local.gasket.dev-godaddy.com (not localhost)
□ Correct port (8443 web, 8444 API)
□ API_SERVICE_URL uses same hostname as browser
□ For custom domains: common name added to devCerts config
```

See also `gasket-repo/docs/debugging.md` [1].

---

## Takeaways

1. **Localhost + HTTP was enough for simple apps.** GoDaddy platform integrations require **HTTPS + realistic hostnames**.
2. **Dev certs** are GoDaddy-managed TLS certificates for `*.gasket.dev-godaddy.com` (and related domains), installed by `@godaddy/gasket-plugin-dev-certs`.
3. **Gasket local dev uses an HTTPS proxy** (8443) in front of plain HTTP Next.js (3000) — similar to production edge termination.
4. **"Not Secure" / `NET::ERR_CERT_AUTHORITY_INVALID`** means the browser does not trust the cert's signer — not that HTTPS is broken.
5. **Gasket apps vs other tools** (Vite on :5173) — trust is only automatic when dev certs (or another trusted CA setup) is configured for that hostname.
6. **Use `local.gasket.dev-godaddy.com` everywhere** — browser, `.env`, and server-side fetch must agree on hostname.
7. **Production uses real infrastructure TLS** — dev-certs never ship to Katana.

---

## References

[1] Gasket Debugging — `gasket-repo/docs/debugging.md`  
[2] `@godaddy/gasket-plugin-dev-certs` — `gasket-repo/packages/gasket-plugin-dev-certs/README.md`  
[3] `@godaddy/gasket-plugin-self-certs` — `gasket-repo/packages/gasket-plugin-self-certs/README.md`  
[4] Chapter 5: Runtime and Dev Workflow — `./05-runtime-and-dev-workflow.md`  
[5] Chapter 9: Web + API Full Stack — `./09-web-and-api-full-stack.md`  
[6] RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3 — https://www.rfc-editor.org/rfc/rfc8446  
[7] MDN — HTTPS — https://developer.mozilla.org/en-US/docs/Glossary/HTTPS
