import * as pkg from '../src';
import { Navigation } from '../src/navigation';
import withHeaderNav from '../src/with-header-nav';

describe('The package', () => {
  it('exposes the navigation component as a default export', () => {
    expect(pkg.default).toBe(Navigation);
  });

  it('exposes the withHeaderNav HOC', () => {
    expect(pkg.withHeaderNav).toBe(withHeaderNav);
  });
});
