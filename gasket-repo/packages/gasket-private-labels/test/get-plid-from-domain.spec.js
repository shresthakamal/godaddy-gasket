import { getPlidFromDomain } from '../lib/env-plid.js';


describe('getPlidFromDomain', () => {
  it('fetches the correct plid for base domain', () => {
    const results = getPlidFromDomain('reamaze.com', 'prod');
    expect(results).toEqual(579333);
  });

  it('fetches the correct plid for provided env', () => {
    const results = getPlidFromDomain('reamaze.com', 'dev');
    expect(results).toEqual(443755);
  });

  it('returns undefined for unknown hostname', () => {
    const results = getPlidFromDomain('unknown.com', 'dev');
    expect(results).toBeUndefined();
  });

  it('defaults to prod plid for unknown environment', () => {
    const results = getPlidFromDomain('reamaze.com', 'fake');
    expect(results).toEqual(579333);
  });

  it('prefers env from arg vs domain', () => {
    const results = getPlidFromDomain('app.test-reamaze.com', 'dev');
    expect(results).toEqual(443755); // dev
  });

  it('handles hostnames with port', () => {
    const results = getPlidFromDomain('gasket.dev-123-reg.co.uk:8443', 'dev');
    expect(results).toEqual(587240);
  });
});
