/* eslint-disable no-undefined, no-undef */
import React from 'react';
import { render } from '@testing-library/react';
import * as utils from '../src/utils';
import { AuthStatus } from '../src/utils';

const proxy = { ...utils };
const redirectSpy = vi.spyOn(proxy, 'redirectTo').mockImplementation();
const mockUseAuthState = vi.fn();
window.open = vi.fn();

vi.mock('../src/use-auth-state.js', () => ({
  default: mockUseAuthState
}));

const AuthRequired = (await import('../src/auth-required.js')).default;

describe('AuthRequired', () => {
  let mockProps;

  beforeEach(() => {
    mockProps = {};
  });

  describe('When loading', () => {

    beforeEach(function () {
      mockUseAuthState.mockImplementation(() => ({ valid: false, status: AuthStatus.LOADING }));
    });

    it('renders null when loading', () => {
      const { container } = render(<AuthRequired { ...mockProps }>Hello</AuthRequired>);
      expect(container.firstChild).toBeNull();
    });

    it('renders custom loading nodes', () => {
      mockProps.loading = <span>Loading</span>;
      const { getByText } = render(<AuthRequired { ...mockProps }>Hello</AuthRequired>);
      expect(getByText('Loading')).toBeInTheDocument();
    });

    it('renders custom loading string', () => {
      mockProps.loading = 'Loading';
      const { getByText } = render(<AuthRequired { ...mockProps }>Hello</AuthRequired>);
      expect(getByText('Loading')).toBeInTheDocument();
    });
  });

  describe('When valid', () => {
    let mockDetails;

    beforeEach(function () {
      mockDetails = { foo: 'bar' };
      mockUseAuthState.mockImplementation(() => ({ valid: true, status: AuthStatus.LOADED, details: mockDetails }));
    });

    it('renders children', () => {
      const { getByText } = render(<AuthRequired { ...mockProps }>Hello</AuthRequired>);
      expect(getByText('Hello')).toBeInTheDocument();
    });

    it('injects authDetails to children', () => {
      const MockComp = vi.fn(() => <div></div>);
      render(<AuthRequired { ...mockProps } injectDetails><MockComp /></AuthRequired>);
      expect(MockComp).toHaveBeenCalledWith({ authDetails: mockDetails }, undefined);
    });
  });

  describe('When invalid', () => {
    beforeEach(() => {
      mockUseAuthState.mockImplementation(() => ({ valid: false, status: AuthStatus.LOADED }));
    });

    it('renders alt content if set', () => {
      mockProps.alt = <span>Unauthorized</span>;
      const { getByText } = render(<AuthRequired { ...mockProps }>Hello</AuthRequired>);
      expect(getByText('Unauthorized')).toBeInTheDocument();
    });

    it('does not redirect with alt content', () => {
      mockProps.alt = <span>Unauthorized</span>;
      render(<AuthRequired { ...mockProps }>Hello</AuthRequired>);
      expect(redirectSpy).not.toHaveBeenCalled();
    });

    it('does not redirect when alt is empty string', () => {
      mockProps.alt = '';
      render(<AuthRequired { ...mockProps }>Hello</AuthRequired>);
      expect(redirectSpy).not.toHaveBeenCalled();
    });

    it('does not redirect when alt is null', () => {
      mockProps.alt = null;
      render(<AuthRequired { ...mockProps }>Hello</AuthRequired>);
      expect(redirectSpy).not.toHaveBeenCalled();
    });
  });

  describe('When network error', () => {
    beforeEach(() => {
      mockUseAuthState.mockImplementation(() => ({
        valid: false,
        status: AuthStatus.ERROR,
        networkError: true
      }));
    });

    it('renders the loading fallback instead of the alt', () => {
      mockProps.loading = <span>Loading</span>;
      mockProps.alt = <span>Unauthorized</span>;
      const { getByText, queryByText } = render(<AuthRequired { ...mockProps }>Hello</AuthRequired>);
      expect(getByText('Loading')).toBeInTheDocument();
      expect(queryByText('Unauthorized')).toBeNull();
    });

    it('renders loading (no redirect) even when no alt is set', () => {
      mockProps.loading = <span>Loading</span>;
      const { getByText } = render(<AuthRequired { ...mockProps }>Hello</AuthRequired>);
      expect(getByText('Loading')).toBeInTheDocument();
      expect(redirectSpy).not.toHaveBeenCalled();
    });
  });
});
