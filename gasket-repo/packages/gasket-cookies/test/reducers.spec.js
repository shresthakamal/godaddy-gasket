import { actionTypes } from '../src/read-cookies.js';
import cookieReducers, { cookieReducer } from '../src/reducers.js';

describe('#cookieReducer', function () {
  let mockState, mockCookieData, action;
  beforeEach(() => {
    mockState = { key: 'value' };
    mockCookieData = { market: 'aa-AA', auth_idp: 'auth-token' };
    action = {
      type: actionTypes.LOAD_COOKIES,
      cookies: mockCookieData
    };
  });

  it('should return state with cookies added to it', function () {
    const newState = cookieReducer(mockState, action);
    expect(newState).toEqual({
      ...mockState,
      ...mockCookieData
    });
  });
  it('should return state without cookies added to it', function () {
    action = {
      type: 'something-else',
      data: 'junk'
    };
    const newState = cookieReducer(mockState, action);
    expect(newState).toEqual({
      ...mockState
    });
  });
});
describe('#cookieReducers', function () {
  it('should have a property gasket_cookies', function () {
    expect(cookieReducers).toHaveProperty('gasket_cookies', cookieReducer);
  });
});
