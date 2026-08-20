/* eslint-disable no-undefined, @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@gasket/plugin-logger';
import type { Gasket } from '@gasket/core';
import mockPageEntry from '../fixtures/mock-page-entry.json' with { type: 'json' };
import * as contentful from 'contentful';
import { getEntries } from '../../src/utils/client.js';
import { envErrorResponse, invalidQueryErrorResponse, spaceErrorResponse } from '../fixtures/contentful-errors.js';

/**
 *
 */
function createMockEntries(count: number) {
  return Array.from({ length: count }, (_, i) => ({ sys: { id: i.toString() } }));
}

const makePaginatedReturn = (mockEntries: any, mockErrors?: Function) => (query: any) => {
  const { skip = 0, limit } = query;
  const response: any = {
    items: mockEntries.slice(skip, skip + limit),
    total: mockEntries.length,
    skip,
    limit
  };
  if (typeof mockErrors === 'function') {
    response.errors = mockErrors(response.items[0].sys.id);
  }
  return response;
};

const getEntriesReturn = {
  total: 1,
  limit: 1,
  items: [mockPageEntry]
};

const getEntriesMock = vi.fn();
const getEntriesWithAllLocalesMock = vi.fn();

vi.mock('contentful', () => ({
  createClient: vi.fn(() => ({
    getEntries: getEntriesMock,
    withAllLocales: {
      getEntries: getEntriesWithAllLocalesMock
    }
  }))
}));

const createClientMock = vi.spyOn(contentful, 'createClient');

