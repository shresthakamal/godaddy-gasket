import type { ComponentType, MouseEvent, MouseEventHandler, ReactNode } from 'react';

export interface LinkProps {
  /** Unique identifier for the link, used for translations */
  key: string;
  /** Link to product */
  href?: string;
  /** Query parameters to add to the URL */
  urlArgs?: Record<string, string>;
  /** Window target, e.g. _blank */
  target?: string;
  /** Event ID to track clicks */
  eid?: string;
  /** Pre-translated string to label link */
  caption: ReactNode;
  /** Title of link */
  message?: string;
  /** Action when link is clicked */
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => unknown;
}

export type Breadcrumb = {
  href: string,
  text: string,
  eid?: string,
  onClick?: MouseEventHandler
};

export interface NavigationItemProps extends LinkProps {
  badge?: {
    text?: string;
  };
  icon?: string;
  design?: string;
  id?: string;
  fullLoad?: boolean;
  active?: boolean;
  children?: Array<NavigationItemProps>;
  [key: string]: unknown; // Allow for future properties
}

export interface SidebarNavItemProps extends NavigationItemProps {
  caption: 'divider' | string;
  children?: Array<SidebarNavItemProps>;
  className?: string;
  disposition?: 'left' | 'right';
  icon?: string;
  notificationDot?: {
    show?: boolean;
    number?: number | null;
  };
  title?: ReactNode;
}

export interface GasketNavItemProps extends NavigationItemProps {
  activeCheck?: (url: string) => boolean;
}

export type CartProps = {
  /** Checkout URL */
  checkout?: string;
  /** Number of items in the cart */
  items?: number;
}

type ReplacementOrUpdate<T> = Array<T> | ((existing: Array<T>) => Array<T>);
type LinkReplacementOrUpdate = ReplacementOrUpdate<LinkProps>;
type NavReplacementOrUpdate = ReplacementOrUpdate<NavigationItemProps>;

type StandardNavAPI = {
  /**
   * Update the bottom navigation of the header.
   * @param nav - New navigation configuration
   * @param done - Optional completion callback
   */
  updateNavigation(
    nav: Array<NavigationItemProps>,
    done?: () => unknown
  ): void;
  /**
   * Update the bottom navigation of the header.
   * @param nav - New navigation configuration
   * @param right - If true, updates the right navigation instead of the bottom
   * @param done - Optional completion callback
   */
  updateNavigation(
    nav: Array<NavigationItemProps>,
    right: false,
    done?: () => unknown
  ): void;
  /**
   * Update the bottom navigation of the header.
   * @param nav - New navigation configuration
   * @param right - If true, updates the right navigation instead of the bottom
   * @param done - Optional completion callback
   */
  updateNavigation(
    nav: NavigationItemProps | Array<NavigationItemProps>,
    right: true,
    done?: () => unknown
  ): void;
}

