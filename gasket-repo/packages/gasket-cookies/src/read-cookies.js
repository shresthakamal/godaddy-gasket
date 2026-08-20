import cookie from 'cookie';

/**
 * Maintain a list of whitelisted cookies here, that will be read and stored in
 * redux state.
 * @type {string[]} array of cookie names to save.
 */
const defaultWhitelist = ['currency', 'market'];

/**
 * Maintain a list of blacklisted cookies here, that should never be read and
 * stored in redux state.
 * @type {string[]} array of cookie names to avoid saving.
 */
const defaultBlacklist = ['auth_idp', 'auth_jomax'];

/**
 * This checks the cookies against the whitelisted and blacklisted cookies and
 * removes all extra cookies
 * @type {import('.').removeExtraCookies}
 */
export function removeExtraCookies(cookies, cookieWhitelist = []) {
  const newCookies = {};
  Object.keys(cookies).forEach(function (key) {
    if (defaultWhitelist.indexOf(key) > -1) {
      newCookies[key] = cookies[key];
    }

    if (
      cookieWhitelist.indexOf(key) > -1 &&
      defaultBlacklist.indexOf(key) === -1
    ) {
      newCookies[key] = cookies[key];
    }
  });

  return newCookies;
}

/**
 * Parses the cookies into json objects
 * @type {import('.').parseCookies}
 */
export function parseCookies(cookies) {
  Object.keys(cookies).forEach(function (key) {
    if (typeof cookies[key] !== 'undefined') {
      try {
        cookies[key] = JSON.parse(cookies[key]);
      } catch {
        // Expected errors on cookies that don't have json strings.
      }
    }
  });

  return cookies;
}

/**
 * This reads and parses the cookies from request (on server) or document
 * (client).
 * @type {import('.').readCookies}
 */
export function readCookies(req, store) {
  const state = store.getState();
  const cookieString = req ? req.headers.cookie : document.cookie;
  let cookies = cookie.parse(cookieString || '');

  cookies = removeExtraCookies(cookies, state.cookieWhitelist);
  cookies = parseCookies(cookies);

  return cookies;
}

export const actionTypes = {
  LOAD_COOKIES: 'LOAD_COOKIES'
};

/**
 * Redux action that initiates reading and loading cookies into redux store
 * @type {import('.').loadCookies}
 */
export function loadCookies(req, store) {
  return async (dispatch) => {
    const cookies = readCookies(req, store);

    return dispatch({ type: actionTypes.LOAD_COOKIES, cookies });
  };
}

/**
 * Select value of cookie name from Redux state
 * @type {import('.').selectCookie}
 */
export function selectCookie(state, name) {
  return state.gasket_cookies[name];
}

/**
 * cookieSelectors redux selector
 * @type {import('.').cookieSelectors}
 */
export const cookieSelectors = {};

defaultWhitelist.forEach((name) => {
  cookieSelectors[name] = (state) => selectCookie(state, name);
});