describe('client', () => {
  let mockGasket: Gasket, mockClientParams: any, mockCustomClientParams: any, mockQuery: any;

  beforeEach(() => {
    getEntriesMock.mockClear();
    getEntriesMock.mockReturnValue(getEntriesReturn);
    getEntriesWithAllLocalesMock.mockClear();
    getEntriesWithAllLocalesMock.mockReturnValue(getEntriesReturn);
    mockGasket = {
      config: {
        env: 'test'
      },
      logger: {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
      }
    } as unknown as Gasket;
    mockClientParams = {
      space: '123',
      host: 'cdn.contentful.com',
      environment: 'master',
      accessToken: 'delivery123'
    };
    mockCustomClientParams = {};
    mockQuery = {
      content_type: 'page',
      limit: 1,
      include: 10
    };
  });

  it('forwards clientParams and query correctly', async () => {
    await getEntries(mockGasket, mockClientParams, mockCustomClientParams, mockQuery);
    expect(createClientMock).toHaveBeenCalledWith(mockClientParams);
    expect(getEntriesMock).toHaveBeenCalledWith(mockQuery);
  });

  it('returns entries', async () => {
    const { entries } = await getEntries(mockGasket, mockClientParams, mockCustomClientParams, mockQuery);
    expect(entries).toEqual([mockPageEntry]);
  });

  describe('helpful errors', () => {
    it('includes query and message for InvalidQuery errors', async () => {
      getEntriesMock.mockRejectedValueOnce(invalidQueryErrorResponse);
      await expect(getEntries(mockGasket, mockClientParams, mockCustomClientParams, mockQuery)).rejects.toThrow();
      expect(mockGasket.logger.error).toHaveBeenCalledWith(
        'contentful: request failed',
        {
          error: expect.stringMatching(/limit/),
          query: mockQuery
        }
      );
    });

    it('explains environment errors', async () => {
      getEntriesMock.mockRejectedValueOnce(envErrorResponse);
      await expect(getEntries(mockGasket, mockClientParams, mockCustomClientParams, mockQuery)).rejects.toThrow();
      expect(mockGasket.logger.error).toHaveBeenCalledWith(
        'contentful: request failed',
        {
          error: expect.stringMatching(/environment.*access token/)
        }
      );
    });

    it('explains space errors', async () => {
      getEntriesMock.mockRejectedValueOnce(spaceErrorResponse);
      await expect(getEntries(mockGasket, mockClientParams, mockCustomClientParams, mockQuery)).rejects.toThrow();
      expect(mockGasket.logger.error).toHaveBeenCalledWith(
        'contentful: request failed',
        {
          error: 'contentful: Space e0jfbtpr1w59 not found.'
        }
      );
    });
  });

  describe('withAllLocales', () => {
    it('switches client withAllLocales', async () => {
      mockCustomClientParams.withAllLocales = true;
      await getEntries(mockGasket, mockClientParams, mockCustomClientParams, mockQuery);
      expect(getEntriesWithAllLocalesMock).toHaveBeenCalled();
      expect(getEntriesMock).not.toHaveBeenCalled();
    });
    it('removes locale from query', async () => {
      mockCustomClientParams.withAllLocales = true;
      mockQuery.locale = 'en-US';
      await getEntries(mockGasket, mockClientParams, mockCustomClientParams, mockQuery);
      expect(getEntriesWithAllLocalesMock).toHaveBeenCalledWith({ ...mockQuery, locale: undefined });
    });
  });

  describe('pagination', () => {
    it('does not paginate by default', async () => {
      const mockEntries = createMockEntries(3003);
      getEntriesMock.mockImplementation(makePaginatedReturn(mockEntries));

      delete mockCustomClientParams.enablePagination;
      mockQuery.limit = 1000;

      const { entries } = await getEntries(mockGasket, mockClientParams, mockCustomClientParams, mockQuery);
      expect(entries).toHaveLength(mockQuery.limit);
    });

    it('paginates when enabled', async () => {
      const mockEntries = createMockEntries(3003);
      getEntriesMock.mockImplementation(makePaginatedReturn(mockEntries));

      mockCustomClientParams.enablePagination = true;
      mockQuery.limit = 1000;

      const { entries } = await getEntries(mockGasket, mockClientParams, mockCustomClientParams, mockQuery);
      expect(entries).toHaveLength(mockEntries.length);
    });

    it('paginates with all locales', async () => {
      const mockEntries = createMockEntries(3003);
      getEntriesWithAllLocalesMock.mockImplementation(makePaginatedReturn(mockEntries));

      mockCustomClientParams.enablePagination = true;
      mockCustomClientParams.withAllLocales = true;
      mockQuery.limit = 1000;

      const { entries } = await getEntries(mockGasket, mockClientParams, mockCustomClientParams, mockQuery);
      expect(entries).toHaveLength(mockEntries.length);
      expect(getEntriesWithAllLocalesMock).toHaveBeenCalledTimes(4);
    });

    it('logs debug for each query', async () => {
      const mockEntries = createMockEntries(3003);
      getEntriesMock.mockImplementation(makePaginatedReturn(mockEntries));

      mockCustomClientParams.enablePagination = true;
      mockQuery.limit = 1000;

      const { debug } = await getEntries(mockGasket, mockClientParams, mockCustomClientParams, mockQuery);
      expect(debug.queries[0]).toEqual(mockQuery);
      expect(debug.queries[1]).toEqual({ ...mockQuery, skip: 1000 });
      expect(debug.queries[2]).toEqual({ ...mockQuery, skip: 2000 });
      expect(debug.queries[3]).toEqual({ ...mockQuery, skip: 3000 });
    });

    it('logs errors for each query', async () => {
      const mockEntries = createMockEntries(3003);
      const mockErrors = (id: string) => [{
        sys: { id: 'notResolvable', type: 'error' },
        details: { type: 'Link', linkType: 'Entry', id }
      }];
      getEntriesMock.mockImplementation(makePaginatedReturn(mockEntries, mockErrors));

      mockCustomClientParams.enablePagination = true;
      mockQuery.limit = 1000;

      const { debug } = await getEntries(mockGasket, mockClientParams, mockCustomClientParams, mockQuery);
      expect(debug.errors).toHaveLength(4);
    });
  });
});
