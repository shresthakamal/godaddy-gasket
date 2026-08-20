import Negotiator from 'negotiator';

/**
 * @typedef {import('@gasket/request').GasketRequest} GasketRequest
 * @typedef {import('@gasket/request').RequestLike} RequestLike
 * @typedef {import('../index').Visitor} Visitor
 */

/**
 * Unbranded private label id for secureserver.net hostnames
 * @type {number}
 */
const noBrandPlId = 3153;

/**
 * Converts a value to an integer.
 * @type {import('./internal').toInt}
 */
const toInt = (value) => parseInt(String(value), 10);

/**
 * Extracts private label ID from request query parameters.
 * @type {import('./internal').getPrivateLabelIdFromQuery}
 */
function getPrivateLabelIdFromQuery(req) {
  const { query = {} } = req;

  const plId = query.plid || query.pl_id || query.privateLabelId || query.privatelabelid;

  if (plId) {
    if (typeof plId === 'string' || typeof plId === 'number') {
      return toInt(plId);
    } else if (Array.isArray(plId)) {
      // Assuming you want the first value if it's an array
      const firstValue = plId[0];

      if (typeof firstValue === 'string' || typeof firstValue === 'number') {
        return toInt(firstValue);
      }
    }
  }
}

/**
 * Extracts private label ID from request cookies.
 * @type {import('./internal').getPrivateLabelIdFromCookies}
 */
function getPrivateLabelIdFromCookies(req) {
  const { cookies = {} } = req;

  let plId = cookies?.privateLabelId ?? cookies?.privatelabelid;

  if (!plId && cookies?.info_idp) {
    try {
      const infoIdp = JSON.parse(cookies.info_idp);
      plId = infoIdp.auth === 'basic' ? infoIdp.plid : infoIdp[infoIdp.auth].plid;
    } catch {
      // ignore error parsing info_idp cookie
    }
  }

  if (plId) return toInt(plId);
}

/**
 * Extracts visitor GUID from visitor cookie.
 * @type {import('./internal').getVisitorGUID}
 */
function getVisitorGUID(req) {
  const { cookies: { visitor = '' } = {} } = req;

  return decodeURIComponent(visitor)
    .split(';')
    .reduce((guid, kvp) => {
      const splitIndex = kvp.indexOf('=');
      if (splitIndex <= 0) {
        return guid;
      }

      const [key, value] = kvp.split('=');

      return value && key.toLowerCase() === 'vid' ? value : guid;
    }, visitor);
}

/**
 * Assigns private label ID from query parameters if not already set.
 * @type {import('./internal').assignPlidFromQuery}
 */
function assignPlidFromQuery(visitor, req) {
  if (visitor.plid) return void 0;

  const plid = getPrivateLabelIdFromQuery(req);
  if (plid) {
    visitor.plid = plid;
    if (visitor.debug) {
      visitor.debug.plidFrom = 'query';
    }
  }
}

/**
 * Assigns private label ID from cookies if not already set.
 * @type {import('./internal').assignPlidFromCookies}
 */
function assignPlidFromCookies(visitor, req) {
  if (visitor.plid) return void 0;

  const plid = getPrivateLabelIdFromCookies(req);
  if (plid) {
    visitor.plid = plid;
    if (visitor.debug) {
      visitor.debug.plidFrom = 'cookies';
    }
  }
}

/**
 * Assigns hostname from x-dsa-host header if not already set.
 * @type {import('./internal').assignHostnameFromXDsaHost}
 */
function assignHostnameFromXDsaHost(visitor, req) {
  if (visitor.hostname) return void 0;

  const { headers = {} } = req;

  const xDsaHost = Array.isArray(headers['x-dsa-host'])
    ? headers['x-dsa-host'][0]
    : headers['x-dsa-host'];

  if (xDsaHost) {
    visitor.host = xDsaHost;
    visitor.hostname = stripPortFromHostname(xDsaHost);
    if (visitor.debug) {
      visitor.debug.hostFrom = 'x-dsa-host header';
      visitor.debug.hostnameFrom = 'x-dsa-host header';
    }
  }
}

/**
 * Assigns hostname from x-forwarded-host header if not already set.
 * @type {import('./internal').assignHostnameFromXForwarded}
 */
