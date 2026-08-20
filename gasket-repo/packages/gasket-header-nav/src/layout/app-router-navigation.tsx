/* eslint-disable no-console */
'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import type { MouseEvent } from 'react';
import isAbsoluteURL from '../is-absolute-url.js';
import defaultActiveCheck from '../default-active-check.js';
// @ts-expect-error - Next.js navigation types
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { NavigationProps, GasketNavItemProps, HeaderAPI } from '../types.js';

/**
 * Navigation component
 */
export function AppRouterNavigation({
  onUpdate,
  bottom,
  right,
  side,
  top,
  activeCheck = defaultActiveCheck,
  onClear
}: NavigationProps): null {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMounted = useRef(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const handleUpdate = useCallback(
    (header: HeaderAPI) => {
      if (onUpdate && header) {
        try {
          onUpdate(header);
        } catch (onUpdateException) {
          console.error(
            'Unable to update navigation with onUpdate',
            onUpdateException
          );
        }
      }
    },
    [onUpdate]
  );

  const handleNavItemClick = useCallback(
    (item: GasketNavItemProps, e: MouseEvent<HTMLAnchorElement>) => {
      const { href, eid } = item;

      e.preventDefault();

      if (eid) {
        try {
          window._trfq.push([
            'cmdLogPageEvent',
            'click',
            eid,
            '',
            e.currentTarget,
            e
          ]);
        } catch (error) {
          console.error('Error logging click event', error);
        }
      }

      if (href) {
        router.push(href);
      }
    },
    [router]
  );

  const enhanceNavItem = useCallback(
    (item: GasketNavItemProps, currentURL: string): GasketNavItemProps => {
      if (!item) return {} as GasketNavItemProps;

      const {
        active,
        fullLoad,
        href,
        onClick,
        activeCheck: itemActiveCheck,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        eid,
        children,
        ...otherProps
      } = item;

      const isAbsolute = isAbsoluteURL(href || '');
      const newOnClick =
        !onClick && !fullLoad && href && !isAbsolute
          ? (e: MouseEvent<HTMLAnchorElement>) => handleNavItemClick(item, e)
          : onClick;

      let newActive;

      if (typeof active === 'boolean') {
        newActive = active;
      } else if (itemActiveCheck) {
        newActive = itemActiveCheck(currentURL);
      } else {
        newActive = activeCheck(item, currentURL);
      }

      return {
        'data-tcc-ignore': true,
        href,
        'active': newActive,
        'onClick': newOnClick,
        'children': children?.map((child) => enhanceNavItem(child, currentURL)),
        ...otherProps
      };
    },
    [activeCheck, handleNavItemClick]
  );

  const updateNavigation = useCallback(() => {
    if (!isMounted.current || typeof window === 'undefined') return;

    // Make sure window.ux exists before trying to use it
    if (!window.ux || !window.ux.eldorado) {
      console.warn('window.ux.eldorado is not available');
      return;
    }

    try {
      // eslint-disable-next-line max-statements, complexity
      window.ux.eldorado.header((err, header) => {
        if (err) {
          console.error('Error accessing header:', err);
          return;
        }

        if (!header || !isMounted.current) return;

        try {
          const currentURL = pathname;

          if (bottom && Array.isArray(bottom)) {
            header.updateNavigation(
              bottom.map((item) => enhanceNavItem(item, currentURL)),
              false
            );
          }

          if (right && Array.isArray(right)) {
            header.updateNavigation(
              right.map((item) => enhanceNavItem(item, currentURL)),
              true
            );
          }

          if (side && Array.isArray(side) && 'updateSidebarNav' in header) {
            header.updateSidebarNav(
              side.map((item) => enhanceNavItem(item, currentURL))
            );
          }

          if (top && 'updateTopNavigation' in header) {
            header.updateTopNavigation([enhanceNavItem(top, currentURL)]);
          }

          handleUpdate(header);
          setIsInitialized(true);
        } catch (exception) {
          console.error('Unable to update navigation', exception);
        }
      });
    } catch (error) {
      console.error('Error in updateNavigation:', error);
    }
  }, [
    bottom,
    right,
    side,
    top,
    enhanceNavItem,
    handleUpdate,
    pathname
  ]);

  const clearNavigation = useCallback(() => {
    if (typeof window === 'undefined' || !window.ux || !window.ux.eldorado) return;

    try {
      window.ux.eldorado.header((err, header) => {
        if (err) {
          console.error('Error accessing header:', err);
          return;
        }


        try {
          header.updateNavigation([], false);
          header.updateNavigation([], true);
          if ('updateTopNavigation' in header) {
            header.updateTopNavigation([]);
          }

          if (onClear) {
            onClear(header);
          }
        } catch (exception) {
          console.error('Unable to clear navigation', exception);
        }
      });
    } catch (error) {
      console.error('Error in clearNavigation:', error);
    }
  }, [onClear]);

  // Initialize navigation when component mounts
  useEffect(() => {
    isMounted.current = true;

    // Polling function to check for window.ux availability
    const checkUxAvailability = () => {
      if (typeof window !== 'undefined' && window.ux && window.ux.eldorado) {
        updateNavigation();
        return true;
      }
      return false;
    };

    // Check immediately in case window.ux is already available
    if (!checkUxAvailability()) {
    // Start polling if window.ux is not yet available
      const interval = setInterval(() => {
        if (checkUxAvailability()) {
          clearInterval(interval); // Stop polling once window.ux is available
        }
      }, 100); // Check every 100ms
    }

    return () => {
      isMounted.current = false;
    };
  }, [updateNavigation]);


  // Update navigation when route changes
  useEffect(() => {
    if (isInitialized && isMounted.current) {
      updateNavigation();
    }
  }, [pathname, searchParams, updateNavigation, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      clearNavigation();
    };
  }, [clearNavigation]);

  return null;
}
