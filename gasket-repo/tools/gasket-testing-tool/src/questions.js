// ===== Open Source Preset Apps =====
const OS_APP_TYPES = [
  { title: '── Open Source: Next.js Presets ──────────', value: 'separator-os-nextjs', disabled: true },
  { title: 'App Router', value: 'app-router' },
  { title: 'App Router w/Proxy', value: 'app-router-proxy' },
  { title: 'App Router w/TypeScript', value: 'app-router-ts' },
  { title: 'App Router w/TypeScript & Proxy', value: 'app-router-ts-proxy' },
  { title: 'Page Router', value: 'page-router' },
  { title: 'Page Router w/Proxy', value: 'page-router-proxy' },
  { title: 'Page Router w/TypeScript', value: 'page-router-ts' },
  { title: 'Page Router w/TypeScript & Proxy', value: 'page-router-ts-proxy' },
  { title: 'Page Router w/Express', value: 'page-router-express' },
  { title: 'Page Router w/Express & TypeScript', value: 'page-router-express-ts' },

  { title: '── Open Source: API Presets ────────────', value: 'separator-os-api', disabled: true },
  { title: 'Express API', value: 'express' },
  { title: 'Express API w/TypeScript', value: 'express-ts' },
  { title: 'Fastify API', value: 'fastify' },
  { title: 'Fastify API w/TypeScript', value: 'fastify-ts' }
];

// ===== Internal Preset Apps =====
const INTERNAL_APP_TYPES = [
  { title: '── Internal: Webapp Presets ─────────────', value: 'separator-internal-webapp', disabled: true },
  { title: 'Webapp: App Router', value: 'webapp-app-router' },
  { title: 'Webapp: App Router w/TypeScript', value: 'webapp-app-router-ts' },
  { title: 'Webapp: Page Router', value: 'webapp-page-router' },
  { title: 'Webapp: Page Router w/TypeScript', value: 'webapp-page-router-ts' },
  { title: 'Webapp: Page Router w/Express', value: 'webapp-page-router-express' },
  { title: 'Webapp: Page Router w/Express & TypeScript', value: 'webapp-page-router-express-ts' },

  { title: '── Internal: API Presets ────────────────', value: 'separator-internal-api', disabled: true },
  { title: 'Internal: API w/Express', value: 'internal-express' },
  { title: 'Internal: API w/Express & TypeScript', value: 'internal-express-ts' },
  { title: 'Internal: HCS w/Express', value: 'hcs-express' }
];

// ===== Open Source Templates =====
const OS_TEMPLATE_APP_TYPES = [
  { title: '── Open Source: Templates ───────────────', value: 'separator-os-templates', disabled: true },
  { title: 'Template: Next.js App Router', value: 'os-template-nextjs-app' },
  { title: 'Template: Next.js Pages Router', value: 'os-template-nextjs-pages' },
  { title: 'Template: Next.js Pages w/Express', value: 'os-template-nextjs-express' },
  { title: 'Template: API Express', value: 'os-template-api-express' },
  { title: 'Template: API Fastify', value: 'os-template-api-fastify' }
];

// ===== Internal Templates =====
const INTERNAL_TEMPLATE_APP_TYPES = [
  { title: '── Internal: Templates ──────────────────', value: 'separator-internal-templates', disabled: true },
  { title: 'Template: Webapp App Router', value: 'template-webapp-app' },
  { title: 'Template: Webapp Pages Router', value: 'template-webapp-pages' },
  { title: 'Template: Webapp Express', value: 'template-webapp-express' },
  { title: 'Template: API Express', value: 'template-api-express' },
  { title: 'Template: API Fastify', value: 'template-api-fastify' },
  { title: 'Template: HCS', value: 'template-hcs' }
];

// ===== Batch Operations =====
const BATCH_OPERATIONS = [
  { title: '── Batch Operations ─────────────────────', value: 'separator-batch', disabled: true },
  { title: 'Run ALL app types', value: 'all' },
  { title: 'Run all presets', value: 'all-presets' },
  { title: 'Run all templates', value: 'all-templates' },
  { title: '├─ OS presets only', value: 'all-os' },
  { title: '├─ OS templates only', value: 'all-os-templates' },
  { title: '├─ Internal presets only', value: 'all-internal' },
  { title: '└─ Internal templates only', value: 'all-internal-templates' }
];

const localPackage = {
  type: 'confirm',
  name: 'useLocalPackage',
  message: 'Would you like to use local packages?',
  initial: true
};

export const questions = [
  !process.env.USE_LOCAL && process.env.SKIP_CREATE !== '1' ? localPackage : {},
  {
    type: 'select',
    name: 'appType',
    message: 'What would you like to test?',
    choices: [
      ...OS_APP_TYPES,
      ...INTERNAL_APP_TYPES,
      ...OS_TEMPLATE_APP_TYPES,
      ...INTERNAL_TEMPLATE_APP_TYPES,
      ...BATCH_OPERATIONS
    ],
    hint: 'Use arrow keys to navigate, Enter to select'
  }
];

export default questions;