function assignHostnameFromXForwarded(visitor, req) {
  if (visitor.hostname) return void 0;

  const { headers = {} } = req;

  const xForwardedHost = Array.isArray(headers['x-forwarded-host'])
    ? headers['x-forwarded-host'][0]
    : headers['x-forwarded-host'];

  if (xForwardedHost) {
    visitor.host = xForwardedHost;
    visitor.hostname = stripPortFromHostname(xForwardedHost);
    if (visitor.debug) {
      visitor.debug.hostFrom = 'x-forwarded-host header';
      visitor.debug.hostnameFrom = 'x-forwarded-host header';
    }
  }
}

/**
 * Assigns the hostname from the `host` header if it is not already set.
 * @type {import('./internal').assignHostnameFromHost}
 */
function assignHostnameFromHost(visitor, req) {
  if (visitor.hostname) return void 0;

  const { headers = {} } = req;
  visitor.host = headers.host;
  visitor.hostname = stripPortFromHostname(headers.host);
  if (visitor.debug) {
    visitor.debug.hostFrom = 'host header';
    visitor.debug.hostnameFrom = 'host header';
  }
}

/**
 * Strips port from hostname if present.
 * @param {string} [hostname] - The hostname potentially containing a port.
 * @returns {string | undefined} - The hostname without the port.
 */
function stripPortFromHostname(hostname) {
  return hostname?.split(':')[0];
}

/**
 * Assigns plid from the visitor's hostname when no plid has been set yet.
 * Pure resolver — does not validate or override existing plid values.
 * @type {import('./internal').assignPlidFromHostname}
 */
function assignPlidFromHostname(visitor, _req, atlas) {
  if (visitor.plid) return void 0;
  if (!visitor.hostname) return void 0;

  const brandFromDomain = atlas.findBrandByDomain(visitor.hostname);
  if (!brandFromDomain) return void 0;

  const isSecureServer = brandFromDomain.domain.endsWith('secureserver.net');
  if (isSecureServer) return void 0;

  visitor.plid = brandFromDomain.plid;
  if (visitor.debug) {
    visitor.debug.plidFrom = 'default from domain brand';
  }
}

/**
 * Cross-validates plid against the hostname's brand and falls back to NoBrand
 * when neither plid nor a recognizable brand is available. Always runs after
 * the plid resolver loop.
 * @type {import('./internal').assignPlidFromDefault}
 */
// eslint-disable-next-line max-statements, complexity
function assignPlidFromDefault(visitor, atlas) {
  let brandFromDomain;
  let brandFromPlid;

  if (visitor.hostname) {
    brandFromDomain = atlas.findBrandByDomain(visitor.hostname);
  }

  const isSecureServer = brandFromDomain?.domain.endsWith('secureserver.net');

  // If plid is already set, resolve brand from plid
  if (visitor.plid > 0) {
    // For secureserver.net brand we must trust the derived plid
    if (isSecureServer) {
      return void 0;
    }

    brandFromPlid = atlas.resolveBrandByPlid(visitor.plid);
  }

  if (!brandFromPlid) {
    // If no plid and no brand from domain, we must default to NoBrand plid
    if (!brandFromDomain) {
      visitor.plid = noBrandPlId; // Default to no brand
      if (visitor.debug) {
        visitor.debug.plidFrom = 'default to NoBrand for unknown hostname with no plid';
      }
      return void 0;
    }

    // If no plid but brand is secureserver.net, we must default to NoBrand plid
    if (isSecureServer) {
      visitor.plid = noBrandPlId; // Default to no brand
      if (visitor.debug) {
        visitor.debug.plidFrom = 'default to NoBrand for secureserver.net with no plid';
      }
      return void 0;
    }
  }

  // If we have brands from plid from domain, we need to ensure they match
  if (brandFromDomain && brandFromPlid && brandFromDomain.plid !== brandFromPlid.plid) {
    // Override plid with brand from domain
    // This is a safeguard to ensure that the plid is consistent with the brand
    visitor.plid = brandFromDomain.plid;
    if (visitor.debug) {
      const { plidFrom } = visitor.debug;
      visitor.debug.plidFrom = `override (from ${plidFrom}) from domain brand`;
    }
  }

  // If we have a brand from domain but no plid was set, use the brand's plid
  // This ensures all visitors get a valid plid when visiting a known branded domain
  if (!visitor.plid && brandFromDomain && !isSecureServer) {
    visitor.plid = brandFromDomain.plid;
    if (visitor.debug) {
      visitor.debug.plidFrom = 'default from domain brand';
    }
  }
}

