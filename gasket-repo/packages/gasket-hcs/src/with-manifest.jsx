import { IntlProvider, FormattedMessage } from '@godaddy/react-mintl';
import React, { lazy, useState, useEffect } from 'react';
import { ErrorBoundary } from '@ux/header-util';
import { HivemindProvider } from '@ux/hivemind-provider';
import AccountDelegation from '@ux/account-delegation';
import SkipNavigation from '@ux/skip-navigation';
import PropTypes from 'prop-types';
import {
  useCustomerDetails,
  useOrderDetails,
  usePageConfig,
  useHivemind,
  useTraffic,
  events,
  url
} from '@ux/header-util';

import '@ux/skip-navigation/styles';

const BrowserDeprecationBanner = lazy(() =>
  import(
    /* webpackChunkName: "browser-deprecation-banner" */
    '@ux/browser-deprecation-banner'
  )
);

/**
 * React Component to render the manifest, initialize user state, traffic and
 * read page configuration. Note: it is preferred to not change this HOC's
 * functionality. Either contribute to the Gasket's HCS plugin or introduce the
 * desired functionality at a lower level. The HOC provides the Header and
 * Footer with data from the PCS, page state and/or configuration.
 * @type {import('.').withManifest}
 * @public
 */
export default function withManifest(
  WrappedComponent,
  {
    renderAccountDelegation = false,
    initCustomerState = false,
    initTraffic = false,
    additionalHeaderMethods = {},
    componentName = 'header'
  } = {}
) {
  /**
   * Manifest component wrapper.
   * @param {Partial<import('.').ManifestProps>} props Component props
   * @returns {React.ReactElement} Rendered Component.
   */
  function WithManifest({
    shouldAuthenticate = true,
    enableHivemindProvider,
    urls,
    target,
    ...props
  }) {
    let customer = {};

    const guiUrl = url.fixGuiUrl(urls.gui.href);

    // Get customer state from GUI API.
    customer = useCustomerDetails(guiUrl, {
      shouldAuthenticate: shouldAuthenticate || AccountDelegation.active,
      privateLabelId: props.privateLabelId,
      preset: props.preset,
      initCustomerState
    });

    if (customer?.customer) {
      // set the loggedIn flag to true if the customer is logged in or if the account delegation is active
      customer.loggedIn = customer.loggedIn || (renderAccountDelegation && AccountDelegation.active);
    }

    useTraffic(props.traffic, { initTraffic });

    // We need to leverage useState hook to introduce the window object as that
    // prevents hydration issues with server side rendering.
    const [hasDOM, setHasDOM] = useState(false);
    const fallbackWindow = hasDOM ? global : {};
    const win = target || fallbackWindow;

    useEffect(() => {
      if (typeof window !== 'undefined') {
        setHasDOM(true);
      }
    }, []);

    const {
      navigation: pageNav = [],
      navigationRight: pageNavRight = [],
      ...pageConfig
    } = usePageConfig(win) || {};
    const [navigation, setNavigation] = useState(pageNav);
    const [navLoadedFromPage, setNavLoadedFromPage] = useState(false);
    const [hivemindClient, setHivemindClient] = useState(null);

    // The default value in useState is only set on the first render this causes
    // navigation to be empty since pageNav is not populated until after the
    // first render
    if (!navLoadedFromPage && navigation.length === 0 && pageNav.length > 0) {
      setNavigation(pageNav);
      setNavLoadedFromPage(true);
    }

    useEffect(() => {
      events.emit('navigation:updated');
    }, [navigation]);

    const [navigationRight, setNavigationRight] = useState(pageNavRight);
    useEffect(() => {
      events.emit('navigationRight:updated');
    }, [navigationRight]);

    const headerMethods = {
      /**
       * Update header navigation
       * @param {object[]} nav Navigation items
       * @param {boolean} [right] Whether to operate on the right side of the
       * nav (default left)
       * @param {Function} [done] Callback
       */
      updateNavigation(nav, right = false, done) {
        if (typeof right === 'function') {
          done = right;
          right = false;
        }

        if (right) {
          setNavigationRight(nav.slice());
        } else {
          setNavigation(nav.slice());
        }

        if (done) {
          // NOTE: we can't really know for sure whether the effect hook that
          // triggers this event is indeed the particular effect that was
          // triggered by this state change. But this is likely fine. If we see
          // timing issues in the future, we could reconsider this -- perhaps
          // passing along the navigation object itself and comparing it to the
          // one originally passed here.
          events.once(
            (right ? 'navigationRight' : 'navigation') + ':updated',
            done
          );
        }
      },
      ...additionalHeaderMethods
    };

    useEffect(() => {
      events.emit('mount', componentName, headerMethods);
      events.emit(`mount:${componentName}`, headerMethods);
      // discuss with jonathan/daniel/xi about adding this and/or only using
      // window(removing header-util events usage above?)
      // window.dispatchEvent(new CustomEvent('mount', { details: {
      // headerMethods } }))
    }, []);

    useEffect(() => {
      if (
        enableHivemindProvider &&
        typeof window !== 'undefined' &&
        window.hivemind
      ) {
        window.hivemind
          .getClient()
          .then((client) => {
            setHivemindClient(client);
          })
          .catch((err) => {
            console.log('unable to getClient for setting Hivemind Client', err);
          });
      }
    }, [setHivemindClient]);

    const includeAccountDelegation =
      props.features?.accountDelegationBanner !== false &&
      renderAccountDelegation &&
      !!customer?.customer &&
      props.preset !== 'internal-header';

    const skipToContentSelector =
      props.skipToMainContentLink?.id || 'uxContent';

    const manifestElements = (
      <IntlProvider locale={ props.market } messages={ props.messages }>
        <div className='skip-nav-spacing'>
          {componentName === 'header' && hasDOM && (
            <ErrorBoundary onError={ (err) => props.env !== 'production' && console.error('ErrorBoundary caught error in SkipNavigation', err) }>
              <React.Suspense fallback={ <></> }>
                <FormattedMessage id='Shared:Common:SkipToMainContent'>
                  {(skipToMainContentString) => (
                    <SkipNavigation
                      skipToId={ skipToContentSelector }
                      text={
                        props.skipToMainContentLink?.caption ||
                        skipToMainContentString
                      }
                      { ...props.skipToMainContentLink?.optionalAttributes }
                    />
                  )}
                </FormattedMessage>
              </React.Suspense>
            </ErrorBoundary>
          )}
        </div>
        {includeAccountDelegation && (
          <AccountDelegation
            market={ props.market }
            messages={ props.messages }
            action={ urls.sso.exitDelegation.href }
            restoreCookie={ urls.sso.restoreCookie.href }
            customer={ customer.customer }
          />
        )}
        {componentName === 'header' && hasDOM && (
          <ErrorBoundary onError={ (err) => props.env !== 'production' && console.error('ErrorBoundary caught error in BrowserDeprecationBanner', err) }>
            <React.Suspense fallback={ <></> }>
              <BrowserDeprecationBanner
                supportMatrix={ props.supportMatrix }
                whitelistedUserAgents={ props.whitelistedUserAgents }
                disableDeprecationBanner={ props.disableDeprecationBanner }
                blacklistedBrowsers={ props.blacklistedBrowsers }
                urls={ urls }
              />
            </React.Suspense>
          </ErrorBoundary>
        )}
        <WrappedComponent
          { ...props }
          { ...pageConfig }
          { ...useHivemind(win, props.hivemind) }
          urls={ urls }
          orderId={ useOrderDetails(win) }
          customer={ customer }
          navigation={ navigation }
          navigationRight={ navigationRight }
          headerMethods={ headerMethods }
        />
      </IntlProvider>
    );

    return hivemindClient ? (
      <HivemindProvider client={ hivemindClient }>
        {manifestElements}
      </HivemindProvider>
    ) : (
      manifestElements
    );
  }

  WithManifest.propTypes = {
    blacklistedBrowsers: PropTypes.arrayOf(
      PropTypes.shape({
        browser: PropTypes.string.isRequired,
        version: PropTypes.number.isRequired
      })
    ),
    disableDeprecationBanner: PropTypes.bool,
    hivemind: PropTypes.object,
    enableHivemindProvider: PropTypes.bool,
    features: PropTypes.shape({
      accountDelegationBanner: PropTypes.bool
    }),
    market: PropTypes.string.isRequired,
    messages: PropTypes.object.isRequired,
    privateLabelId: PropTypes.number,
    preset: PropTypes.string,
    shouldAuthenticate: PropTypes.bool,
    skipToMainContentLink: PropTypes.shape({
      id: PropTypes.string,
      caption: PropTypes.string,
      optionalAttributes: PropTypes.object
    }),
    supportMatrix: PropTypes.object.isRequired,
    target: PropTypes.object,
    traffic: PropTypes.bool,
    urls: PropTypes.object.isRequired,
    whitelistedUserAgents: PropTypes.arrayOf(PropTypes.string)
  };

  WithManifest.propTypes = {
    ...WithManifest.propTypes,
    ...WrappedComponent.propTypes
  };

  WithManifest.displayName = `WithManifest(${WrappedComponent.displayName || WrappedComponent.name
  })`;

  return WithManifest;
}
