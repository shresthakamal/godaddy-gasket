import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as actions from '../lib/actions.js';

describe('actions', function () {
  let gasket, res, mockCspHeader, setupAction;

  beforeEach(function () {
    mockCspHeader = "default-src 'self' *.dev-godaddy.com *.dev-secureserver.net;" +
      "script-src 'self' *.dev-godaddy.com *.dev-secureserver.net;";

    setupAction = function (action) {
      return function (...args) {
        actions[action](gasket, ...args);
      };
    };

    gasket = {
      command: {
        id: 'start'
      },
      actions: {
        insertCspHash: setupAction('insertCspHash')
      },
      logger: {
        info: vi.fn(),
        warn: vi.fn()
      },
      config: {
        helmet: {
          contentSecurityPolicy: true
        }
      },
      execWaterfall: vi.fn().mockImplementation((_, helmetConfig) => helmetConfig)
    };

    res = {
      getHeader: vi.fn().mockImplementation(() => mockCspHeader),
      setHeader: vi.fn().mockImplementation((name, value) => { mockCspHeader = value; })
    };
  });

  afterEach(function () {
    vi.clearAllMocks();
  });

  describe('addCspHash', function () {
    let addCspHash;
    beforeEach(function () {
      addCspHash = setupAction('addCspHash');
    });
    it('updates response header with hash', function () {
      const before = mockCspHeader;
      addCspHash(res, 'script-src', 'bogus content');
      expect(res.setHeader).toHaveBeenCalled();
      expect(before).not.toEqual(mockCspHeader);
      expect(before).not.toContain('sha256-');

      expect(mockCspHeader).toContain(
        "default-src 'self' *.dev-godaddy.com *.dev-secureserver.net;" +
        "script-src 'self' *.dev-godaddy.com *.dev-secureserver.net " +
        "'sha256-"
      );
    });

    it('adds directive type if not set', function () {
      const before = mockCspHeader;
      addCspHash(res, 'style-src', 'bogus content');
      expect(res.setHeader).toHaveBeenCalled();
      expect(before).not.toContain('style-src');
      expect(mockCspHeader).toContain('style-src');
    });

    it('does nothing if no content-policy-header', function () {
      res.getHeader.mockReturnValueOnce();
      addCspHash(res, 'script-src', 'bogus content');
      expect(res.setHeader).not.toHaveBeenCalled();
    });

    it("does nothing if 'unsafe-inline' directive set", function () {
      mockCspHeader = mockCspHeader.slice(0, -1) + " 'unsafe-inline';";
      addCspHash(res, 'script-src', 'bogus content');
      expect(res.setHeader).not.toHaveBeenCalled();
    });
  });

  describe('insertCspHash', function () {
    let insertCspHash;
    beforeEach(function () {
      insertCspHash = setupAction('insertCspHash');
    });
    it('updates response header with hash', function () {
      const before = mockCspHeader;
      insertCspHash(res, 'script-src', "'sha256-mockShaValue'");
      expect(res.setHeader).toHaveBeenCalled();
      expect(before).not.toEqual(mockCspHeader);
      expect(before).not.toContain('sha256-');
      expect(mockCspHeader).toEqual(
        "default-src 'self' *.dev-godaddy.com *.dev-secureserver.net;" +
        "script-src 'self' *.dev-godaddy.com *.dev-secureserver.net " +
        "'sha256-mockShaValue';"  // inserted hash
      );
    });

    it('adds directive type if not set', function () {
      const before = mockCspHeader;
      insertCspHash(res, 'style-src', 'mock-css.cdn.hostname');
      expect(res.setHeader).toHaveBeenCalled();
      expect(before).not.toContain('style-src');
      expect(mockCspHeader).toContain('style-src');
      expect(mockCspHeader).toEqual(
        "default-src 'self' *.dev-godaddy.com *.dev-secureserver.net;" +
        "script-src 'self' *.dev-godaddy.com *.dev-secureserver.net;" +
        'style-src mock-css.cdn.hostname;'  // inserted hash
      );
    });

    it('does nothing if no content-policy-header', async function () {
      res.getHeader.mockReturnValueOnce();
      insertCspHash(res, 'script-src', 'bogus content');
      expect(res.setHeader).not.toHaveBeenCalled();
    });

    it("does nothing if 'unsafe-inline' directive set", async function () {
      mockCspHeader = mockCspHeader.slice(0, -1) + " 'unsafe-inline';";
      insertCspHash(res, 'script-src', "'sha256-mockShaValue'");
      expect(res.setHeader).not.toHaveBeenCalled();
    });
  });

  describe('addCspNonce', function () {
    let addCspNonce;
    beforeEach(function () {
      addCspNonce = setupAction('addCspNonce');
    });
    it('updates response header with hash', function () {
      const before = mockCspHeader;
      addCspNonce(res, 'script-src');
      expect(res.setHeader).toHaveBeenCalled();
      expect(before).not.toEqual(mockCspHeader);
      expect(before).not.toContain('sha256-');
      expect(mockCspHeader).toContain(
        "default-src 'self' *.dev-godaddy.com *.dev-secureserver.net;" +
        "script-src 'self' *.dev-godaddy.com *.dev-secureserver.net " +
        "'nonce-"  // added nonce part
      );
    });

    it('adds directive type if not set', function () {
      const before = mockCspHeader;
      addCspNonce(res, 'style-src');
      expect(res.setHeader).toHaveBeenCalled();
      expect(before).not.toContain('style-src');
      expect(mockCspHeader).toContain('style-src');
    });

    it('does nothing if no content-policy-header', function () {
      res.getHeader.mockReturnValueOnce();
      addCspNonce(res, 'script-src');
      expect(res.setHeader).not.toHaveBeenCalled();
    });

    it("does nothing if 'unsafe-inline' directive set", function () {
      mockCspHeader = mockCspHeader.slice(0, -1) + " 'unsafe-inline';";
      addCspNonce(res, 'script-src');
      expect(res.setHeader).not.toHaveBeenCalled();
    });
  });
});
