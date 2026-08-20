import { getPlidFromHost } from '../lib/env-plid.js';

describe('getPlidFromHost', () => {
  it('fetches the correct plid for hostname', () => {
    const results = getPlidFromHost('dev-123-reg.co.uk');
    expect(results).toEqual(587240);
  });

  it('fetches the correct plid for provided env', () => {
    const results = getPlidFromHost('dev-reamaze.com');
    expect(results).toEqual(443755);
  });

  it('returns undefined for unknown hostname', () => {
    const results = getPlidFromHost('test-unknown.com');
    expect(results).toBeUndefined();
  });

  it('defaults to prod plid for hostname with missing env', () => {
    const results = getPlidFromHost('fake-reamaze.com');
    expect(results).toEqual(579333);
  });

  it('handles hostnames with subdomains', () => {
    const results = getPlidFromHost('local.gasket.dev-123-reg.co.uk');
    expect(results).toEqual(587240);
  });

  it('handles hostnames with port', () => {
    const results = getPlidFromHost('local.gasket.dev-123-reg.co.uk:8443');
    expect(results).toEqual(587240);
  });


  it('returns ote plid for the host', () => {
    const results = getPlidFromHost('ote-hosteurope.es');
    expect(results).toEqual(1002767);
  });

  it('returns ote plid for afternic', () => {
    const results = getPlidFromHost('ote-afternic.com');
    expect(results).toEqual(1001836);
  });

  it('returns prod plid for afternic', () => {
    const results = getPlidFromHost('afternic.com');
    expect(results).toEqual(497036);
  });
});
