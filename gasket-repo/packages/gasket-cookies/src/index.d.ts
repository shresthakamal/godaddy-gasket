import type { ComponentType } from 'react';
import type { Store, Dispatch, Reducer, AnyAction } from 'redux';
import type { AppContext } from 'next/app';
import type { Request } from 'express';

type ComponentWithInitialProps = ComponentType & {
  getInitialProps?: (ctx: AppContext) => Promise<any>;
};

interface CookieState {
  [key: string]: T | string | boolean;
}

interface CookieReducers {
  gasket_cookies: Reducer;
}

interface CookieSelectors {
  currency: (state: { gasket_cookies: CookieState }) => string;
  market: (state: { gasket_cookies: CookieState }) => string;
  [k: string]: <T>(state: { gasket_cookies: CookieState }) => T;
}

/** Parses the cookies into json objects */
function parseCookies(cookies: CookieState): {
  [key: string]: string;
};

/**
 * This reads and parses the cookies from request (on server) or document
 * (client).
 */
function readCookies(req: Request, store: Store): CookieState;

/**
 * This checks the cookies against the whitelisted and blacklisted cookies and
 * removes all extra cookies
 */
function removeExtraCookies(
  /** cookies as read from the browser/request */
  cookies: CookieState,
  /** custom whitelist of cookies to add in the store. */
  cookieWhitelist: string[]
): Partial<CookieState>;


/** Redux reducer to add cookie data to Redux state */
const cookieReducers: CookieReducers;
/** Object which contains selectors for available cookies */
const cookieSelectors: Partial<CookieSelectors>;
/**
 * Redux action that initiates reading and loading cookies into redux store
 */
function loadCookies(
  /** request object from context passed to getInitialProps */
  req: Request,
  store: Store
): (dispatch: Dispatch<AnyAction>) => Promise<AnyAction>;

/** Select value of cookie name from Redux state */
function selectCookie<T extends string | boolean>(
  state: { gasket_cookies: CookieState },
  /** cookie name */
  name: string
): T;
/**
 * Make a HOC that adds getInitialProps to a page component to which load
 * cookies to Redux state.
 */
export default function withCookies(): (
  Component: ComponentWithInitialProps
) => ComponentType;

