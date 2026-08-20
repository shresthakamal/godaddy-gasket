import React from 'react';
import HeaderNav, {
  withHeaderNav,
  defaultActiveCheck,
  nonExactActiveCheck
} from '@godaddy/gasket-header-nav';
import type { NavigationItemProps } from '@godaddy/gasket-header-nav';

describe('@godaddy/gasket-header-nav', function () {

  it('HeaderNav - has expected API', function () {
    const jsx = <HeaderNav
      top={{ key: 'my-key', caption: 'Title', href: '/path/to/page' }}
      bottom={[{ key: 'my-key', caption: 'Title', href: '/path/to/page' }]}
      right={[{ key: 'my-key', caption: 'Title', href: '/path/to/page' }]}
      side={[{ key: 'my-key', caption: 'Title', href: '/path/to/page' }]}
      activeCheck={(item: NavigationItemProps, current: string) => item.href === current}
    />;
  });

  it('validates navigation item props', function () {
    const navItem: NavigationItemProps = {
      href: '/path/to/page',
      // @ts-expect-error - NavigationItemProps is not typed
      eid: 23467,
      id: 'my-id',
      caption: <h1>My caption</h1>,
      fullLoad: true,
      activeCheck: (item: NavigationItemProps, current: string) => true
    };
  });

  it('supports unknown properties', function () {
    const navItem: NavigationItemProps = {
      key: 'my-key',
      href: '/path/to/page',
      eid: 'app.fancy.item.click',
      id: 'my-id',
      caption: <h1>My caption</h1>,
      fullLoad: true,
      activeCheck: (item: NavigationItemProps, current: string) => true,
      someFutureSupportedProp: 'some value'
    };
  });

  it('withHeaderNavHOC - has expected API', function () {
    const navItem: NavigationItemProps = {
      key: 'my-key',
      href: '/path/to/page',
      eid: 'app.fancy.item.click',
      id: 'my-id',
      caption: <h1>My caption</h1>,
      fullLoad: true,
      activeCheck: (item: NavigationItemProps, current: string) => true
    };

    const hoc = withHeaderNav({
      top: navItem,
      bottom: [navItem, { key: 'my-key', caption: 'Title', href: '/path/to/other/page' }],
      right: [navItem, { key: 'my-key', caption: 'Title', href: '/path/to/other/page' }],
      side: [navItem, { key: 'my-key', caption: 'Title', href: '/path/to/other/page' }],
      activeCheck: (item: NavigationItemProps, current: string) => true
    });

    // support for array of bottom items
    const hoc2 = withHeaderNav([
      navItem,
      {
        key: 'my-key',
        caption: 'Title',
        href: '/path/to/other/page'
      }
    ]);
  });

  it('defaultActiveCheck - as expected API', function () {
    const active: boolean = defaultActiveCheck({
      key: 'title',
      caption: 'Title',
      href: '/path/to/page'
    }, '/current-page');
  });

  it('nonExactActiveCheck - as expected API', function () {
    const active: boolean = nonExactActiveCheck({
      key: 'title',
      caption: 'Title',
      href: '/path/to/page'
    }, '/current-page');
  });
});