/**
 * Assigns market from x-market-id header if not already set.
 * @type {import('./internal').assignMarketFromHeaders}
 */
function assignMarketFromHeaders(visitor, req, atlas) {
  if (visitor.market) return void 0;

  const { headers = {} } = req;
  const brand = atlas.resolveBrandByPlid(visitor.plid);

  if (headers['x-market-id']) {
    const market = brand.findMarketByLocale(headers['x-market-id']);
    if (market) {
      visitor.market = market.marketLocale;
      if (visitor.debug) {
        visitor.debug.marketFrom = 'x-market-id header';
      }
    }
  }
}

/**
 * Assigns market from market cookie if not already set.
 * @type {import('./internal').assignMarketFromCookies}
 */
function assignMarketFromCookies(visitor, req, atlas) {
  if (visitor.market) return void 0;

  const { cookies = {} } = req;
  const brand = atlas.resolveBrandByPlid(visitor.plid);

  if (cookies.market) {
    const market = brand.findMarketByLocale(cookies.market);
    if (market) {
      visitor.market = market.marketLocale;
      if (visitor.debug) {
        visitor.debug.marketFrom = 'market cookie';
      }
    }
  }
}

/**
 * Assigns market from query parameter if not already set.
 * @type {import('./internal').assignMarketFromQuery}
 */
function assignMarketFromQuery(visitor, req, atlas) {
  if (visitor.market) return void 0;

  const { query = {} } = req;
  const brand = atlas.resolveBrandByPlid(visitor.plid);

  if (query.market) {
    const market = brand.findMarketByLocale(query.market);
    if (market) {
      visitor.market = market.marketLocale;
      if (visitor.debug) {
        visitor.debug.marketFrom = 'query param';
      }
    }
  }
}

/**
 * Assigns market based on Accept-Language header negotiation if not already set.
 * @type {import('./internal').assignMarketFromAcceptLanguage}
 */
// eslint-disable-next-line max-statements
function assignMarketFromAcceptLanguage(visitor, req, atlas) {
  if (visitor.market) return void 0;

  if (!req.headers || !req.headers['accept-language']) return void 0;

  const brand = atlas.resolveBrandByPlid(visitor.plid);
  const negotiator = new Negotiator(req);

  const availableSet = brand.getMarkets().reduce((acc, market) => {
    // Add markets
    acc.add(market.marketLocale);
    // Add languages
    acc.add(market.lang);
    return acc;
  }, new Set());

  const available = Array
    .from(availableSet)
    // Sort markets before languages then alphabetically
    .sort((a, b) => {
      if (a.length !== b.length) {
        return b.length - a.length;
      }
      return a.localeCompare(b);
    });

  const negotiated = negotiator.language(Array.from(available));

  if (negotiated) {
    if (negotiated?.includes('-')) {
      const market = brand.findMarketByLocale(negotiated);
      if (market) {
        visitor.market = market.marketLocale;
        if (visitor.debug) {
          visitor.debug.marketFrom = 'accept-language market';
        }
      }
      return void 0;
    }

    const market = brand.findMarketByLang(negotiated);
    if (market) {
      visitor.market = market.marketLocale;
      if (visitor.debug) {
        visitor.debug.marketFrom = 'accept-language language';
      }
    }
  }
}

/**
 * Assigns default market from brand if not already set.
 * @type {import('./internal').assignMarketFromDefault}
 */
function assignMarketFromDefault(visitor, atlas) {
  if (visitor.market) return void 0;

  const brand = atlas.resolveBrandByPlid(visitor.plid);
  visitor.market = brand.defaultMarket.marketLocale;
  if (visitor.debug) {
    visitor.debug.marketFrom = 'brand default market';
  }
}

/**
 * Assigns translation locale based on the resolved market.
 * @type {import('./internal').assignTranslationLocale}
 */
