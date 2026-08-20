import path from 'path';
import { createRequire } from 'module';
import semver from 'semver';

// eslint-disable-next-line no-process-env
const processEnv = process.env;

/**
 * Resolve the consuming app's React major version from the application root.
 * Defaults to 18 when react cannot be resolved (safe for legacy UMD vendors).
 * @param {string} [root] - Gasket application root directory
 * @returns {number} React major version, or 18 when react cannot be resolved
 */
export function getReactMajorVersion(root) {
  if (!root) {
    return 18;
  }

  const appRequire = createRequire(path.join(root, 'package.json'));

  try {
    const { version } = appRequire('react/package.json');
    return semver.major(version);
  } catch {
    return 18;
  }
}

/**
 * Apply configuration changes prior to local/start events.
 * @type {import('@gasket/core').HookHandler<'configure'>}
 */
export default function configure(gasket, config) {
  //
  // Default to opting out of Next.js telemetry for GoDaddy apps
  // @see: https://nextjs.org/telemetry
  if (!('NEXT_TELEMETRY_DISABLED' in processEnv)) {
    processEnv.NEXT_TELEMETRY_DISABLED = '1';
  }

  const reactMajor = getReactMajorVersion(config.root);

  config.uxp = {
    ...config.uxp,
    externalizeJsxRuntime: reactMajor >= 19
  };

  if (config.uxp?.features?.['header-experiment-beta']) {
    const hivemindLabels = [
      ...(config.switchboard?.appLabels?.['@hivemind'] ?? []),
      ...(config.uxp?.hivemindLabels ?? [])
    ];
    if (hivemindLabels.length) {
      config.switchboard = {
        ...config.switchboard,
        appLabels: {
          ...(config.switchboard?.appLabels ?? {}),
          '@hivemind': hivemindLabels
        }
      };
    }
  }

  return config;
}
