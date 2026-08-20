import path from 'node:path';
import lodash from 'lodash';
const { pick } = lodash;
import type { Gasket } from '@gasket/core';
import type { GasketConfig } from '@gasket/core';
import type { ClientOptions } from '@switchboard/client';
import type { SwitchboardConfig, SwitchboardOAuthAuthOptions } from '../types.js';

type DataRetrievalOptions = ClientOptions['dataRetrieval'];

/**
 * Type guard for the OAuth Bearer auth modes, which are discriminated by a
 * `type` field prefixed with `oauth_`. The legacy SSO/IAM/cert auth modes do
 * not carry a `type`.
 */
function isOAuthAuth(
  auth: NonNullable<SwitchboardConfig['auth']>
): auth is SwitchboardOAuthAuthOptions {
  return 'type' in auth
    && typeof auth.type === 'string'
    && auth.type.startsWith('oauth_');
}

// These are restricted in that they do not allow retrieval of all settings.
// You must specify a list of settings or labels.
const restrictedApps = new Set(['hivemind']);

// Cache for getClientOptions per Gasket symbol
const clientOptionsCache = new Map<symbol, ClientOptions>();

/**
 * Get the client options for a Gasket instance.
 */
export function getClientOptions(config: GasketConfig): ClientOptions {
  const sbConfig = config.switchboard ?? {};
  return {
    alias: sbConfig.alias ?? 'gasket',
    callingService: normalizeCallingService(config),
    env: normalizeEnv(config),
    auth: normalizeAuth(config),
    dataRetrieval: buildDataRetrieval(config),
    reuseExisting: true,
    ...pick(
      sbConfig,
      [
        'cacheRefreshMs', 'envSettings', 'eventBus', 'fallbackFileCache',
        'handlers', 'useInternalApis'
      ]
    )
  };
}

/**
 * Get cached client options for a Gasket instance.
 * This caches the result per Gasket instance to avoid recomputing the normalized config.
 */
export function getCachedClientOptions(gasket: Gasket): ClientOptions {
  if (!clientOptionsCache.has(gasket.symbol)) {
    const options = getClientOptions(gasket.config);
    clientOptionsCache.set(gasket.symbol, options);
  }
  return clientOptionsCache.get(gasket.symbol)!;
}

/**
 * Normalizes the environment setting for switchboard.
 */
function normalizeEnv(config: GasketConfig): SwitchboardConfig['env'] {
  const env = config.switchboard?.env ?? config.env;
  switch (env) {
    case 'local':
    case 'dev':
    case 'development':
      return 'development';
    case 'test':
      return 'test';
    case 'prod':
    case 'production':
      return 'production';
    case 'manual':
      return 'manual';
    default:
      throw new Error('Invalid environment set for switchboard. Set a valid switchboard.env in your gasket.config.js');
  }
}

/**
 * Resolves relative cert/key file paths against the Gasket root. `certPath` may
 * be a single path or an array of paths.
 */
function resolveCertPaths(config: GasketConfig, certPath: string | string[], keyPath: string) {
  const certPaths = Array.isArray(certPath) ? certPath : [certPath];
  return {
    certPath: certPaths.map((filePath: string) => path.resolve(config.root, filePath)),
    keyPath: path.resolve(config.root, keyPath)
  };
}

/**
 * Removes null/undefined-valued properties. Gasket's environment deep-merge can
 * leave explicit nulls behind to cancel inherited fields, and
 * `@switchboard/client` rejects null-valued auth properties.
 */
function stripNullish<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v != null)
  ) as T;
}

/**
 * Normalizes an OAuth Bearer auth config. The `type` and OAuth-specific fields
 * are preserved, but null/undefined fields (which can appear via env
 * deep-merge) are stripped so they don't reach `@switchboard/client`. For
 * `oauth_cert_path_exchange`, relative cert/key file paths are resolved to
 * absolute paths — only when both are present, so a partial config surfaces a
 * client validation error rather than a `path.resolve` throw.
 */
function normalizeOAuthAuth(
  config: GasketConfig,
  auth: SwitchboardOAuthAuthOptions
): SwitchboardOAuthAuthOptions {
  const sanitized = stripNullish(auth);
  if (sanitized.type === 'oauth_cert_path_exchange' && sanitized.certPath && sanitized.keyPath) {
    return { ...sanitized, ...resolveCertPaths(config, sanitized.certPath, sanitized.keyPath) };
  }
  return sanitized;
}

