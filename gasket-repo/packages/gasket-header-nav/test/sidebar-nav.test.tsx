import React, { useState, useEffect } from 'react';
import { beforeEach, describe, expect, it, vi, Mock, afterEach } from 'vitest';
import mockRouter from 'next-router-mock';
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider';

import { act, render, waitFor } from '@testing-library/react';

import type { HeaderAPIs } from '..';
import SidebarNav, { SidebarNavProps } from '../src/sidebar-nav';

describe('<SidebarNav />', () => {
  let mockHeader: HeaderAPIs['application-sidebar'];

  beforeEach(() => {
    mockHeader = {
      updateNavigation: vi.fn(),
      updateBeforeNavHeading: vi.fn(),
      updateAfterNavHeadingLeft: vi.fn(),
      updateAfterNavHeadingRight: vi.fn(),
      updateNavHeading: vi.fn(),
      updateNavSubHeadline: vi.fn(),
      updateNavBreadcrumb: vi.fn(),
      updateNavigationTop: vi.fn(),
      updateSidebarFooter: vi.fn(),
      updateSidebarNav: vi.fn(),
      updateSidebarNavTopComponent: vi.fn(),
      updateInPageNavContainerClass: vi.fn(),
      updateWaffleLinks: vi.fn(),
      updateAccountTrayNav: vi.fn(),
      updateAccountTrayBottomNav: vi.fn(),
      updateCartComponent: vi.fn(),
      updateCartLink: vi.fn(),
      updateHelpUrl: vi.fn(),
      addCustomNotifications: vi.fn(),
      updatePrimaryActiveNavLink: vi.fn(),
      onNavLinkClick: vi.fn()
    };
    global.window = global.window || {};
    const gas: unknown[] = [];
    (gas as { push: unknown }).push = vi.fn(
      ([apiName, callback]: [string, (err: Error | null, api: unknown) => void]) => {
        if (apiName === 'header') {
          return callback(null, mockHeader);
        }
      }
    );
    Object.assign(global.window, { gas });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('navigation updater', () => {
    it('calls updateSidebarNav on mount', async () => {
      const nav = [{ key: 'home', caption: 'Home', href: '/' }];

      render(<SidebarWithMockRouter sidebarNav={nav} />);

      await waitFor(
        () => expect(mockHeader.updateSidebarNav).toHaveBeenCalledWith(nav)
      );
    });

    it('allows the footer navigation links to be updated', async () => {
      const nav = [
        { key: 'contact', caption: 'Contact Us', href: '/contact' },
        { key: 'privacy', caption: 'Privacy Policy', href: '/privacy' }
      ];

      render(<SidebarWithMockRouter sidebarFooterNav={nav} />);

      await waitFor(
        () => expect(mockHeader.updateSidebarFooter).toHaveBeenCalledWith(nav)
      );
    });

    it('allows the account tray navigation to be updated', async () => {
      const nav = [
        { key: 'password', caption: 'Update Password', href: '/password' },
        { key: 'close-account', caption: 'Close My Account', href: '/close' }
      ];

      render(<SidebarWithMockRouter accountTrayNav={nav} />);

      await waitFor(
        () => expect(mockHeader.updateAccountTrayNav).toHaveBeenCalledWith(nav)
      );
    });

    it('allows the account tray bottom navigation to be updated', async () => {
      const nav = [
        { key: 'terms', caption: 'Terms of Service', href: '/terms' },
        { key: 'cookies', caption: 'Cookie Settings', href: '/cookies' }
      ];

      render(<SidebarWithMockRouter accountTrayBottomNav={nav} />);

      await waitFor(
        () => expect(mockHeader.updateAccountTrayBottomNav).toHaveBeenCalledWith(nav)
      );
    });

    it('allows updating the in-page navigation', async () => {
      const inPageNav = [
        { key: 'dashboard', caption: 'Dashboard', href: '/dashboard' },
        { key: 'reports', caption: 'Reports', href: '/reports' }
      ];

      render(<SidebarWithMockRouter inPageNav={inPageNav} />);

      await waitFor(
        () => expect(mockHeader.updateNavigation).toHaveBeenCalledWith(inPageNav)
      );
    });

    it('allows updating the in-page right navigation', async () => {
      const inPageRightNav = [
        { key: 'dashboard', caption: 'Dashboard', href: '/dashboard' },
        { key: 'reports', caption: 'Reports', href: '/reports' }
      ];

      render(<SidebarWithMockRouter inPageRightNav={inPageRightNav} />);

      await waitFor(
        () => expect(mockHeader.updateNavigation).toHaveBeenCalledWith(inPageRightNav, true)
      );
    });

    it('allows setting a CSS class on the in-page nav container', async () => {
      const className = 'custom-in-page-nav';

      render(<SidebarWithMockRouter inPageNavClassName={className} />);

      await waitFor(
        () => expect(mockHeader.updateInPageNavContainerClass).toHaveBeenCalledWith(
          className
        )
      );
    });

    it('allows updating the top navigation', async () => {
      const topNav: SidebarNavProps['topNav'] = [
        <div key='widget'>Some Widget</div>,
        { key: 'dashboard', caption: 'Dashboard', href: '/dashboard' },
        { key: 'reports', caption: 'Reports', href: '/reports' }
      ];

      render(<SidebarWithMockRouter topNav={topNav} />);

      await waitFor(
        () => expect(mockHeader.updateNavigationTop).toHaveBeenCalledWith(topNav)
      );
    });

    it('allows updating the back link (breadcrumb)', async () => {
      const breadcrumb = { text: 'Back', href: '/a' };

      render(<SidebarWithMockRouter backLink={breadcrumb} />);

      await waitFor(
        () => expect(mockHeader.updateNavBreadcrumb).toHaveBeenCalled()
      );

      await act(async () => {
        const callArg = (mockHeader.updateNavBreadcrumb as Mock).mock.calls[0][0];
        callArg.onClick({ preventDefault: vi.fn() } as unknown as React.MouseEvent);
      });

      expect(mockRouter.asPath).toEqual('/a');
    });
  });

  describe('router integration', () => {
    it('uses client-side navigation for non-absolute routes', async () => {
      const nav = [
        { key: 'home', caption: 'Home', href: '/' },
        { key: 'about', caption: 'About', href: '/about' }
      ];

      render(<SidebarWithMockRouter sidebarNav={nav} />);
      await waitFor(
        () => expect(mockHeader.onNavLinkClick).toHaveBeenCalled()
      );

      await act(() => {
        // Get the function registered for nav link clicks
        const clickHandlerFactory = (mockHeader.onNavLinkClick as Mock).mock
          .calls[0][0];
        const clickRegisterer = clickHandlerFactory();

        // Simulate clicking the "About" link
        const aboutLink = nav[1];
        const aboutClickHandler = clickRegisterer('about-link-key', aboutLink);
        aboutClickHandler({ preventDefault: vi.fn() } as unknown as React.MouseEvent);
      });

      expect(mockRouter.asPath).toEqual('/about');

      await waitFor(() =>
        expect(mockHeader.updatePrimaryActiveNavLink)
          .toHaveBeenCalledWith(expect.stringMatching(/\/about$/))
      );
    });

    it('does not use client-side navigation for absolute routes', async () => {
      const nav = [
        { key: 'home', caption: 'Home', href: '/' },
        { key: 'help', caption: 'Help', href: 'https://help.example.com/' }
      ];

      render(<SidebarWithMockRouter sidebarNav={nav} />);
      await waitFor(
        () => expect(mockHeader.onNavLinkClick).toHaveBeenCalled()
      );

      // Ensure there is no client-side click handler for absolute URLs
      const clickHandlerFactory = (mockHeader.onNavLinkClick as Mock).mock
        .calls[0][0];
      const clickRegisterer = clickHandlerFactory();
      const helpLink = nav[1];
      const helpClickHandler = clickRegisterer('help-link-key', helpLink);

      expect(helpClickHandler).toBeUndefined();
    });
  });

  it('allows the component above the sidebar nav to be updated', async () => {
    const someContent = <div>Some Content</div>;

    render(<SidebarWithMockRouter sidebarNavTopComponent={someContent} />);

    await waitFor(
      () => expect(mockHeader.updateSidebarNavTopComponent).toHaveBeenCalled()
    );

    // Ensure the function that was passed in returns the component
    const updateCallArg = (mockHeader.updateSidebarNavTopComponent as Mock)
      .mock.calls[0][0];
    expect(updateCallArg()).toBe(someContent);
  });

  it('allows the help URL to be updated', async () => {
    const helpUrl = 'https://help.example.com/';

    render(<SidebarWithMockRouter helpUrl={ helpUrl } />);

    await waitFor(
      () => expect(mockHeader.updateHelpUrl).toHaveBeenCalledWith(helpUrl, '_blank')
    );
  });

  describe('nav heading updates', () => {
    it('allows updating the heading', async () => {
      render(<SidebarWithMockRouter navHeading='Test Heading' />);

      await waitFor(() =>
        expect(mockHeader.updateNavHeading)
          .toHaveBeenCalledWith({ text: 'Test Heading' })
      );
    });

    it('allows updating content before the heading', async () => {
      const beforeContent = <div>Before Heading</div>;

      render(<SidebarWithMockRouter beforeNavHeading={beforeContent} />);

      await waitFor(
        () => expect(mockHeader.updateBeforeNavHeading).toHaveBeenCalledWith(
          beforeContent
        )
      );
    });

    it('allows updating content after the heading, on the left', async () => {
      const content = <div>Content</div>;

      render(<SidebarWithMockRouter afterNavHeadingLeft={content} />);

      await waitFor(
        () => expect(mockHeader.updateAfterNavHeadingLeft).toHaveBeenCalledWith(
          content
        )
      );
    });

    it('allows updating content after the heading, on the right', async () => {
      const content = <div>Content</div>;

      render(<SidebarWithMockRouter afterNavHeadingRight={content} />);

      await waitFor(
        () => expect(mockHeader.updateAfterNavHeadingRight).toHaveBeenCalledWith(
          content
        )
      );
    });

    it('allows updating the sub-headline with text', async () => {
      render(<SidebarWithMockRouter navSubHeadline='Sub-headline' />);

      await waitFor(() =>
        expect(mockHeader.updateNavSubHeadline)
          .toHaveBeenCalledWith({ text: 'Sub-headline' })
      );
    });

    it('allows updating the sub-headline with a React node', async () => {
      const content = <div>Sub-headline</div>;

      render(<SidebarWithMockRouter navSubHeadline={ content } />);

      await waitFor(() =>
        expect(mockHeader.updateNavSubHeadline)
          .toHaveBeenCalledWith(content)
      );
    });
  });

  describe('cart updates', () => {
    it('allows updating the cart component', async () => {
      const cartComponent = <div>Cart</div>;

      render(<SidebarWithMockRouter cartComponent={cartComponent} />);

      await waitFor(
        () => expect(mockHeader.updateCartComponent).toHaveBeenCalledWith(cartComponent)
      );
    });

    it('allows updating the cart URL', async () => {
      const cartUrl = 'https://some.godaddy.cart/';

      render(<SidebarWithMockRouter cartUrl={cartUrl} />);

      await waitFor(
        () => expect(mockHeader.updateCartLink).toHaveBeenCalledWith(cartUrl)
      );
    });
  });

  it('allows editing waffle links', async () => {
    const waffleTopLinks = [
      {
        key: 'spaq-dashboard',
        eid: 'waffle.spaq_dashboard.link.click',
        href: 'https://spaq.gdcorp.tools/',
        caption: 'SPAQ Dashboard'
      }
    ];

    const waffleQuickLinks = [
      {
        key: 'perf-quick-links',
        eid: 'waffle.Perf_quick_links.link.click',
        href: 'https://github.secureserver.net/rigor/spaq-program/blob/master/getting-started/perf-quick-links.md',
        caption: 'Perf-quick-links'
      }
    ];

    render(
      <SidebarWithMockRouter
        waffleTopLinks={waffleTopLinks}
        waffleQuickLinks={waffleQuickLinks}
      />
    );

    await waitFor(
      () => expect(mockHeader.updateWaffleLinks).toHaveBeenCalledWith({
        topLinks: waffleTopLinks,
        quickLinks: waffleQuickLinks
      })
    );
  });

  /**
   * A helper component to provide a mock Next.js router context.
   * @param {Omit<SidebarNavProps, 'currentUrl' | 'onNavigate'>} props - The properties for the SidebarNav component.
   * @returns {React.ReactNode} The SidebarNav component wrapped with a mock router.
   */
  function SidebarWithMockRouter(props: Omit<SidebarNavProps, 'currentUrl' | 'onNavigate'>) {
    const [currentUrl, setCurrentUrl] = useState(mockRouter.asPath);

    useEffect(() => {
      const handleRouteChange = () => {
        setCurrentUrl(mockRouter.asPath);
      };

      mockRouter.events.on('routeChangeComplete', handleRouteChange);
      return () => {
        mockRouter.events.off('routeChangeComplete', handleRouteChange);
      };
    }, []);

    return (
      <MemoryRouterProvider>
        <SidebarNav
          currentUrl={currentUrl}
          onNavigate={mockRouter.push}
          {...props}
        />
      </MemoryRouterProvider>
    );
  }
});
