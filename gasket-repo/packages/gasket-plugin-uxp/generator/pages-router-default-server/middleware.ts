
import { type NextRequest } from 'next/server';

/**
 * Which paths to invoke middleware for
 * https://nextjs.org/docs/14/pages/building-your-application/routing/middleware
 */
export const config = {
  matcher: [
    '/healthcheck'
  ]
}

export async function middleware(request: NextRequest) {
  // New deployment healthcheck response
  if (request.nextUrl.pathname.startsWith('/healthcheck')) {
    return Response.json({ status: 'ok' }, { status: 200 });
  }
}
