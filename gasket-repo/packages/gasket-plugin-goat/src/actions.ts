/// <reference types="@gasket/plugin-logger" />
import type { Gasket } from '@gasket/core';
import { createGoatClient } from '@godaddy/goat';
import type { AuthProvider, GoatClient } from '@godaddy/goat';
import { serviceAuth, forwardAuth } from './auth.js';

/** Detect a request-like object by the presence of headers. */
function isReq(x: unknown): x is { headers: unknown } {
  return !!x && typeof x === 'object' && 'headers' in x;
}

/** Describe an unusable argument for the error message, without logging its contents. */
function describeArg(x: unknown): string {
  if (typeof x !== 'object') return typeof x;
  return x?.constructor?.name ?? 'object';
}

/**
 * Auth provider for an argument that was passed but is not request-shaped. For use with returning auth
 * middleware that expect a request object.
 */
function badReqAuth(req: unknown): AuthProvider {
  return async () => {
    throw new Error(
      `[goat] getGoat(req) expected a request with headers, received ${describeArg(req)}.`
      + ' Pass the framework request object (in Next App Router,'
      + ' `{ headers: await headers() }`), or call getGoat() with no argument to use'
      + ' the service identity'
    );
  };
}

function loggingFetch(gasket: Gasket): typeof globalThis.fetch {
  return async (input, init) => {
    const method =
      init?.method ??
      (typeof Request !== 'undefined' && input instanceof Request ? input.method : 'GET');

    let rawUrl: string;
    if (typeof input === 'string') rawUrl = input;
    else if (input instanceof URL) rawUrl = input.href;
    else rawUrl = input.url;

    // Avoid logging query strings (often contain tokens/PII)
    const url = (() => {
      try {
        const u = new URL(rawUrl);
        return `${u.origin}${u.pathname}`;
      } catch {
        return rawUrl;
      }
    })();

    const start = Date.now();
    gasket.logger.debug(`[goat] ${method} ${url}`);
    const res = await globalThis.fetch(input, init);
    const duration = Date.now() - start;

    if (res.status < 400) {
      gasket.logger.debug(`[goat] ${method} ${url} → ${res.status} (${duration}ms)`);
    } else {
      gasket.logger.error(`[goat] ${method} ${url} → ${res.status} (${duration}ms)`);
    }
    return res;
  };
}

/** Get a configured GOAT client instance, ready to make API calls. */
export function getGoat(gasket: Gasket, req?: unknown): GoatClient {
  const config = gasket.config.goat;
  if (!config) {
    throw new Error('[goat] missing required config: goat (baseUrl, appId, projectId)');
  }
  let auth: AuthProvider;
  if (req == null) {
    auth = serviceAuth(gasket);
  } else if (isReq(req)) {
    auth = forwardAuth(gasket, req);
  } else {
    auth = badReqAuth(req);
  }

  const { baseUrl, appId, projectId } = config;
  return createGoatClient({ baseUrl, appId, projectId, auth, fetchImpl: loggingFetch(gasket) });
}
