import withCookies, {
  cookieReducers,
  cookieSelectors,
  loadCookies,
  selectCookie
} from '@godaddy/gasket-cookies';
import { IncomingMessage } from 'http';
import { Request } from 'express';
import { AnyAction, Dispatch, Reducer, Store } from 'redux';

describe('@godaddy/gasket-cookies', function () {
  it('withCookies - has expected API', function () {
    const hoc = withCookies();
  });

  it('loadCookies - has expected API', function () {
    // @ts-ignore
    const req: Request = {};
    // @ts-ignore
    const store: Store = {};

    const dispatch: (dispatch: Dispatch<AnyAction>) => Promise<AnyAction> =
      loadCookies(req, store);
  });

  it('selectCookie - has expected API', function () {
    const state = {
      gasket_cookies: {}
    };

    const strValue = selectCookie<string>(state, 'currency');
    const boolValue = selectCookie<boolean>(state, 'enabled');

    const strValue2: string = selectCookie(state, 'currency');
    const boolValue2: boolean = selectCookie(state, 'enabled');

    const anyValue = selectCookie(state, 'enabled');
  });

  it('cookieSelectors - has expected defaults', function () {
    const state = {
      gasket_cookies: {}
    };

    // const strValue: string = cookieSelectors.market(state);
    // @ts-expect-error
    const badTypeValue: boolean = cookieSelectors.market(state);

    // const strValue2: string = cookieSelectors.currency(state);
    // @ts-expect-error
    const badTypeValue2: boolean = cookieSelectors.currency(state);
  });

  it('cookieReducers - has expected API', function () {
    const reducer: Reducer = cookieReducers.gasket_cookies;
  });
});
