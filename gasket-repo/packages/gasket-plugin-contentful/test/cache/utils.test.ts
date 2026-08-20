import { describe, it, expect, beforeEach } from 'vitest';
import type { Props } from '../../src/types.js';
import { getCacheKey, sortObject } from '../../src/cache/utils.js';

describe('cache: utils', () => {
  let props: Props;

  beforeEach(() => {
    props = {
      clientOptions: {
        spaceKey: 'space-1',
        environment: 'master'
      },
      query: {
        'content_type': 'page',
        'sys.id': '1234',
        'include': 10,
        'limit': 1
      }
    };
  });

  describe('sortObject', () => {

    it('returns sorted object', () => {
      const results = sortObject(props);
      const resultsStr = JSON.stringify(results);

      expect(resultsStr).toEqual(JSON.stringify({
        clientOptions: {
          environment: 'master',
          spaceKey: 'space-1'
        },
        query: {
          'content_type': 'page',
          'include': 10,
          'limit': 1,
          'sys.id': '1234'
        }
      }));
    });
  });

  describe('getCacheKey', () => {
    it('returns a deterministic cache key string', () => {
      const result1 = getCacheKey(props);
      expect(result1).toEqual(expect.any(String));
      const result2 = getCacheKey(props);
      expect(result2).toEqual(result1);
    });

    it('returns consistent key with different prop ordering', () => {
      const result = getCacheKey({
        clientOptions: props.clientOptions,
        query: props.query
      });
      const reversedResult = getCacheKey({
        query: props.query,
        clientOptions: props.clientOptions
      });
      expect(result).toEqual(reversedResult);
    });

    it('returns consistent key with different props', () => {
      const results1 = getCacheKey(props);
      const results2 = getCacheKey({
        ...props,
        query: {
          ...props.query,
          limit: 2
        }
      });
      expect(results1).not.toEqual(results2);
    });

    it(`returns a different cache key when 'cacheTransformed' value is different`, () => {
      function mock(cacheTransformed: boolean) {
        return {
          ...props,
          clientOptions: {
            ...props.clientOptions,
            cacheTransformed
          }
        };
      }
      const results1 = getCacheKey(mock(true));
      const results2 = getCacheKey(mock(false));
      expect(results1).not.toEqual(results2);
    });
  });
});
