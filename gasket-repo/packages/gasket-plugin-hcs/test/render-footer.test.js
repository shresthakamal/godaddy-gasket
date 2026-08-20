/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import renderFooter from '../lib/render-footer.js';
import path from 'path';

import getSSR from './__test__/ssr.js';
import props from './__test__/props.js';
vi.mock('../lib/utils', () => ({
  getPackageName: vi.fn(() => 'index')
}));

describe('Footer component', () => {
  const mockGasket = {
    config: {
      root: path.join(__dirname, '..', 'generator'),
      hcs: {
        devMode: false
      }
    }
  };

  it('renders', async () => {
    const { container } = await renderFooter(mockGasket, getSSR('FooterComponent'));
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders with manifest HOC', async () => {
    const { container } = await renderFooter(mockGasket, getSSR('Footer'), {
      props
    });

    expect(container.firstChild).toMatchSnapshot();
  });
});
