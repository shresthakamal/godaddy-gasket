/* eslint-disable no-console */
import { useEffect, useCallback } from 'react';
import type { MouseEvent } from 'react';
import isAbsoluteURL from './is-absolute-url.js';
import defaultActiveCheck from './default-active-check.js';
import { useRouter } from 'next/router.js';
import type { NavigationProps, GasketNavItemProps, HeaderAPI } from './types.js';

/**
 * Navigation component
 */
export function Navigation({
  bottom,
  right,
  side,
  top,
  activeCheck = defaultActiveCheck,
  onUpdate,
  onClear
}: NavigationProps): null {
  const router = useRouter();

  const handleUpdate = useCallback(
    (header: HeaderAPI) => {
      if (onUpdate) {
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
        window._trfq.push([
          'cmdLogPageEvent',
          'click',
          eid,
          '',
          e.currentTarget,
          e
        ]);
      }

      if (href) {
        router.push(href);
      }
      // eslint-disable-next-line no-use-before-define
      updateNavigation();
    },
    [router]
  );

  const enhanceNavItem = useCallback(
    (item: GasketNavItemProps, currentURL: string): GasketNavItemProps => {
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
    window.ux.eldorado.header((err, header) => {
      if (err) {
        console.error(err);

        return;
      }

      try {
        const currentURL = router.pathname || router.asPath;

        if (bottom) {
          header.updateNavigation(
            bottom.map((item) => enhanceNavItem(item, currentURL)),
            false
          );
        }

        if (right) {
          header.updateNavigation(
            right.map((item) => enhanceNavItem(item, currentURL)),
            true
          );
        }

        if (side && 'updateSidebarNav' in header) {
          header.updateSidebarNav(
            side.map((item) => enhanceNavItem(item, currentURL))
          );
        }

        if (top && 'updateTopNavigation' in header) {
          header.updateTopNavigation([enhanceNavItem(top, currentURL)]);
        }

        handleUpdate(header);
      } catch (exception) {
        console.error('Unable to update navigation', exception);
      }
    });
  }, [
    bottom,
    right,
    side,
    top,
    enhanceNavItem,
    handleUpdate,
    router.pathname,
    router.asPath
  ]);

  const clearNavigation = useCallback(() => {
    window.ux.eldorado.header((err, header) => {
      if (err) {
        console.error(err);

        return;
      }

      try {
        header.updateNavigation([], false);
        header.updateNavigation([], true);
        if ('updateTopNavigation' in header) {
          header.updateTopNavigation([]);
        }
      } catch (exception) {
        console.error('Unable to update navigation', exception);
      }

      if (onClear) {
        try {
          onClear(header);
        } catch (onClearException) {
          console.error(
            'Unable to update navigation with onClear',
            onClearException
          );
        }
      }
    });
  }, [onClear]);

  useEffect(() => {
    updateNavigation();
    router.events.on('routeChangeComplete', updateNavigation);

    return () => {
      clearNavigation();
      router.events.off('routeChangeComplete', updateNavigation);
    };
  }, [updateNavigation, clearNavigation, router.events]);

  return null;
}

