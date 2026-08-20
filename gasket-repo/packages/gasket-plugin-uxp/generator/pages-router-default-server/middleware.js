/**
 * Which paths to invoke middleware for
 * https://nextjs.org/docs/14/pages/building-your-application/routing/middleware
 * @type {import('next/server').MiddlewareConfig}
 **/
export const config = {
  matcher: [
    '/healthcheck'
  ]
}

/** @type {import('next/server').NextMiddleware} */
export async function middleware(request) {
  // New deployment healthcheck response
  if (request.nextUrl.pathname.startsWith('/healthcheck')) {
    return Response.json({ status: 'ok' }, { status: 200 });
  }
}
