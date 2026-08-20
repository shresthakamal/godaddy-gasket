import parse from 'url-parse';
import querystring from 'querystring';
import transformUrl from 'transform-url';

const requestParamKeys = [
  'realm',
  'risk',
  'type',
  'groups',
  'allowHeartbeat',
  'use12HourExpiration'
];

const ssoParamKeys = [
  'realm',
  'port',
  'app',
  'path',
  'subdomain',
  'auth_reason'
];

export const isBrowser = typeof window !== 'undefined';

/**
 * @type {import('.').AuthStatus} AuthStatus
 * @readonly
 */
export const AuthStatus = {
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error'
};

/**
 * Enum for authentication realms
 * @readonly
 */
export const AuthRealm = {
  idp: 'idp',
  idpInt: 'idp_int',
  idp_int: 'idp_int',
  jomax: 'jomax',
  pass: 'pass',
  cert: 'cert',
  awsiam: 'awsiam'
};

/**
 * Enum for authentication risk levels
 * @readonly
 */
export const AuthRisk = {
  low: 'low',
  medium: 'medium',
  high: 'high'
};

const reHostStgOte =
  /.*(stg-|ote-)(godaddy\.com|secureserver\.net|gdcorp\.tools)/;
const reProdUrl =
  /https:\/\/(sso\.godaddy\.com|sso\.secureserver\.net|sso\.gdcorp\.tools)/;
const reCommonBase = /\..*(godaddy\.com|secureserver\.net)/;
const reManifestLoginUrl = /"sso".*"login":{"href":"([^"]+)"/;
// is this a sso app url which allows query params
export const reTransformableUrl =
  /(.*godaddy\.com\/offers\/.*\/sso|(\/\/(sso(\.[\w-]+){2}))|((sso\.)?.*afternic\.com(\/login)?))/;
// capture the base domain from host, allowing region 2-letter regions (i.e.
// co.uk), ignoring port
export const reBaseDomain =
  /(?:(?<sub>[\w\-.]+)\.)?(?<base>[\w-]{3,}\.\w{2,}(?:\.\w{2})?)(?::(?<port>\d+))?$/;

/**
 * Pick from keys
 * @type {import('./internal').pickFromKeys}
 */
export function pickFromKeys(props, keys) {
  return Object.keys(props)
    .filter((k) => keys.indexOf(k) > -1 && typeof props[k] !== 'undefined')
    .reduce((acc, cur) => {
      acc[cur] = props[cur];

      return acc;
    }, {});
}

/**
 * Pick out params used from request from props
 * @type {import('./internal').paramsFromProps}
 */
export function paramsFromProps(props = {}) {
  return pickFromKeys(props, requestParamKeys);
}

/**
 * Get a lookup key based on auth params
 * @type {import('./internal').getAuthKey}
 */
export function getAuthKey(authProps) {
  return (
    transformUrl('', paramsFromProps(authProps)).substring(1) || '__default__'
  );
}

/**
 * Get the URL to the check auth endpoint
 * @type {import('./internal').getAuthCheckUrl}
 */
export function getAuthCheckUrl(authParams, gasketData = {}) {
  const { plid } = gasketData.visitor || {};
  const { basePath = gasketData.basePath || '' } = gasketData.auth || {};
  const url = `${basePath}/api/auth/validate`;

  return transformUrl(url, {
    ...paramsFromProps(authParams),
    ...((plid && { plid }) || {})
  });
}

/**
 * Find additional sso redirect params from host
 * @type {import('./internal').getParamsFromHost}
 */
export function getParamsFromHost(host, subdomain) {
  const params = {};

  const match = host?.match(reBaseDomain);

  if (!match) {
    return params;
  }

  const { sub, port } = match.groups;

  if (sub?.includes('local.gasket')) {
    params.app = 'local.gasket';
  } else if (typeof subdomain === 'function') {
    const value = subdomain(host);

    if (value) params.subdomain = value;
  } else if (subdomain !== false) {
    // If not explicitly set to false override app if multiple 2+ subdomains
    // passed in host URL. e.g. t123.wsbd.godaddy.com
    if (sub?.includes('.')) {
      params.subdomain = sub;
    }
  }

  if (port) {
    params.port = port;
  }

  return params;
}

/**
 * Build the SSO login URL
 * @type {import('./internal').transformLoginUrl}
 */
export function transformLoginUrl(ssoUrl, params) {
  if (!params || !reTransformableUrl.test(ssoUrl)) {
    return ssoUrl;
  }

  const parsed = parse(ssoUrl, true);
  const baseUrl = ssoUrl.split('?')[0];
  const query = { ...parsed.query, ...pickFromKeys(params, ssoParamKeys) };
  const queryStr = querystring.stringify(query);

  return `${baseUrl}?${queryStr}`;
}

