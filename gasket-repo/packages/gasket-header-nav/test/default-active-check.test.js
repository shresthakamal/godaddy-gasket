import { defaultActiveCheck } from '../src';

describe('The default active check', () => {
  it('returns false for absolute URLs', () => {
    expect(defaultActiveCheck({ href: 'https://some.url/' }, '/')).toBe(false);
  });

  it('returns false for non-exact URL matches', () => {
    expect(defaultActiveCheck({ href: '/foo' }, '/foo?bar=baz')).toBe(false);
  });

  it('returns true for exact URL matches', () => {
    expect(defaultActiveCheck({ href: '/foo' }, '/foo')).toBe(true);
  });

  it('returns true for non-exact URL matches containing plid param', () => {
    expect(defaultActiveCheck({ href: '/foo' }, '/foo?plid=1234')).toBe(true);
  });

  it('returns false for non-exact URL matches containing more than just plid param', () => {
    expect(defaultActiveCheck({ href: '/foo' }, '/foo?bar=baz&plid=1234')).toBe(
      false
    );
    expect(defaultActiveCheck({ href: '/foo' }, '/foo?plid=1234&bar=baz')).toBe(
      false
    );
  });
});
