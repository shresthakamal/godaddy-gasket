import { ReactNode, useEffect, useState } from 'react';
import type { Breadcrumb, HeaderAPI, NavigationItemProps } from './types.js';
import isAbsoluteURL from './is-absolute-url.js';

type SidebarAPI = HeaderAPI<'application-sidebar'>;

export type NavItem = NavigationItemProps & {
  mobileOnly?: boolean;
  desktopOnly?: boolean;
};

export type SidebarNavProps = {
  // Router integration (required)
  /** Current URL path (e.g., from router.asPath or usePathname()) */
  currentUrl: string;
  /** Navigation handler (e.g., router.push) */
  onNavigate: (href: string) => void;

  // Navigation links
  sidebarNav?: Array<NavItem>;
  sidebarFooterNav?: Array<NavItem>;
  inPageNav?: Array<NavItem>;
  inPageRightNav?: Array<NavItem>;
  topNav?: Array<NavItem | ReactNode>;
  accountTrayNav?: Array<NavItem>;
  accountTrayBottomNav?: Array<NavItem>;
  backLink?: Breadcrumb;
  waffleTopLinks?: Array<NavItem>;
  waffleQuickLinks?: Array<NavItem>;

  // URLs
  helpUrl?: string;
  cartUrl?: string;

  // Additional content insertion
  beforeNavHeading?: ReactNode;
  afterNavHeadingLeft?: ReactNode;
  afterNavHeadingRight?: ReactNode;
  navHeading?: string;
  sidebarNavTopComponent?: ReactNode;
  navSubHeadline?: ReactNode;
  cartComponent?: ReactNode;

  // Styles
  inPageNavClassName?: string;
};

/**
 * Renders the sidebar navigation component.
 * @param {SidebarNavProps} props - The properties for the SidebarNav component.
 * @returns {ReactNode} The sidebar navigation component (effects only).
 */
function SidebarNav(props: SidebarNavProps) {
  const sidebar = useSidebar();

  useRouterIntegration(props.currentUrl, props.onNavigate, sidebar);
  useSidebarUpdates(sidebar, props);
  useInPageNavUpdates(sidebar, props);

  useEffect(() => {
    if (sidebar && props.topNav) {
      sidebar.updateNavigationTop?.(props.topNav);
    }
  }, [sidebar, props.topNav]);

  useNavHeadingUpdates(sidebar, props);
  useBreadcrumb(props.onNavigate, sidebar, props);
  useCartUpdates(sidebar, props);
  useAccountTrayUpdates(sidebar, props);

  useEffect(() => {
    if (sidebar && (props.waffleTopLinks || props.waffleQuickLinks)) {
      sidebar.updateWaffleLinks?.({
        topLinks: props.waffleTopLinks ?? [],
        quickLinks: props.waffleQuickLinks ?? []
      });
    }
  }, [sidebar, props.waffleTopLinks, props.waffleQuickLinks]);

  useEffect(() => {
    if (sidebar && props.helpUrl) {
      sidebar.updateHelpUrl?.(props.helpUrl, '_blank');
    }
  }, [sidebar, props.helpUrl]);

  return null;
}

/**
 * Gets the application sidebar header extension methods.
 * @returns {SidebarAPI} The application sidebar extension methods
 */
export function useSidebar() {
  const [header, setHeader] = useState<SidebarAPI | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    window.gas ??= [];
    window.gas.push(['header', (err: Error | null, h: SidebarAPI) => {
      if (cancelled) return;
      if (err) {
        // eslint-disable-next-line no-console
        return console.error('Error getting header', err);
      }

      setHeader(h);
    }]);
    return () => { cancelled = true; };
  }, []);

  return header;
}

/**
 * Integrates the router with the sidebar navigation.
 * @param {string} currentUrl - The current URL path
 * @param {(href: string) => void} onNavigate - Navigation handler function
 * @param {SidebarAPI} sidebar - The extension methods for the sidebar
 */
function useRouterIntegration(
  currentUrl: string,
  onNavigate: (href: string) => void,
  sidebar: SidebarAPI | null
) {
  useEffect(() => {
    sidebar?.onNavLinkClick?.(() => (key, link) => {
      if (!link.onClick && link.href && !isAbsoluteURL(link.href)) {
        return (evt) => {
          evt.preventDefault();
          onNavigate(link.href!);
        };
      }
    });
  }, [sidebar, onNavigate]);

  useEffect(() => {
    sidebar?.updatePrimaryActiveNavLink?.(currentUrl);
  }, [sidebar, currentUrl]);
}

/**
 * Updates the sidebar navigation based on the provided props.
 * @param {SidebarAPI} sidebar - The extension methods for the sidebar
 * @param {SidebarNavProps} props - The properties for the SidebarNav component
 */
function useSidebarUpdates(
  sidebar: SidebarAPI | null,
  props: SidebarNavProps
) {
  useEffect(() => {
    if (sidebar && props.sidebarNavTopComponent) {
      sidebar.updateSidebarNavTopComponent?.(() => props.sidebarNavTopComponent);
    }
  }, [sidebar, props.sidebarNavTopComponent]);

  useEffect(() => {
    if (sidebar && props.sidebarNav) {
      sidebar.updateSidebarNav?.(props.sidebarNav);
    }
  }, [sidebar, props.sidebarNav]);

  useEffect(() => {
    if (sidebar && props.sidebarFooterNav) {
      sidebar.updateSidebarFooter?.(props.sidebarFooterNav);
    }
  }, [sidebar, props.sidebarFooterNav]);
}

