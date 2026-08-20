/* eslint-disable max-statements */
import React, { act } from 'react';
import { vi } from 'vitest';
import { render } from '@testing-library/react';

// Mock external dependencies
vi.mock('next/router.js', async () => await vi.importActual('next-router-mock'));

const mockRouter = (await import('next/router.js')).default;
const Navigation = (await import('../src')).default;

const ITEM_WITH_RELATIVE_HREF = 0;
const ITEM_WITH_ABSOLUTE_HREF = 1;
const ITEM_WITH_CLICK_HANDLER = 2;
const ITEM_WITH_FULL_LOAD = 3;

const NAV_ITEMS = [
  {
    caption: 'A',
    href: '/a'
  },
  {
    caption: 'B',
    href: '//something.godaddy.com/b'
  },
  {
    caption: 'C',
    href: '/c',
    onClick: (e) => e.preventDefault()
  },
  {
    caption: 'D',
    href: '/d',
    fullLoad: true
  }
];

function renderAndMount(props) {
  return render(<Navigation { ...props } />, {
    wrapper: ({ children }) => <div>{children}</div>
  });
}

function MockClickEvent() {
  return {
    preventDefault: vi.fn(),
    currentTarget: { fake: 'element' }
  };
}

describe('Navigation component', () => {
  let header;
  let mockRouterPush;

  beforeEach(() => {
    header = {
      updateNavigation: vi.fn(),
      updateTopNavigation: vi.fn(),
      updateSidebarNav: vi.fn()
    };

    global.ux = {
      eldorado: {
        header: vi.fn((callback) => {
          callback(null, header);
        })
      }
    };

    global._trfq = {
      push: vi.fn()
    };

    mockRouterPush = vi.spyOn(mockRouter, 'push');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('updates the bottom navigation after mount', () => {
    renderAndMount({ bottom: NAV_ITEMS });

    expect(header.updateNavigation).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          caption: 'A',
          href: '/a',
          active: false
        }),
        expect.objectContaining({
          caption: 'B',
          href: '//something.godaddy.com/b',
          active: false
        }),
        expect.objectContaining({
          caption: 'C',
          href: '/c',
          active: false
        }),
        expect.objectContaining({
          caption: 'D',
          href: '/d',
          active: false
        })
      ]),
      false
    );
  });

  it('updates the right navigation after mount', () => {
    renderAndMount({ right: NAV_ITEMS });

    expect(header.updateNavigation).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          caption: 'A',
          href: '/a',
          active: false
        }),
        expect.objectContaining({
          caption: 'B',
          href: '//something.godaddy.com/b',
          active: false
        }),
        expect.objectContaining({
          caption: 'C',
          href: '/c',
          active: false
        }),
        expect.objectContaining({
          caption: 'D',
          href: '/d',
          active: false
        })
      ]),
      true
    );
  });

  it('updates the side navigation after mount', () => {
    renderAndMount({ side: NAV_ITEMS });

    expect(header.updateSidebarNav).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          caption: 'A',
          href: '/a',
          active: false
        }),
        expect.objectContaining({
          caption: 'B',
          href: '//something.godaddy.com/b',
          active: false
        }),
        expect.objectContaining({
          caption: 'C',
          href: '/c',
          active: false
        }),
        expect.objectContaining({
          caption: 'D',
          href: '/d',
          active: false
        })
      ])
    );
  });

  it('updates the top navigation after mount', () => {
    renderAndMount({ top: NAV_ITEMS[0] });

    expect(header.updateTopNavigation).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          'caption': 'A',
          'href': '/a',
          'active': false,
          'data-tcc-ignore': true,
          'onClick': expect.any(Function)
        })
      ])
    );
  });

  it('injects an onClick handler which performs a router push for relative hrefs', () => {
    renderAndMount({ bottom: NAV_ITEMS });

    const items = header.updateNavigation.mock.lastCall[0];

    const item = items[ITEM_WITH_RELATIVE_HREF];
    const clickHandler = item.onClick;
    expect(typeof clickHandler).toBe('function');

    const clickEvent = new MockClickEvent();
    act(() => {
      clickHandler(clickEvent);
    });

    expect(clickEvent.preventDefault).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith(item.href);
  });

  it('supports next-routes routers', () => {
    renderAndMount({ bottom: NAV_ITEMS, router: mockRouter });

    const items = header.updateNavigation.mock.lastCall[0];
    const item = items[ITEM_WITH_RELATIVE_HREF];
    const clickHandler = item.onClick;
    const clickEvent = new MockClickEvent();
    act(() => {
      clickHandler(clickEvent);
    });

    expect(clickEvent.preventDefault).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith(item.href);
  });

  it('injects an onClick handler for nested nav items', () => {
    renderAndMount({
      bottom: [
        {
          caption: 'Parent',
          children: [{ caption: 'Child', href: '/blah' }]
        }
      ]
    });

    const items = header.updateNavigation.mock.lastCall[0];
    const parent = items[0];
    const child = parent.children[0];
    expect(typeof child.onClick).toBe('function');
  });

  it('does not inject an onClick handler for items with an absolute href', () => {
    renderAndMount({ bottom: NAV_ITEMS });

    const items = header.updateNavigation.mock.lastCall[0];

    const item = items[ITEM_WITH_ABSOLUTE_HREF];
    const clickHandler = item.onClick;
    expect(clickHandler).toBeUndefined();
  });

  it('does not inject an onClick handler if a custom onClick handler is already provided', () => {
    renderAndMount({ bottom: NAV_ITEMS });

    const items = header.updateNavigation.mock.lastCall[0];
    const item = items[ITEM_WITH_CLICK_HANDLER];
    const clickHandler = item.onClick;
    const clickEvent = { preventDefault: vi.fn() };

    act(() => {
      clickHandler(clickEvent);
    });

    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('does not inject an onClick handler if `fullLoad` is set to true with a relative href', () => {
    renderAndMount({ bottom: NAV_ITEMS });

    const items = header.updateNavigation.mock.lastCall[0];

    const item = items[ITEM_WITH_FULL_LOAD];
    const clickHandler = item.onClick;
    expect(clickHandler).toBeUndefined();
  });

  it('sets the `active` flag for items matching the current URL', () => {
    mockRouter.pathname = '/c';

    renderAndMount({ bottom: NAV_ITEMS });

    const items = header.updateNavigation.mock.lastCall[0];
    expect(items.map((item) => item.active)).toEqual([
      false,
      false,
      true,
      false
    ]);
  });

  it('allows a navigation item to specify its active state', () => {
    mockRouter.pathname = '/some/url';

    renderAndMount({
      bottom: [
        {
          caption: 'Dev',
          href: 'https://something.dev-godaddy.com/some/url',
          active: false
        },
        {
          caption: 'Test',
          href: 'https://something.test-godaddy.com/some/url',
          active: true
        },
        {
          caption: 'Prod',
          href: 'https://something.godaddy.com/some/url',
          active: false
        }
      ]
    });

    const items = header.updateNavigation.mock.lastCall[0];
    expect(items.map((item) => item.active)).toEqual([false, true, false]);
  });

  it('adds a data-tcc-ignore attribute to all nav items', () => {
    renderAndMount({ bottom: NAV_ITEMS });

    const items = header.updateNavigation.mock.lastCall[0];
    expect(items.every((item) => item['data-tcc-ignore'])).toBe(true);
  });

  it('logs a traffic click event if an `eid` is present for a nav item', () => {
    renderAndMount({
      bottom: [
        { caption: 'Tracked', href: '/tracked', eid: 'some.tracked.event' }
      ]
    });

    const item = header.updateNavigation.mock.lastCall[0][0];
    const clickHandler = item.onClick;
    const clickEvent = new MockClickEvent();

    act(() => {
      clickHandler(clickEvent);
    });

    expect(global._trfq.push).toHaveBeenCalledWith([
      'cmdLogPageEvent',
      'click',
      'some.tracked.event',
      '',
      clickEvent.currentTarget,
      clickEvent
    ]);
  });

  it('removes the `eid` prop from nav items passed to header', () => {
    renderAndMount({
      bottom: [
        { caption: 'Tracked', href: '/tracked', eid: 'some.tracked.event' }
      ]
    });

    const items = header.updateNavigation.mock.lastCall[0];
    expect(items[0]).not.toHaveProperty('eid');
  });

  it('updates the `active` flag after navigation takes place', () => {
    mockRouter.pathname = '/c';
    mockRouter.push = function () {
      this.pathname = '/a';
    };

    renderAndMount({ bottom: NAV_ITEMS });

    let items = header.updateNavigation.mock.lastCall[0];
    expect(items.map((item) => item.active)).toEqual([
      false,
      false,
      true,
      false
    ]);

    act(() => {
      items[0].onClick(new MockClickEvent());
    });
    items = header.updateNavigation.mock.lastCall[0];
    expect(items.map((item) => item.active)).toEqual([
      true,
      false,
      false,
      false
    ]);
  });

  it('used default activeCheck for navigation item active state', () => {
    mockRouter.pathname = '/foo';

    renderAndMount({
      activeCheck: (item, url) => item.href.toLowerCase() === url.toLowerCase(),
      bottom: [
        {
          caption: 'Foo',
          href: '/foo'
        },
        {
          caption: 'Blah',
          href: '/blah'
        }
      ]
    });

    const items = header.updateNavigation.mock.lastCall[0];
    expect(items.map((item) => item.active)).toEqual([true, false]);
  });

  it('supports a global custom check for navigation item active state', () => {
    mockRouter.pathname = '/C';

    renderAndMount({
      activeCheck: (item, url) => item.href.toLowerCase() === url.toLowerCase(),
      bottom: NAV_ITEMS
    });

    const items = header.updateNavigation.mock.lastCall[0];
    expect(items.map((item) => item.active)).toEqual([
      false,
      false,
      true,
      false
    ]);
  });

  it('supports per-item custom checks for navigation item active state', () => {
    mockRouter.pathname = '/blah/blah';

    renderAndMount({
      activeCheck: (item, url) => item.href.toLowerCase() === url.toLowerCase(),
      bottom: [
        { caption: 'Foo', href: '/foo' },
        {
          caption: 'Blah',
          href: '/blah',
          activeCheck: (url) => url.startsWith('/blah')
        }
      ]
    });

    const items = header.updateNavigation.mock.lastCall[0];
    expect(items.map((item) => item.active)).toEqual([false, true]);
  });

  it('updates navigation items if they change', () => {
    const { rerender } = renderAndMount({ bottom: NAV_ITEMS });
    header.updateNavigation.mockReset();

    rerender(<Navigation bottom={ NAV_ITEMS.concat([{ caption: 'foo' }]) } />);

    expect(header.updateNavigation).toHaveBeenCalled();
  });

  it('does not re-render if navigation items are equivalent', () => {
    const { rerender } = renderAndMount({ bottom: NAV_ITEMS });
    header.updateNavigation.mockReset();

    rerender(<Navigation bottom={ NAV_ITEMS } />);

    expect(header.updateNavigation).not.toHaveBeenCalled();
  });

  it('re-renders on route changes', () => {
    renderAndMount({ bottom: NAV_ITEMS });

    header.updateNavigation.mockReset();

    act(() => {
      mockRouter.events.emit('routeChangeComplete');
    });

    expect(header.updateNavigation).toHaveBeenCalled();
  });

  it('logs a console error if the header instance could not be found', () => {

    global.ux.eldorado.header = vi.fn((callback) => {
      callback(new Error('Header is not mounted'));
    });

    const consoleErrorMock = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    renderAndMount({ bottom: NAV_ITEMS });

    expect(consoleErrorMock).toHaveBeenCalledWith(expect.any(Error));
    /* eslint-restore no-console */
  });

  it('logs an error if the header is missing required functionality', () => {
    const brokenHeader = {};
    global.ux.eldorado.header = vi.fn((callback) => {
      callback(null, brokenHeader);
    });

    const consoleErrorMock = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    renderAndMount({ bottom: NAV_ITEMS });

    expect(consoleErrorMock).toHaveBeenCalledWith('Unable to update navigation', expect.any(Error));
  });

  it('clears navigaton on unmount', () => {
    const nav = renderAndMount({ bottom: NAV_ITEMS });

    header.updateNavigation.mockReset();
    header.updateTopNavigation.mockReset();

    nav.unmount();

    expect(header.updateNavigation).toHaveBeenCalledTimes(2);
    expect(header.updateTopNavigation).toHaveBeenCalled();
  });

  it('logs an error on unmount if header is missing required functionality', () => {
    const nav = renderAndMount({ bottom: NAV_ITEMS });

    const brokenHeader = {};
    header = vi.fn((callback) => {
      callback(null, brokenHeader);
    });

    const consoleErrorMock = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    nav.unmount();

    expect(consoleErrorMock).toHaveBeenCalledWith(
      'Unable to update navigation',
      expect.any(Error)
    );
  });
});
