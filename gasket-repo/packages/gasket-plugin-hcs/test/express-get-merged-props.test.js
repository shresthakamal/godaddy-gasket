/* eslint max-statements: 0, no-undefined: 0 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getMergedProps } from '../lib/express.js';

describe('getMergedProps', () => {
  const execfn = vi.fn();

  let mockGasket;

  beforeEach(() => {
    mockGasket = {
      exec: execfn,
      config: {
        hcs: {
          devMode: false
        }
      }
    };
    execfn.mockImplementation((event) => {
      if (event === 'hcsProps') return [];
      return undefined;
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns baseProps if baseProps are given', async () => {
    const baseProps = { test: 'test', two: 'two' };
    const mergedProps = await getMergedProps(mockGasket, baseProps);

    expect(mergedProps).toEqual({
      footer: {},
      header: {},
      shared: { test: 'test', two: 'two' }
    });
  });

  it('returns empty object if undefined or null baseProps are given', async () => {
    const baseProps = undefined;
    const mergedProps = await getMergedProps(mockGasket, baseProps);
    expect(mergedProps).toEqual({ footer: {}, header: {}, shared: {} });

    const nullBaseProps = null;
    const nullMergedProps = await getMergedProps(mockGasket, nullBaseProps);
    expect(nullMergedProps).toEqual({ footer: {}, header: {}, shared: {} });
  });
});