/**
 * Updates the navigation heading based on the provided props.
 * @param {SidebarAPI} sidebar - The extension methods for the sidebar
 * @param {SidebarNavProps} props - The properties for the SidebarNav component
 */
function useNavHeadingUpdates(
  sidebar: SidebarAPI | null,
  props: SidebarNavProps
) {
  useEffect(() => {
    if (sidebar && props.navHeading) {
      sidebar.updateNavHeading?.({ text: props.navHeading });
    }
  }, [sidebar, props.navHeading]);

  useEffect(() => {
    if (sidebar && props.beforeNavHeading) {
      sidebar.updateBeforeNavHeading?.(props.beforeNavHeading);
    }
  }, [sidebar, props.beforeNavHeading]);

  useEffect(() => {
    if (sidebar && props.afterNavHeadingLeft) {
      sidebar.updateAfterNavHeadingLeft?.(props.afterNavHeadingLeft);
    }
  }, [sidebar, props.afterNavHeadingLeft]);

  useEffect(() => {
    if (sidebar && props.navSubHeadline) {
      if (typeof props.navSubHeadline === 'string') {
        sidebar.updateNavSubHeadline?.({ text: props.navSubHeadline });
      } else {
        sidebar.updateNavSubHeadline?.(props.navSubHeadline);
      }
    }
  }, [sidebar, props.navSubHeadline]);

  useEffect(() => {
    if (sidebar && props.afterNavHeadingRight) {
      sidebar.updateAfterNavHeadingRight?.(props.afterNavHeadingRight);
    }
  }, [sidebar, props.afterNavHeadingRight]);
}

/**
 * Updates the in-page navigation based on the provided props.
 * @param {SidebarAPI} sidebar - The extension methods for the sidebar
 * @param {SidebarNavProps} props - The properties for the SidebarNav component
 */
function useInPageNavUpdates(
  sidebar: SidebarAPI | null,
  props: SidebarNavProps
) {
  useEffect(() => {
    if (sidebar && props.inPageNavClassName) {
      sidebar.updateInPageNavContainerClass?.(props.inPageNavClassName);
    }
  }, [sidebar, props.inPageNavClassName]);

  useEffect(() => {
    if (sidebar && props.inPageNav) {
      sidebar.updateNavigation?.(props.inPageNav);
    }
  }, [sidebar, props.inPageNav]);

  useEffect(() => {
    if (sidebar && props.inPageRightNav) {
      sidebar.updateNavigation?.(props.inPageRightNav, true);
    }
  }, [sidebar, props.inPageRightNav]);
}

/**
 * Updates the account tray navigation based on the provided props.
 * @param {SidebarAPI} sidebar - The extension methods for the sidebar
 * @param {SidebarNavProps} props - The properties for the SidebarNav component
 */
function useAccountTrayUpdates(
  sidebar: SidebarAPI | null,
  props: SidebarNavProps
) {
  useEffect(() => {
    if (sidebar && props.accountTrayNav) {
      sidebar.updateAccountTrayNav?.(props.accountTrayNav);
    }
  }, [sidebar, props.accountTrayNav]);

  useEffect(() => {
    if (sidebar && props.accountTrayBottomNav) {
      sidebar.updateAccountTrayBottomNav?.(props.accountTrayBottomNav);
    }
  }, [sidebar, props.accountTrayBottomNav]);
}

/**
 * Updates the cart component and link based on the provided props.
 * @param {SidebarAPI} sidebar - The extension methods for the sidebar
 * @param {SidebarNavProps} props - The properties for the SidebarNav component
 */
function useCartUpdates(sidebar: SidebarAPI | null, props: SidebarNavProps) {
  useEffect(() => {
    if (sidebar && props.cartComponent) {
      sidebar.updateCartComponent?.(props.cartComponent);
    }
  }, [sidebar, props.cartComponent]);

  useEffect(() => {
    if (sidebar && props.cartUrl) {
      sidebar.updateCartLink?.(props.cartUrl);
    }
  }, [sidebar, props.cartUrl]);
}

/**
 * Integrates the breadcrumb (back link) with the router.
 * @param {Function} onNavigate - Navigation handler function
 * @param {SidebarAPI} sidebar - The extension methods for the sidebar
 * @param {SidebarNavProps} props - The properties for the SidebarNav component
 */
function useBreadcrumb(
  onNavigate: (href: string) => void,
  sidebar: SidebarAPI | null,
  props: SidebarNavProps
) {
  useEffect(() => {
    if (sidebar && props.backLink) {
      let backLink = props.backLink;
      if (!isAbsoluteURL(backLink.href)) {
        const originalOnClick = backLink.onClick;
        backLink = {
          ...backLink,
          onClick: (e) => {
            e.preventDefault();
            if (originalOnClick) {
              originalOnClick(e);
            }
            onNavigate(backLink.href);
          }
        };
      }

      sidebar.updateNavBreadcrumb?.(backLink);
    }
  }, [onNavigate, sidebar, props.backLink]);
}

export default SidebarNav;
