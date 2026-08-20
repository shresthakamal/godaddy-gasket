import ServerHandler from './server-handler.js';
import ClientHandler from './client-handler.js';

/**
 * Sets up and attaches the getInitialProps static method
 * @type {import('./internal').attachGetInitialProps}
 */
export function attachGetInitialProps(Component, authProps) {
  const { WrappedComponent } = Component;
  const wrappedGetInitialProps =
    Component.getInitialProps ||
    (WrappedComponent && WrappedComponent.getInitialProps);

  // eslint-disable-next-line complexity
  Component.getInitialProps = async (ctx) => {
    const { req, res } = ctx;

    if (res && !res.headersSent) {
      res.setHeader('cache-control', 'no-cache, must-revalidate, no-store');
    }

    const isBrowser = !req;
    let handler;

    if (isBrowser) {
      handler = new ClientHandler({ authProps });
    } else {
      handler = new ServerHandler({ authProps, ctx });
    }

    const authState = await handler.getAuthState();
    const isRedirecting = await handler.attemptRedirect(authState);
    const wrappedInitialProps = wrappedGetInitialProps && !isRedirecting
      ? /** @type {Record<string, unknown>} */ (await wrappedGetInitialProps(ctx))
      : {};

    return {
      ...wrappedInitialProps,
      // This will be handled in pageProps by the AuthProvider
      authKeyState: {
        ...(/** @type {Record<string, unknown>} */ (wrappedInitialProps?.authKeyState) || {}),
        [handler.authKey]: authState
      },
      ...((isRedirecting && { isRedirecting }) || {}),
      // Let the wrapper know if we ran getInitialProps in the browser
      ...((isBrowser && { isBrowser }) || {})
    };
  };

  return Component;
}

/**
 * Higher order function to attach getInitialProps to a component
 * @type {import('.').authGetInitialProps}
 */
export default function authGetInitialProps(authProps) {
  return (Component) => attachGetInitialProps(Component, authProps);
}
