// To fully support static pages with React Server Components, we need to
// set the params necessary for PresentationCentral as path params.
// This middleware will rewrite the URL to include the params.

import { NextResponse, type NextRequest } from 'next/server';
import gasket from './gasket.edge.ts';

/**
 * Which paths to invoke middleware for
 * https://nextjs.org/docs/14/pages/building-your-application/routing/middleware
 */
export const config = {
  matcher: [
    '/healthcheck',
    // Match the root path so we can rewrite with path params
    '/',
    // Match other paths EXCEPT /api, /_next, etc.
    '/((?!api|_next|favicon.ico|sitemap.xml|robots.txt).*)'
  ]
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // New deployment healthcheck response
  if (pathname.startsWith('/healthcheck')) {
    return Response.json({ status: 'ok' }, { status: 200 });
  }

  const visitor = await gasket.actions.getVisitor(request);
  const { plid = 1, market, currency } = visitor;

  const targetPathname = [plid, market, currency, pathname.slice(1)].filter(Boolean).join('/');
  return NextResponse.rewrite(new URL(targetPathname, request.url));
}
