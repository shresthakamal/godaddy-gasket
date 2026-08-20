export const isSecureServer = /secureserver\.net/i;
const isDynamicRoute = /\[([^[\]]+)]/g;

import { gasketData } from '@gasket/data';

/**
 * Add plid to the current route
 * @type {import('./internal').retainPlidOnRoute}
 */
export function retainPlidOnRoute(router) {
  if (!isSecureServer.test(window.location.hostname)) return;
  const data = gasketData();
  const plid = data?.visitor?.plid;
  if (plid > 1 && !router.query.plid) {
    // If the current route is a dynamic route, remove the dynamic route key
    // from the query
    const isDynamic = isDynamicRoute.test(router.pathname);
    /** @type {import('querystring').ParsedUrlQueryInput} */
    const query = { ...router.query, plid };
    const match = router.pathname.match(isDynamicRoute);
    const dynamicRouteKeys = match && match.map((m) => m.slice(1, -1));
    if (isDynamic && dynamicRouteKeys) {
      dynamicRouteKeys.forEach((key) => delete query[key]);
    }

    // Ensure asPath does not include query params for use as pathname
    const pathname = router.asPath.split('?')[0];

    router.replace(
      {
        pathname,
        query
      },
      // eslint-disable-next-line no-undefined
      undefined,
      { shallow: true }
    );
  }
}
