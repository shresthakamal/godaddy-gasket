/* eslint-disable no-undefined, max-nested-callbacks */
import { vi, expect } from 'vitest';

// Mock gasket data at the module level
vi.mock('@gasket/data', () => ({
  gasketData: vi.fn()
}));

const importFunction = async () => {
  const mod  = await import('../src/utils');
  return mod.retainPlidOnRoute;
};

describe('utils', () => {
  describe('retainPlidOnRoute', function () {
    let windowSpy;
    let mockHostname, mockVisitor, mockRouter, retainPlidOnRoute, mockGasketData;

    beforeEach(async function () {
      retainPlidOnRoute = await importFunction();
      mockHostname = 'dev-secureserver.net';
      mockVisitor = { plid: 2 };
      mockRouter = {
        replace: vi.fn(),
        pathname: '/forward',
        asPath: '/forward',
        query: {}
      };

      // Setup gasket data mock
      const { gasketData } = await import('@gasket/data');
      mockGasketData = gasketData;
      mockGasketData.mockReturnValue({ visitor: mockVisitor });

      // Ensure clean mock state
      vi.clearAllMocks();

      windowSpy = vi.spyOn(window, 'window', 'get');
      windowSpy.mockImplementation(() => ({
        location: {
          origin: 'https://' + mockHostname,
          hostname: mockHostname
        }
      }));
      document.getElementById = vi.fn().mockReturnValue({
        get textContent() {
          return JSON.stringify({ visitor: mockVisitor });
        }
      });
    });

    afterEach(function () {
      windowSpy.mockRestore();
      vi.resetModules();
      vi.clearAllMocks();
    });

    it('does not update route for godaddy.com', function () {
      mockHostname = 'godaddy.com';
      retainPlidOnRoute(mockRouter);
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('updates route for secureserver.net', function () {
      retainPlidOnRoute(mockRouter);
      expect(mockRouter.replace).toHaveBeenCalled();
    });

    it('replaces route when there is a valid plid', function () {
      retainPlidOnRoute(mockRouter);
      expect(mockRouter.replace).toHaveBeenCalledWith(
        { pathname: '/forward', query: { plid: 2 } },
        undefined,
        { shallow: true }
      );
    });

    it('does not replace route when invalid plid', function () {
      const invalidVisitor = { plid: 'bad' };
      mockGasketData.mockReturnValue({ visitor: invalidVisitor });
      vi.clearAllMocks(); // Clear mock call history
      retainPlidOnRoute(mockRouter);
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('does not retain plid when no visitor plid', function () {
      const emptyVisitor = {};
      mockGasketData.mockReturnValue({ visitor: emptyVisitor });
      vi.clearAllMocks(); // Clear mock call history
      retainPlidOnRoute(mockRouter);
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('does not replace plid when the router has a plid', function () {
      mockRouter.query = { plid: 2 };
      retainPlidOnRoute(mockRouter);
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    describe('dynamic routes for secureserver.net', function () {
      it('supports dynamic routes', function () {
        mockRouter.pathname = '/[id]';
        mockRouter.asPath = '/12345';
        retainPlidOnRoute(mockRouter);
        expect(mockRouter.replace).toHaveBeenCalledWith(
          { pathname: mockRouter.asPath.split('?')[0], query: { plid: 2 } },
          undefined,
          { shallow: true }
        );
      });

      it('removes dynamic route key from query', function () {
        mockRouter.pathname = '/[id]';
        mockRouter.asPath = '/12345';
        mockRouter.query = { id: 12345 };
        retainPlidOnRoute(mockRouter);
        expect(mockRouter.replace).toHaveBeenCalledWith(
          { pathname: mockRouter.asPath.split('?')[0], query: { plid: 2 } },
          undefined,
          { shallow: true }
        );
      });

      it('supports dynamic routes with additional query params', function () {
        mockRouter.pathname = '/[id]';
        mockRouter.asPath = '/12345?tab=overview';
        mockRouter.query = { tab: 'overview' };
        retainPlidOnRoute(mockRouter);
        expect(mockRouter.replace).toHaveBeenCalledWith(
          { pathname: '/12345', query: { plid: 2, tab: 'overview' } },
          undefined,
          { shallow: true }
        );
      });

      it('supports camelCase dynamic routes', function () {
        mockRouter.pathname = '/[id]/[subId]';
        mockRouter.asPath = '/12345/sub-id';
        retainPlidOnRoute(mockRouter);
        expect(mockRouter.replace).toHaveBeenCalledWith(
          { pathname: mockRouter.asPath.split('?')[0], query: { plid: 2 } },
          undefined,
          { shallow: true }
        );
      });

      it('supports kebab-case dynamic routes', function () {
        mockRouter.pathname = '/[id]/[sub-id]';
        mockRouter.asPath = '/12345/sub-id';
        retainPlidOnRoute(mockRouter);
        expect(mockRouter.replace).toHaveBeenCalledWith(
          { pathname: mockRouter.asPath.split('?')[0], query: { plid: 2 } },
          undefined,
          { shallow: true }
        );
      });

      describe('supports multiple dynamic routes & remove queries', function () {
        it('supports two levels', function () {
          mockRouter.pathname = '/[id]/[subid]';
          mockRouter.asPath = '/12345/67890';
          retainPlidOnRoute(mockRouter);
          expect(mockRouter.replace).toHaveBeenCalledWith(
            { pathname: mockRouter.asPath.split('?')[0], query: { plid: 2 } },
            undefined,
            { shallow: true }
          );
        });

        it('supports three levels', function () {
          mockRouter.pathname = '/[id]/[subid]/[subsubid]';
          mockRouter.asPath = '/12345/67890/abcde';
          retainPlidOnRoute(mockRouter);
          expect(mockRouter.replace).toHaveBeenCalledWith(
            { pathname: mockRouter.asPath.split('?')[0], query: { plid: 2 } },
            undefined,
            { shallow: true }
          );
        });

        it('supports `n` levels', function () {
          const randomNumber = Math.floor(Math.random() * 20) + 1;

          mockRouter.pathname = `/${Array.from(
            { length: randomNumber },
            (_, i) => `[sub${i}]`
          ).join('/')}`;

          mockRouter.asPath = `/${Array.from(
            { length: randomNumber },
            (_, i) => `${i}`
          ).join('/')}`;
          retainPlidOnRoute(mockRouter);
          expect(mockRouter.replace).toHaveBeenCalledWith(
            {
              pathname: mockRouter.asPath.split('?')[0],
              query: { plid: 2 }
            },
            undefined,
            { shallow: true }
          );
        });
      });
    });
  });
});
