import { vi, expect } from 'vitest';

// Mock gasket data at the module level
vi.mock('@gasket/data', () => ({
  gasketData: vi.fn()
}));

const importFunction = async () => {
  const mod  = await import('../src/visitor-link');
  return mod.default;
};

describe('VisitorLink', function () {
  let windowSpy;
  let mockHostname, mockVisitor, visitorLink, mockGasketData;

  beforeEach(async function () {
    visitorLink = await importFunction();
    mockHostname = 'godaddy.com';
    mockVisitor = { plid: 2 };

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
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('normalizes href as object', function () {
    const element = visitorLink({ href: '/somewhere' });
    expect(element.props).toHaveProperty('href', {
      pathname: '/somewhere', query: {}
    });
  });

  it('retains href as object', function () {
    const element = visitorLink({
      href: {
        pathname: '/somewhere'
      }
    });
    expect(element.props).toHaveProperty('href', {
      pathname: '/somewhere', query: {}
    });
  });

  describe('for secureserver.net', function () {
    it('adds plid to query from gasketData', function () {
      mockHostname = 'secureserver.net';
      const element = visitorLink({ href: '/somewhere' });
      expect(element.props).toHaveProperty('href', {
        pathname: '/somewhere', query: {
          plid: 2
        }
      });
    });

    it('ignores other gasketData visitor data', function () {
      mockVisitor.extra = true;
      mockHostname = 'secureserver.net';
      const element = visitorLink({ href: '/somewhere' });
      expect(element.props).toHaveProperty('href', {
        pathname: '/somewhere', query: {
          plid: 2
        }
      });
    });

    it('includes other gasketData visitor data if keys set', function () {
      const visitorWithExtra = { plid: 2, extra: true };
      mockHostname = 'secureserver.net';
      mockGasketData.mockReturnValue({ visitor: visitorWithExtra });
      vi.clearAllMocks(); // Clear any cached state
      const element = visitorLink({ href: '/somewhere', visitorKeys: ['extra'] });
      expect(element.props).toHaveProperty('href', {
        pathname: '/somewhere', query: {
          plid: 2,
          extra: true
        }
      });
    });
  });

  describe('for not secureserver.net', function () {
    it('does not update query', function () {
      const element = visitorLink({ href: '/somewhere' });
      expect(element.props).toHaveProperty('href', {
        pathname: '/somewhere', query: {}
      });
    });
  });
});
