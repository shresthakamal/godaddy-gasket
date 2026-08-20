/// <reference types="@testing-library/jest-dom" />

import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterAll,
  afterEach
} from 'vitest';
import React from 'react';
import { render } from '../helpers';
import {
  withContentParamsProvider,
  ContentParamsProvider,
  useContentParams
} from '../../src';
import { ContentParams } from '@godaddy/gasket-plugin-content';

/**
 * Mock component that uses the content params context
 */
function MockComponent() {
  const contentParams = useContentParams();
  const { currency } = contentParams;
  return <>{currency}</>;
}

describe('ContentParamsProvider', function () {
  let contentParams: Partial<ContentParams>;

  beforeEach(function () {
    contentParams = {
      currency: 'USD'
    };
  });

  afterAll(function () {
    vi.restoreAllMocks();
  });

  it('makes content context properties available', function () {
    const wrapper = render(
      <ContentParamsProvider contentParams={contentParams}>
        <MockComponent />
      </ContentParamsProvider>
    );

    expect(wrapper.asFragment()).toHaveTextContent('USD');
  });

  it('handles undefined contentParams', function () {
    const wrapper = render(
      <ContentParamsProvider>
        <MockComponent />
      </ContentParamsProvider>
    );

    expect(wrapper.asFragment()).not.toHaveTextContent('USD');
  });

  it('spreads contentParams into context value', function () {
    const params = {
      currency: 'EUR',
      locale: 'en-GB'
    };

    /**
     * Test component that uses the content params context
     */
    function TestComponent() {
      const contextParams = useContentParams();
      return <div>{JSON.stringify(contextParams)}</div>;
    }

    const wrapper = render(
      <ContentParamsProvider contentParams={params}>
        <TestComponent />
      </ContentParamsProvider>
    );

    expect(wrapper.container).toHaveTextContent('EUR');
    expect(wrapper.container).toHaveTextContent('en-GB');
  });

  describe('withContentParamsProvider', function () {
    const TargetComponent = MockComponent as typeof MockComponent & {
      bogus?: string;
      getInitialProps?: (f: any) => any;
    };

    afterEach(function () {
      delete TargetComponent.bogus;
      delete TargetComponent.getInitialProps;
    });

    it('adds display name', function () {
      const Wrapped = withContentParamsProvider()(TargetComponent);
      expect(Wrapped).toHaveProperty(
        'displayName',
        'withContentParamsProvider(MockComponent)'
      );
    });

    it('exposes target component as WrappedComponent', function () {
      const Wrapped = withContentParamsProvider()(TargetComponent);
      expect(Wrapped).toHaveProperty('WrappedComponent', TargetComponent);
      expect(Wrapped.WrappedComponent).toBe(TargetComponent);
    });

    it('hoists non-react statics', function () {
      expect(withContentParamsProvider()(TargetComponent)).not.toHaveProperty(
        'bogus'
      );
      TargetComponent.bogus = 'BOGUS';
      expect(withContentParamsProvider()(TargetComponent)).toHaveProperty(
        'bogus',
        'BOGUS'
      );
    });

    it('hoists getInitialProps if set', function () {
      expect(withContentParamsProvider()(TargetComponent)).not.toHaveProperty(
        'getInitialProps'
      );
      TargetComponent.getInitialProps = function (f) {
        return f;
      };
      expect(withContentParamsProvider()(TargetComponent)).toHaveProperty(
        'getInitialProps'
      );
    });

    describe('#render', function () {
      it('passes params from pageProps', function () {
        const WrappedApp = withContentParamsProvider()(TargetComponent);
        const wrapper = render(
          // @ts-expect-error: WrappedApp does not type pageProps, but we
          // intentionally pass it to simulate Next.js App props for testing
          <WrappedApp pageProps={{ params: contentParams }} />
        );

        expect(wrapper.asFragment()).toHaveTextContent('USD');
      });
    });
  });
});
