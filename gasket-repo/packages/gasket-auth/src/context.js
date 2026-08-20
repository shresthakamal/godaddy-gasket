import React, { useContext } from 'react';

/** @type {React.Context<import('.').AuthContext>} */
const AuthContext = React.createContext(/** @type {import('.').AuthContext} */ ({
  state: {}
}));

export default AuthContext;

/** @type {import('./internal').useAuthContext} */
export const useAuthContext = () => useContext(AuthContext);
