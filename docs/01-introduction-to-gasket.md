# Chapter 1: Introduction to Gasket

## Chapter Overview

Gasket is GoDaddy's framework for building web applications. It is not a replacement for Next.js or React — it is the glue that wires Next.js to GoDaddy platform services (SSO, headers, analytics, localization, and more) through a plugin system.

This chapter explains **why Gasket exists** and **where your app sits** in GoDaddy's architecture.

---

## The Existing World

Before Gasket, every GoDaddy web team had to manually integrate the same concerns:

```text
Next.js app
  + wire SSO authentication by hand
  + fetch Presentation Central header/footer
  + detect visitor market and PLID
  + inject Traffic analytics tags
  + configure localization (GoLF)
  + set up HTTPS for local development
  + add OpenTelemetry for production observability
  + align with Katana deployment conventions
```

Each team solved these problems independently. Upgrades were painful. Behavior diverged across products.

---

## The Gap / Problem

As GoDaddy web apps grew, three pressures emerged:

1. **Repeated integration work** — every new app reimplemented the same platform wiring.
2. **Inconsistent user experience** — headers, auth flows, and analytics differed between products.
3. **Upgrade fragility** — bumping Next.js or SSO required touching many unrelated files.

What was needed: a **standard starting point** with **modular, upgradeable integrations**.

---

## The Concept: Gasket

Gasket is a **framework maker**. It provides:

- A **plugin system** for GoDaddy services
- A **central configuration file** (`gasket.ts`)
- **Presets** (curated plugin sets) and **templates** (scaffolded file structures)
- **Actions** and **lifecycles** for extending behavior without tight coupling

Your `aiusage-next` repo is a minimal instance of this — a Pages Router Next.js app with the standard GoDaddy webapp plugins pre-wired.

---

## Intuition

Think of Gasket as **webpack for GoDaddy integrations**:

```text
Your app code (pages, components)
        │
        ▼
   gasket.ts  ←── registers plugins
        │
        ├── plugin-auth      → SSO
        ├── plugin-uxp       → headers, UXCore2
        ├── plugin-visitor   → market/PLID detection
        ├── plugin-traffic   → analytics
        ├── plugin-intl      → localization
        └── plugin-nextjs    → Next.js config
```

You write pages. Plugins handle platform wiring. Gasket orchestrates both.

---

## Architecture Layers

GoDaddy separates **Customer Experience** apps from **Service Layer** APIs:

```text
┌─────────────────────────────────────────┐
│  Customer Experience Layer              │
│  Your Gasket + Next.js web app          │
│  (this repo: aiusage-next)              │
└─────────────────┬───────────────────────┘
                  │ HTTP calls (down only)
                  ▼
┌─────────────────────────────────────────┐
│  Service Layer                          │
│  Separate API apps                      │
│  (@godaddy/gasket-preset-api)           │
└─────────────────────────────────────────┘
```

**Rule:** dependencies flow **down**, never up. Your web app calls APIs. APIs should not call back into your web app's endpoints.

See `gasket-repo/docs/architecture-layers.md` for the full diagram.

---

## What Gasket Is Not

| Gasket is | Gasket is not |
|-----------|---------------|
| A plugin orchestrator for GoDaddy web apps | A UI component library (that's UXCore2) |
| A standardized Next.js starting point | A backend API framework (use gasket-preset-api) |
| A config + lifecycle system | A database ORM or state manager |

---

## Knowledge Boundaries

```text
Your pages/components
  │ know: React, UXCore2, business UI
  │ do NOT know: SSO token validation internals

gasket.ts
  │ know: which plugins, configuration values
  │ do NOT know: page UI, domain business rules

GoDaddy plugins (@godaddy/gasket-plugin-*)
  │ know: how to talk to SSO, Presentation Central, Traffic
  │ do NOT know: your app's pages or business rules
```

---

## Tradeoffs

| Benefit | Cost |
|---------|------|
| Fast, standardized app setup | Learning curve for plugin/lifecycle model |
| Consistent GoDaddy UX across products | Opinionated structure you must follow |
| Upgrade integrations via package bumps | Debugging spans multiple packages |

---

## Takeaways

1. Gasket solves **repeated GoDaddy integration work**, not general web development.
2. Your app is a **Customer Experience layer** web app built on Next.js.
3. **Plugins** own platform concerns; **your code** owns product UI and business logic.
4. Keep **service APIs separate** from this web app.

---

## References

[1] Gasket README — `gasket-repo/README.md`  
[2] Architecture Layers — `gasket-repo/docs/architecture-layers.md`  
[3] System Integrations — `gasket-repo/docs/system-integrations.md`  
[4] Gasket public docs — https://gasket.dev/
