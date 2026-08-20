import { describe, it, expect, beforeEach, vi } from 'vitest';
import hook from '../lib/header-content.js';

describe('headerContent', function () {
  let mockGasket, mockConfig, mockContent;

  beforeEach(function () {
    mockConfig = {};
    mockContent = {};
    mockGasket = {
      config: mockConfig,
      logger: {
        debug: vi.fn(),
        warn: vi.fn()
      },
      actions: {
        getSharedHeader: vi.fn().mockResolvedValue({ bogus: true })
      }
    };
  });

  it('returns content', async function () {
    const content = await hook(mockGasket, mockContent, {});
    expect(content).toEqual({ data: { bogus: true } });
  });

  it('includes previous content', async function () {
    // @ts-expect-error - custom property for testing
    mockContent = { previous: 'stuff' };
    const content = await hook(mockGasket, mockContent, {});
    expect(content).toEqual({ previous: 'stuff', data: { bogus: true } });
  });

  it('handles errors', async function () {
    const error = new Error('bad things man');
    mockGasket.actions.getSharedHeader.mockRejectedValue(error);

    // @ts-expect-error - custom property for testing
    mockContent = { previous: 'stuff' };
    const content = await hook(mockGasket, mockContent, {});
    expect(content).toEqual({ previous: 'stuff', error });
  });
});
