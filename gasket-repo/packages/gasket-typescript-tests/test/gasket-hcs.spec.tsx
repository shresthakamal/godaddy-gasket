import React from 'react';
import { withManifest } from '@godaddy/gasket-hcs';

describe('@godaddy/gasket-hcs', function () {

  it('withManifest - has expected API', function () {
    const UnwrappedComponent = () => <code>my component</code>;

    const Wrapped = withManifest(UnwrappedComponent);

    <Wrapped
      blacklistedBrowsers={[{ browser: 'Chrome', version: '12' }]}
      disableDeprecationBanner={true}
      hivemind={{ experimentId: 'experiment', stateFieldName: 'state', attributes: { attr: 'value' } }}
      enableHivemindProvider={true}
      market='fr-FR'
      messages={{ one: 'une' }}
      privateLabelId={1234}
      shouldAuthenticate={false}
      skipToMainContentLink={{ id: 'main', caption: 'skip' }}
      supportMatrix={{ ie: { min: '11' } }}
      target={window}
      traffic={false}
      urls={{
        gui: { href: 'http://some.place' },
        sso: {
          exitDelegation: { href: 'http://some.place' },
          restoreCookie: { href: 'http://some.place' }
        }
      }}
      whitelistedUserAgents={['Firefox']}
    />;

    const WrappedWithOptions = withManifest(UnwrappedComponent, {
      renderAccountDelegation: true,
      initCustomerState: true,
      initTraffic: true
    });

    <WrappedWithOptions />;
  });
});
