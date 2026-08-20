import ServerHandler from './server-handler.js';

/**
 * Make a getServerSideProps function for auth
 * @type {import('.').authGetServerSideProps}
 */
export default function authGetServerSideProps(authProps) {
  if (!authProps.gasket) {
    throw new Error('gasket instance is required to attach getServerSideProps');
  }

  return async function getServerSideProps(ctx) {
    const handler = new ServerHandler({ authProps, ctx });
    const authState = await handler.getAuthState();
    const url = await handler.getRedirectUrl(authState);

    if (url) {
      return {
        // Next v10 is required
        redirect: {
          destination: url,
          permanent: true
        }
      };
    }

    return {
      props: {
        authKeyState: {
          [handler.authKey]: authState
        }
      }
    };
  };
}
