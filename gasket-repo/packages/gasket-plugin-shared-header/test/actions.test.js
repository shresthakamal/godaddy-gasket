import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../lib/shared-header.js');
const { getHeaders } = await import('../lib/shared-header.js');
const actions = await import('../lib/actions.js');

describe('actions', () => {
  let mockGasket, mockReq;

  beforeEach(() => {
    mockReq = {};
    mockGasket = {};
  });

  it('returns expected actions', () => {
    const expected = ['getSharedHeader'];
    expected.forEach(key => expect(actions).toHaveProperty(key));
    expect(Object.keys(actions)).toHaveLength(expected.length);
  });

  describe('getSharedHeader', () => {
    let getSharedHeader;

    beforeEach(() => {
      getSharedHeader = actions.getSharedHeader;
    });

    it('returns expected', async () => {
      const mockValue = { mock: 'value' };
      // @ts-expect-error - vi.mock creates mocked function
      getHeaders.mockResolvedValue(mockValue);
      const results = await getSharedHeader(mockGasket, mockReq);
      expect(getHeaders).toHaveBeenCalledWith(mockGasket, mockReq);
      expect(results).toEqual(mockValue);
    });

    it('returns saved value when req is the same', async () => {
      const beforeValue = { before: 'value' };
      // @ts-expect-error - vi.mock creates mocked function
      getHeaders.mockResolvedValue(beforeValue);
      const firstResult = await getSharedHeader(mockGasket, mockReq);
      expect(firstResult).toBe(beforeValue);

      const afterValue = { after: 'value' };
      // @ts-expect-error - vi.mock creates mocked function
      getHeaders.mockResolvedValue(afterValue);
      const secondResult = await getSharedHeader(mockGasket, mockReq);
      expect(secondResult).toBe(beforeValue);
    });

    it('returns new value when req is not the same', async () => {
      const beforeValue = { before: 'value' };
      // @ts-expect-error - vi.mock creates mocked function
      getHeaders.mockResolvedValue(beforeValue);
      const firstResult = await getSharedHeader(mockGasket, mockReq);
      expect(firstResult).toBe(beforeValue);

      const afterValue = { after: 'value' };
      // @ts-expect-error - vi.mock creates mocked function
      getHeaders.mockResolvedValue(afterValue);
      const secondResult = await getSharedHeader(mockGasket, {});
      expect(secondResult).toBe(afterValue);
    });
  });
});