function assignTranslationLocale(visitor, atlas) {
  const market = atlas
    .resolveBrandByPlid(visitor.plid)
    .resolveMarketByLocale(visitor.market);

  visitor.locale = market.translationLocale;
  if (visitor.debug) {
    visitor.debug.localeFrom = 'market translation locale';
  }
}

/**
 * Assigns currency from x-currency-id header.
 * @type {import('./internal').assignCurrencyFromHeaders}
 */
function assignCurrencyFromHeaders(visitor, req, atlas) {
  if (visitor.currency) return void 0;

  const { headers = {} } = req;

  if (headers['x-currency-id']) {
    const currency = atlas.findCurrencyByCode(headers['x-currency-id']);
    if (currency) {
      visitor.currency = currency.code;
      if (visitor.debug) {
        visitor.debug.currencyFrom = 'x-currency-id header';
      }
    }
  }
}

/**
 * Assigns currency from currency cookie if not already set.
 * @type {import('./internal').assignCurrencyFromCookies}
 */
function assignCurrencyFromCookies(visitor, req, atlas) {
  if (visitor.currency) return void 0;

  const { cookies = {} } = req;

  if (cookies.currency) {
    const currency = atlas.findCurrencyByCode(cookies.currency);
    if (currency) {
      visitor.currency = currency.code;
      if (visitor.debug) {
        visitor.debug.currencyFrom = 'currency cookie';
      }
    }
  }
}

/**
 * Assigns currency from query parameter if not already set.
 * @type {import('./internal').assignCurrencyFromQuery}
 */
function assignCurrencyFromQuery(visitor, req, atlas) {
  if (visitor.currency) return void 0;

  const { query = {} } = req;

  if (query.currency) {
    const currency = atlas.findCurrencyByCode(query.currency);
    if (currency) {
      visitor.currency = currency.code;
      if (visitor.debug) {
        visitor.debug.currencyFrom = 'query param';
      }
    }
  }
}

/**
 * Assigns default currency from market if not already set.
 * @type {import('./internal').assignCurrencyFromDefault}
 */
function assignCurrencyFromDefault(visitor, atlas) {
  if (visitor.currency) return void 0;

  const currency = atlas
    .resolveBrandByPlid(visitor.plid)
    .resolveMarketByLocale(visitor.market)
    .defaultCountry
    .defaultCurrency;

  visitor.currency = currency.code;
  if (visitor.debug) {
    visitor.debug.currencyFrom = 'market default currency';
  }
}

/**
 * Assigns visitor GUID from visitor cookie.
 * @type {import('./internal').assignVisitorGuid}
 */
function assignVisitorGuidFromCookies(visitor, req) {
  if (visitor.visitorGuid) return void 0;

  const visitorGuid = getVisitorGUID(req);
  if (visitorGuid) {
    visitor.visitorGuid = visitorGuid;
    visitor.visitorId = visitorGuid; // Alias for compatibility
    if (visitor.debug) {
      visitor.debug.visitorGuidFrom = 'visitor cookie';
    }
  }
}

/**
 * Assigns visitor GUID from X-Visitor-Id header.
 * @type {import('./internal').assignVisitorGuid}
 */
function assignVisitorGuidFromHeader(visitor, req) {
  if (visitor.visitorGuid) return void 0;

  const { headers = {} } = req;
  const headerVisitorId = headers['x-visitor-id'];
  if (headerVisitorId) {
    visitor.visitorGuid = headerVisitorId;
    visitor.visitorId = headerVisitorId; // Alias for compatibility
    if (visitor.debug) {
      visitor.debug.visitorGuidFrom = 'X-Visitor-Id header';
    }
  }
}

/**
 * Assigns session ID from pathway cookie.
 * @type {import('./internal').assignSessionId}
 */
function assignSessionId(visitor, req) {
  const { cookies: { pathway } = {} } = req;

  if (pathway) {
    visitor.visitGuid = pathway;
    visitor.sessionId = pathway; // Alias for compatibility
    if (visitor.debug) {
      visitor.debug.sessionIdFrom = 'pathway cookie';
    }
  }
}

const HOSTNAME_RESOLVERS = {
  'x-dsa-host': assignHostnameFromXDsaHost,
  'x-forwarded': assignHostnameFromXForwarded,
  'host': assignHostnameFromHost
};
const HOSTNAME_DEFAULT_ORDER = ['x-dsa-host', 'x-forwarded', 'host'];

