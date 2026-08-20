import * as pkg from '../../src/layout';
import withHeaderNav from '../../src/layout/with-header-nav';
import { AppRouterNavigation } from '../../src/layout/app-router-navigation';

describe('The layout package', () => {
  it('exposes the navigation component as a default export', () => {
    expect(pkg.default).toBe(AppRouterNavigation);
  });

  it('exposes the withHeaderNav HOC', () => {
    expect(pkg.withHeaderNav).toBe(withHeaderNav);
  });
});
