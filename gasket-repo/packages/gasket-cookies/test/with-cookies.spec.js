import React from 'react';
import { render } from '@testing-library/react';
import withCookies from '../src/with-cookies';

describe('withCookies', function () {
  const testid = 'mock-component';
  const MockComponent = class extends React.Component {
    render() {
      return <div data-testid={ testid }>MockComponent</div>;
    }
  };

  it('renders child component', () => {
    const Component = withCookies()(MockComponent);
    const { getByTestId } = render(<Component />);
    expect(getByTestId(testid)).toBeInTheDocument();
  });

  it('Calls loadCookies action', () => {
    const Component = withCookies()(MockComponent);
    const dispatchStub = jest.fn();
    const appCtx = {
      ctx: {
        store: {
          dispatch: dispatchStub
        }
      }
    };
    Component.getInitialProps(appCtx);
    expect(dispatchStub.mock.calls).toHaveLength(1);
  });
});
