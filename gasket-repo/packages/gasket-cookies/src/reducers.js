import { actionTypes } from './read-cookies';

/**
 * Redux reducer to add cookie data to Redux state
 * @type {import('redux').Reducer}
 */
export function cookieReducer(state = {}, action) {
  switch (action.type) {
    case actionTypes.LOAD_COOKIES:
      return { ...state, ...action.cookies };
    default:
      return state;
  }
}

/** @type {import('.').cookieReducers} */
const cookieReducers = { gasket_cookies: cookieReducer };

export default cookieReducers;