const PLID_RESOLVERS = {
  query: assignPlidFromQuery,
  cookie: assignPlidFromCookies,
  hostname: assignPlidFromHostname
};
const PLID_DEFAULT_ORDER = ['query', 'cookie', 'hostname'];

const MARKET_RESOLVERS = {
  'cookie': assignMarketFromCookies,
  'header': assignMarketFromHeaders,
  'query': assignMarketFromQuery,
  'accept-language': assignMarketFromAcceptLanguage
};
const MARKET_DEFAULT_ORDER = ['cookie', 'header', 'query', 'accept-language'];

const CURRENCY_RESOLVERS = {
  cookie: assignCurrencyFromCookies,
  header: assignCurrencyFromHeaders,
  query: assignCurrencyFromQuery
};
const CURRENCY_DEFAULT_ORDER = ['cookie', 'header', 'query'];

const VISITOR_GUID_RESOLVERS = {
  header: assignVisitorGuidFromHeader,
  cookie: assignVisitorGuidFromCookies
};
const VISITOR_GUID_DEFAULT_ORDER = ['header', 'cookie'];

// Consumed by the configure hook validator to enumerate allowed source keys per field.
const FIELD_REGISTRIES = {
  hostname: { resolvers: HOSTNAME_RESOLVERS, defaultOrder: HOSTNAME_DEFAULT_ORDER },
  plid: { resolvers: PLID_RESOLVERS, defaultOrder: PLID_DEFAULT_ORDER },
  market: { resolvers: MARKET_RESOLVERS, defaultOrder: MARKET_DEFAULT_ORDER },
  currency: { resolvers: CURRENCY_RESOLVERS, defaultOrder: CURRENCY_DEFAULT_ORDER },
  visitorGuid: { resolvers: VISITOR_GUID_RESOLVERS, defaultOrder: VISITOR_GUID_DEFAULT_ORDER }
};

/**
 * Builds the ordered list of resolver functions for a field, applying any
 * configured priority first and appending the rest of the default order.
 * @param {string[]} defaultOrder - Default ordering of source keys for the field.
 * @param {Record<string, Function>} resolvers - Map of source key to resolver function.
 * @param {string[]} [requested] - Optional priority ordering of source keys.
 * @returns {Function[]} Resolver functions in the resolved order.
 */
function orderResolvers(defaultOrder, resolvers, requested) {
  const priority = requested ?? [];
  const remaining = defaultOrder.filter(k => !priority.includes(k));
  return [...priority, ...remaining].map(k => resolvers[k]);
}

/**
 * Assembles a complete visitor object by applying all assignment functions in priority order.
 * @type {import('./internal').getVisitor}
 */
// eslint-disable-next-line max-statements
function assembleVisitor(req, atlas, debug, priority = void 0) {
  const p = priority ?? {};
  /** @type {Visitor} */
  // @ts-ignore - object will be assembled below
  const visitor = debug ? { debug: {} } : {};

  for (const fn of orderResolvers(HOSTNAME_DEFAULT_ORDER, HOSTNAME_RESOLVERS, p.hostname)) {
    fn(visitor, req);
  }

  for (const fn of orderResolvers(PLID_DEFAULT_ORDER, PLID_RESOLVERS, p.plid)) {
    fn(visitor, req, atlas);
  }
  assignPlidFromDefault(visitor, atlas);

  for (const fn of orderResolvers(MARKET_DEFAULT_ORDER, MARKET_RESOLVERS, p.market)) {
    fn(visitor, req, atlas);
  }
  assignMarketFromDefault(visitor, atlas);

  for (const fn of orderResolvers(CURRENCY_DEFAULT_ORDER, CURRENCY_RESOLVERS, p.currency)) {
    fn(visitor, req, atlas);
  }
  assignCurrencyFromDefault(visitor, atlas);

  assignTranslationLocale(visitor, atlas);

  for (const fn of orderResolvers(VISITOR_GUID_DEFAULT_ORDER, VISITOR_GUID_RESOLVERS, p.visitorGuid)) {
    fn(visitor, req);
  }

  assignSessionId(visitor, req);

  return visitor;
}

export {
  assembleVisitor,
  FIELD_REGISTRIES
};
