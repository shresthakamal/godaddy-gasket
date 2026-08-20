/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import renderHeader from '../lib/render-header.js';
import path from 'path';

import getSSR from './__test__/ssr.js';
import props from './__test__/props.js';
vi.mock('../lib/utils', () => ({
  getPackageName: vi.fn(() => 'index')
}));

describe('Header component', () => {
  const mockGasket = {
    config: {
      root: path.join(__dirname, '..', 'generator'),
      hcs: {
        devMode: false
      }
    }
  };

  it('renders', async () => {
    const { container } = await renderHeader(mockGasket, getSSR('HeaderComponent'));
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders with manifest HOC', async () => {
    const { container } = await renderHeader(mockGasket, getSSR('Header'), {
      props
    });

    expect(container.firstChild).toMatchSnapshot();
  });
});
