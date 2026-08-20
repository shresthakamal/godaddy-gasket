/* eslint-env vitest/globals */
import { vi } from 'vitest';
import '@testing-library/jest-dom';

window.open = vi.fn();
window.ux = {
  data: {
    urls: {
      login: {
        href: 'https://sso.dev-godaddy.com'
      }
    }
  }
};
