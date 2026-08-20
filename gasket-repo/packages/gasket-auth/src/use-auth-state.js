import { useAuthContext } from './context.js';
import ClientHandler from './client-handler.js';

/**
 * React hook that validates user authentication
 * @type {import('.').useAuthState}
 */
export default function useAuthState(authProps) {
  const { authKeyState = {}, dispatch } = useAuthContext();

  const handler = new ClientHandler({ authProps });

  return handler.getAuthState(authKeyState, dispatch);
}