/**
 * Normalizes the authentication configuration for switchboard.
 *
 * Because gasket deep merges environments, and because the `local` environment
 * inherits from `development`, we can get common scenarios where `development`
 * uses iam auth but `local` uses cert files. Similarly, we may use secrets for
 * certs in `development` and files for local. Setting `null` properties does
 * not pass `@switchboard/client` validation either. To work around that, we:
 * 1. For OAuth modes (`type: oauth_…`): all null/undefined fields are stripped
 *    via `stripNullish` before the config reaches `@switchboard/client`, since
 *    env deep-merge can leave explicit nulls on any of their many optional fields.
 * 2. For legacy SSO/cert/IAM modes: each branch selectively returns only the
 *    fields relevant to that mode, which naturally excludes cross-mode nulls.
 *    The selected fields (cert, key, primaryRegion, secondaryRegion) are passed
 *    as-is; if they are null, `@switchboard/client` will surface a validation
 *    error (set them explicitly in the environment config to avoid this).
 * 3. If multiple legacy auth types are present, prefer paths over certs over
 *    IAM. This makes assumptions about typical environment overriding scenarios,
 *    but the explicit null option is there if these guesses are invalid.
 * 4. Throw if nothing "reasonable" can be guessed at.
 */
function normalizeAuth(config: GasketConfig): SwitchboardConfig['auth'] {
  const currentAuth = config?.switchboard?.auth;
  if (!currentAuth) {
    return currentAuth;
  }

  if (isOAuthAuth(currentAuth)) {
    return normalizeOAuthAuth(config, currentAuth);
  }

  if ('certPath' in currentAuth && currentAuth.certPath) {
    return resolveCertPaths(config, currentAuth.certPath, currentAuth.keyPath);
  }

  if ('cert' in currentAuth && currentAuth.cert) {
    return { cert: currentAuth.cert, key: currentAuth.key };
  }

  if ('primaryRegion' in currentAuth && currentAuth.primaryRegion) {
    return {
      primaryRegion: currentAuth.primaryRegion,
      secondaryRegion: currentAuth.secondaryRegion
    };
  }

  throw new Error('Invalid `switchboard.auth` configuration.');
}

/**
 * Normalizes the calling service for switchboard.
 */
function normalizeCallingService(config: GasketConfig): string {
  return (
    config.switchboard?.callingService
    // `presentationCentral` is contributed to the Gasket config by
    // @godaddy/gasket-plugin-uxp, which needs to depend on this package. To
    // avoid a circular dependency we don't reference its types here; instead we
    // read the one field we need via a narrow structural cast.
    ?? (config as { presentationCentral?: { params?: { app?: string } } })
      .presentationCentral?.params?.app
    ?? config.hostname
    ?? 'gasket'
  );
}

/**
 * Builds the data retrieval configuration for switchboard.
 */
function buildDataRetrieval(config: GasketConfig) {
  const dataRetrieval: DataRetrievalOptions = config.switchboard?.dataRetrieval ?? {};

  mergeInAppList(config, dataRetrieval);
  mergeInSettingsLists(config, dataRetrieval);
  mergeInLabels(config, dataRetrieval);

  for (const [fqAppId, { settings, labels }] of Object.entries(dataRetrieval)) {
    if (restrictedApps.has(fqAppId) && !settings?.length && !labels?.length) {
      throw new Error(`The ${fqAppId} switchboard app requires that settings or labels are provided`);
    }
  }

  return dataRetrieval;
}

/**
 * Merges in the list of apps from the config into the data retrieval options.
 */
function mergeInAppList(
  config: GasketConfig,
  dataRetrieval: DataRetrievalOptions
) {
  const apps = config.switchboard?.apps ?? [];
  if (config.switchboard?.app) {
    apps.push(config.switchboard.app);
  }

  apps.forEach((id: string) => {
    dataRetrieval[simpleToFqAppId(id)] ??= {};
  });
}

/**
 * Merges in the settings lists from the config into the data retrieval options.
 */
function mergeInSettingsLists(
  config: GasketConfig,
  dataRetrieval: DataRetrievalOptions
) {
  for (const [id, settings] of Object.entries(config.switchboard?.appSettings ?? {})) {
    const fqAppId = simpleToFqAppId(id);
    dataRetrieval[fqAppId] ??= {};
    dataRetrieval[fqAppId].settings = (dataRetrieval[fqAppId].settings ?? [])
      .concat(settings as string[]);
  }
}

/**
 * Merges in the labels from the config into the data retrieval options.
 */
function mergeInLabels(config: GasketConfig, dataRetrieval: DataRetrievalOptions) {
  for (const [id, labels] of Object.entries(config.switchboard?.appLabels ?? {})) {
    const fqAppId = simpleToFqAppId(id);
    dataRetrieval[fqAppId] ??= {};
    dataRetrieval[fqAppId].labels = (dataRetrieval[fqAppId].labels ?? [])
      .concat(labels as string[]);
  }
}

/**
 * Converts a simple app ID to a fully qualified app ID.
 */
function simpleToFqAppId(id: string): string {
  if (id.includes('|')) {
    return id;
  }

  if (id.startsWith('@')) {
    return id.substring(1);
  }

  return `default|${id}`;
}
