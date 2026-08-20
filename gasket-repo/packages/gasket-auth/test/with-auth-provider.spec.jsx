import React from 'react';
import { render } from '@testing-library/react';
import withAuthProvider, { clientAuthKeyState, init, reducer } from '../src/with-auth-provider';
import { createAuthStateAction } from '../src/utils';

const MockComponent = () => <div>MockComponent</div>;

describe('withAuthProvider', function () {
  let testProps;

  const doRender = (props) => {
    const Wrapped = withAuthProvider()(MockComponent);

    return render(<Wrapped { ...props } />);
  };

  beforeEach(function () {
    testProps = {};
  });

  afterEach(function () {
    Object.keys(clientAuthKeyState).forEach(k => { delete clientAuthKeyState[k];});
  });

  it('adds display name', function () {
    const Wrapped = withAuthProvider()(MockComponent);
    expect(Wrapped).toHaveProperty('displayName', 'withAuthProvider(MockComponent)');
  });

  it('exposes target component as WrappedComponent', () => {
    const Wrapped = withAuthProvider()(MockComponent);
    expect(Wrapped).toHaveProperty('WrappedComponent', MockComponent);
  });

  it('hoists non-react statics', function () {
    expect(withAuthProvider()(MockComponent)).not.toHaveProperty('bogus');
    MockComponent.bogus = 'BOGUS';
    expect(withAuthProvider()(MockComponent)).toHaveProperty('bogus', 'BOGUS');
    delete MockComponent.bogus;
  });

  it('hoists getInitialProps if set', function () {
    expect(withAuthProvider()(MockComponent)).not.toHaveProperty('getInitialProps');
    MockComponent.getInitialProps = f => f;
    expect(withAuthProvider()(MockComponent)).toHaveProperty('getInitialProps');
    delete MockComponent.getInitialProps;
  });

  describe('#render', function () {
    it('wraps target component and renders children', function () {
      const { getByText } = doRender(testProps);
      expect(getByText('MockComponent')).toBeInTheDocument();
    });
  });

  describe('init', function () {
    it('adds timestamps to incoming authStates', function () {
      const results = init({ fake: { valid: true } });
      expect(results).toEqual({
        fake: {
          valid: true,
          timestamp: expect.any(Number)
        }
      });
    });

    it('updates client state in browser', function () {
      init({ fake: { valid: true } });
      expect(clientAuthKeyState).toEqual({
        fake: {
          valid: true,
          timestamp: expect.any(Number)
        }
      });
    });
  });

  describe('reducer', function () {
    it('adds payload to existing state', function () {
      const fakeAction = createAuthStateAction('fake', { valid: true });
      const results = reducer({ existing: { valid: false } }, fakeAction);
      expect(results).toEqual({
        existing: {
          valid: false
        },
        fake: {
          valid: true
        }
      });
    });

    it('updates client state in browser', function () {
      const fakeAction = createAuthStateAction('fake', { valid: true });
      reducer({ existing: { valid: false } }, fakeAction);
      expect(clientAuthKeyState).toEqual({
        existing: {
          valid: false
        },
        fake: {
          valid: true
        }
      });
    });
  });
});
