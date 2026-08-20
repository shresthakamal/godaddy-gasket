import { nonExactActiveCheck } from '../src';

describe('The non-exact active check', () => {
  it('returns false for absolute URLs', () => {
    expect(nonExactActiveCheck({ href: 'https://some.url/' }, '/')).toBe(false);
  });

  it('returns true if the query string does not match', () => {
    expect(nonExactActiveCheck({ href: '/foo' }, '/foo?bar=baz')).toBe(true);
  });

  it('returns true for exact URL matches', () => {
    expect(nonExactActiveCheck({ href: '/foo' }, '/foo')).toBe(true);
  });

  it('returns false for non matching URLs', () => {
    expect(nonExactActiveCheck({ href: '/foo' }, '/bar')).toBe(false);
  });
});