/**
 * Redirect to SSO login
 * @type {import('./internal').redirectTo}
 */
export function redirectTo(ssoUrl) {
  // eslint-disable-next-line no-console
  console.info('SSO Redirect:', ssoUrl);
  window.open(ssoUrl, '_self');
}

/**
 * Parse the SSO Login Url from PresentationCentral globals data (v2) or select
 * from shared props (v3)
 * @type {import('./internal').parseLoginUrl}
 */
export function parseLoginUrl(pcData) {
  const { globals } = pcData || {};

  // -- handle Presentation Central v3 manifest
  if (!globals) {
    return pcData?.config?.props?.shared?.urls?.sso?.login?.href ?? null;
  }

  const match = reManifestLoginUrl.exec(globals);

  if (match && match.length >= 2) {
    return match[1];
  }

  // eslint-disable-next-line no-console
  console.error('SSO Login URL not found in PresentationCentral globals.');

  return null;
}

/**
 * If hostname is other than godaddy.com or secureserver.net, fixup the sso
 * login url using hostname
 * @type {import('./internal').fixupLoginUrlDomain}
 */
export function fixupLoginUrlDomain(ssoUrl, host) {
  const match = host?.match(reBaseDomain);

  if (
    reCommonBase.test(host) ||
    // NOT localhost
    !match
  ) {
    return ssoUrl;
  }

  const baseDomain = match.groups.base;

  return ssoUrl.replace(reCommonBase, `.${baseDomain}`);
}

/**
 * If hostname includes stg- or ote-, fixup the login url if internal sso site
 * @type {import('./internal').fixupLoginUrlEnv}
 */
export function fixupLoginUrlEnv(ssoUrl, host) {
  const match = reHostStgOte.exec(host);

  if (match && match.length >= 2 && reProdUrl.test(ssoUrl)) {
    return ssoUrl.replace('sso.', `sso.${match[1]}`);
  }

  return ssoUrl;
}

/**
 * Extract query params from ssoUrl and attach to baseOverrideUrl if provided
 * @type {import('./internal').fixupLoginBaseSubstitution}
 */
export function fixupLoginBaseSubstitution(ssoUrl, baseOverrideUrl) {
  if (baseOverrideUrl) {
    const [, ssoQueryParams] = ssoUrl.split('?');

    return ssoQueryParams
      ? [baseOverrideUrl, ssoQueryParams].join('?')
      : baseOverrideUrl;
  }

  return ssoUrl;
}

/**
 * Shortcut to executes the fixup login url functions
 * @type {import('./internal').fixupLoginUrl}
 */
function fixupLoginUrl(ssoUrl, host, baseOverrideUrl) {
  return fixupLoginUrlEnv(
    fixupLoginUrlDomain(
      fixupLoginBaseSubstitution(ssoUrl, baseOverrideUrl),
      host
    ),
    host
  );
}

/**
 * Retrieve fixed up SSO Login Url from PresentationCentral request globals
 * @type {import('./internal').getLoginUrlFromRequest}
 */
export function getLoginUrlFromRequest(pcData, params = {}, options = {}) {
  const { overrideUrl, subdomain, host } = options;
  const ssoUrl = parseLoginUrl(pcData);

  if (!ssoUrl) return null;

  const ssoLogin = fixupLoginUrl(ssoUrl, host, overrideUrl);
  const redirectParams = { ...params, ...getParamsFromHost(host, subdomain) };

  return transformLoginUrl(ssoLogin, redirectParams);
}

/**
 * Retrieve fixed up SSO Login Url from PresentationCentral window globals
 * @type {import('.').getLoginUrlFromWindow}
 */
export function getLoginUrlFromWindow(window, params = {}, options = {}) {
  const { overrideUrl, subdomain } = options;
  let { path } = params;
  const { host } = window.location;

  if (!path) {
    const { pathname, hash = '', search = '' } = window.location;
    path = pathname + search + hash;
  }

  const ssoLogin = fixupLoginUrl(
    window.ux.data.urls.login.href,
    host,
    overrideUrl
  );
  const redirectParams = {
    ...params,
    ...getParamsFromHost(host, subdomain),
    path
  };

  return transformLoginUrl(ssoLogin, redirectParams);
}

/**
 * Create a dispatch action
 * @type {import('./internal').createAuthStateAction}
 */
export function createAuthStateAction(authKey, authState) {
  return {
    payload: {
      [authKey]: authState
    }
  };
}
