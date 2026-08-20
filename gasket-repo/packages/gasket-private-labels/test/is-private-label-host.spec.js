import { isPrivateLabelHost } from '../lib/env-plid.js';

describe('isPrivateLabelHost', () => {
  it('true for known hostnames', () => {
    for (const host of ['www.godaddy.com', 'www.123-reg.co.uk', 'www.afternic.com']) {
      const results = isPrivateLabelHost(host);
      expect(results).toBeTruthy();
    }
  });

  it('true for known dev hostnames', () => {
    for (const host of ['www.dev-godaddy.com', 'www.dev-123-reg.co.uk', 'www.dev-afternic.com']) {
      const results = isPrivateLabelHost(host);
      expect(results).toBeTruthy();
    }
  });

  it('true for known test hostnames', () => {
    for (const host of ['www.test-godaddy.com', 'www.test-123-reg.co.uk', 'www.test-afternic.com']) {
      const results = isPrivateLabelHost(host);
      expect(results).toBeTruthy();
    }
  });

  it('true for other subdomains', () => {
    for (const host of ['sso.godaddy.com', 'example.123-reg.co.uk', 'bogus.afternic.com']) {
      const results = isPrivateLabelHost(host);
      expect(results).toBeTruthy();
    }
  });

  it('returns false for unknown hosts', () => {
    for (const host of ['www.gocladdy.com', 'www.123-456.co.uk', 'www.beforenic.com']) {
      const results = isPrivateLabelHost(host);
      expect(results).toBeFalsy();
    }
  });
});
