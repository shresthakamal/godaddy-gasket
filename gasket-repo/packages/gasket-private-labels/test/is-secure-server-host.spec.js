import { isSecureServerHost } from '../lib/env-plid.js';


describe('isSecureServerHost', () => {
  it('true for known hostnames', () => {
    for (const host of ['www.secureserver.net']) {
      const results = isSecureServerHost(host);
      expect(results).toBeTruthy();
    }
  });

  it('true for known dev hostnames', () => {
    for (const host of ['www.dev-secureserver.net']) {
      const results = isSecureServerHost(host);
      expect(results).toBeTruthy();
    }
  });

  it('true for known test hostnames', () => {
    for (const host of ['www.test-secureserver.net']) {
      const results = isSecureServerHost(host);
      expect(results).toBeTruthy();
    }
  });

  it('true for other subdomains', () => {
    for (const host of ['sso.secureserver.net', 'example.secureserver.net', 'bogus.secureserver.net']) {
      const results = isSecureServerHost(host);
      expect(results).toBeTruthy();
    }
  });

  it('returns false for unknown hosts', () => {
    for (const host of ['www.secureserver.com', 'www.godaddy.com', 'www.bogus.com']) {
      const results = isSecureServerHost(host);
      expect(results).toBeFalsy();
    }
  });
});