export type HeaderAPIs = {
  'application-header': StandardNavAPI & {
    /**
     * Update the top navigation of the header.
     * @param nav - New navigation configuration
     * @param done - Optional completion callback
     */
    updateTopNavigation(
      nav: Array<NavigationItemProps>,
      done?: () => unknown
    ): void;

    /**
     * Customize the account tray products
     * @param opts - Options for updating the account tray navigation
     * @param opts.newNav - New navigation items to set in the account tray
     * @param opts.replaceAccountTrayNavLinks - If true, replaces existing links in the account tray
     */
    updateAccountTrayNav(opts: {
      newNav: Array<LinkProps>;
      replaceAccountTrayNavLinks?: boolean;
    }): void;

    /**
     * Update the number of items that are in the cart. Updates state of the
     * mounted header component.
     * @param items - Number of items that should be in the cart
     * @param [done] - Optional completion callback
     */
    updateCart(items: number, done?: () => void): void;

    /**
     * Change where the cart icon will go when clicked.
     * @param url - New URL for the cart icon
     */
    updateCartUrl(url: string): void;

    /**
     * Update cart to your own component. If no cart is wanted pass in null.
     * @param component - React component to render in the cart icon area.
     */
    updateCartComponent(component: ComponentType<CartProps> | null): void;

    /**
     * Send in custom waffle menu links. Updates state of the mounted header component.
     * @param waffleLinks - Object containing the waffle links to update
     * @param waffleLinks.topLinks
     * @param waffleLinks.quickLinks
     * @param done - Optional completion callback
     */
    updateWaffleLinks(
      waffleLinks: {
        topLinks?: Array<LinkProps>;
        quickLinks?: Array<LinkProps>;
      },
      done?: () => void
    ): void;

    /**
     * Update the help URL of the header.
     * @param helpUrl - New help URL
     * @param done - Optional completion callback
     */
    updateHelpUrl(helpUrl: string, done?: () => void): void;
  },
  'application-sidebar': StandardNavAPI & {
    /**
     * Update the sidebar navigation of the application.
     * @param nav - New navigation configuration or a function that takes the existing navigation and returns a new one
     */
    updateSidebarNav(nav: NavReplacementOrUpdate): void;
    /**
     * Update the component above the sidebar navigation.
     * @param contentFactory - Function that returns content to render above the sidebar navigation
     */
    updateSidebarNavTopComponent(contentFactory: () => ReactNode): void;
    /**
     * Update the sidebar footer of the application.
     * @param nav - New navigation configuration or a function that takes the existing navigation and returns a new one
     */
    updateSidebarFooter(nav: NavReplacementOrUpdate): void;

    /**
     * Update the top navigation of the application.
     * @param nav - New navigation items or custom content
     */
    updateNavigationTop(nav: Array<NavigationItemProps | ReactNode>): void;

    /**
     * Update the top navigation of the application.
     * @param props - new heading properties
     * @param props.text - New text for the navigation heading
     */
    updateNavHeading(props: { text: string }): void;

    /**
     * Update the area immediately before the page title on the left-most side of the horizontal navigation.
     * @param content - Content to insert
     */
    updateBeforeNavHeading(content: ReactNode): void;

    /**
     * Update the area immediately after the page title on the left ide of the horizontal navigation.
     * @param content - Content to insert
     */
    updateAfterNavHeadingLeft(content: ReactNode): void;

    /**
     * Update the area opposite the page title on the right side of the horizontal navigation on the application-sidebar.
     * @param content - Content to insert
     */
    updateAfterNavHeadingRight(content: ReactNode): void;

    /**
     * Update the subheadline above the horizontal navigation.
     * @param props - New sub-headline properties
     * @param props.text - New text for the sub-headline
     */
    updateNavSubHeadline(props: { text: string }): void;
    /**
     * Update the subheadline above the horizontal navigation.
     * @param content - Content to insert
     */
    updateNavSubHeadline(content: ReactNode): void;

    /**
     * Update the breadcrumb (back link) in the header.
     * @param breadcrumb - New breadcrumb to set
     */
    updateNavBreadcrumb(breadcrumb: Breadcrumb): void;

    /**
     * Update the in-page nav wrapper to include a custom CSS class.
     * @param className - New class name to apply to the in-page nav container
     */
    updateInPageNavContainerClass(className: string): void;

    /**
     * Update the primary active navigation item.
     * @param href - href that matches the nav item that should be active
     */
    updatePrimaryActiveNavLink(href: string): void;

    /**
     * Send in custom waffle menu links. Updates state of the mounted header component.
     * @param waffleLinks - Object containing the waffle links to update
     * @param waffleLinks.topLinks
     * @param waffleLinks.quickLinks
     */
    updateWaffleLinks(
      waffleLinks: {
        topLinks?: Array<LinkProps>;
        quickLinks?: Array<LinkProps>;
      }
    ): void;

    /**
     * Customize the account tray products
     * @param nav - New navigation items or a function that takes the existing navigation and returns a new one
     */
    updateAccountTrayNav(nav: LinkReplacementOrUpdate): void;

    /**
     * Update the account-tray bottom nav (above the footer of account-tray)
     * @param newNav - New navigation items or custom content
     */
    updateAccountTrayBottomNav(newNav: Array<LinkProps> | ReactNode): void;

    /**
     * Update cart to your own component. If no cart is wanted pass in null.
     * @param component - React component to render in the cart icon area.
     */
    updateCartComponent(component: ReactNode): void;

    /**
     * Change where the cart icon will go when clicked.
     * @param url - New URL for the cart icon
     */
    updateCartLink(url: string): void;

    /**
     * Update the help URL of the header.
     * @param helpUrl - New help URL
     * @param target - Optional target for the help URL, e.g. '_blank'
     * @param done - Optional completion callback
     */
    updateHelpUrl(helpUrl: string, target?: string, done?: () => void): void;

    /**
     * Add custom notifications to the header.
     * @param notifications - Array of notification objects to add
     */
    addCustomNotifications(
      notifications: Array<{
        title: string;
        content: string;
        category: string;
        subcategory: string;
        priority: 'High' | 'Medium' | 'Low' | 'HIGH' | 'MEDIUM' | 'LOW';
        link: string;
        viewed: boolean;
        eids?: {
          impression?: string;
          click?: string;
        }
      }>
    ): void;

    /**
     * Register a handler for when a navigation link is clicked.
     * @param handlerFactory - Returns a function that can emit an onClick handler for a navigation link
     */
    onNavLinkClick(
      handlerFactory: () => (
        key: string,
        link: NavigationItemProps
      ) => void | MouseEventHandler<HTMLAnchorElement>
    ): void;
  }
}

export type HeaderType = keyof HeaderAPIs;
export type HeaderAPI<Type extends HeaderType = HeaderType> = HeaderAPIs[Type];

declare global {
  type HeaderReadyCallback<A extends HeaderType = HeaderType> = (
    callback: (err: Error | null, api: HeaderAPI<A>) => void
  ) => void;

  interface Window {
    ux: {
      eldorado: {
        header: HeaderReadyCallback;
      },
      header: HeaderReadyCallback;
    };

    gas: Array<[string, ...unknown[]]>;

    _trfq: Array<Array<unknown>>;
  }
}

export type ActiveCheck = (
  navItem: NavigationItemProps,
  currentURL: string
) => boolean;

export interface NavigationProps {
  bottom?: Array<GasketNavItemProps>;
  right?: Array<GasketNavItemProps>;
  side?: Array<GasketNavItemProps>;
  top?: GasketNavItemProps;
  activeCheck?: ActiveCheck;
  onUpdate?: (header: HeaderAPI) => unknown;
  onClear?: (header: HeaderAPI) => unknown;
}

export type NavigationConfig<P> = NavigationProps | ((props: P) => NavigationProps);
