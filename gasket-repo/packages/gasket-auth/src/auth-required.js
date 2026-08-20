'use client';
import React from 'react';
import useAuthState from './use-auth-state.js';
import { AuthStatus } from './utils.js';
import ClientHandler from './client-handler.js';

/**
 * Render the wrapped children and inject details of enabled
 * @type {import('./internal').validContent}
 */
function validContent(authProps, authState) {
  const { children, injectDetails } = authProps;
  let injectedChildren;

  if (injectDetails) {
    const { details: authDetails } = authState;
    injectedChildren = React.Children.map(children, (child) =>
      React.isValidElement(child)
        ? React.cloneElement(child, /** @type {React.Attributes & { authDetails: unknown }} */ ({ authDetails }))
        : child
    );
  }

  return React.createElement(
    React.Fragment,
    null,
    injectedChildren || children
  );
}

/**
 * Redirect to SSO, or render alt content if set
 * @type {import('./internal').invalidContent}
 */
function invalidContent(authProps, authState) {
  if ('alt' in authProps) return authProps.alt;

  const handler = new ClientHandler({ authProps });
  handler.attemptRedirect(authState);
}

/**
 * Component that checks auth state and either renders or redirects to SSO
 * @type {import('.').AuthRequired}
 */
export default function AuthRequired(props) {
  const { loading = null } = props;
  const authState = useAuthState(props);

  // It is possible our authState is stale and revalidating,
  // but we will continue show the valid content while it is loading.
  if (authState.valid) return validContent(props, authState);

  // A network/connectivity failure is not a real auth rejection — render the
  // loading fallback (transient) instead of the alt / SSO redirect. The common
  // mid-session case keeps `valid` true via ClientHandler.getAuthState; this
  // covers the no-prior-valid case (e.g. a first load while offline).
  if (authState.status === AuthStatus.LOADING || authState.networkError) return loading;

  return invalidContent(props, authState) || loading;
}

