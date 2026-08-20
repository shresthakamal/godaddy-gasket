import {
  getEnvPlids,
  getPlidFromHost,
  getPlidFromDomain,
  getProdPlidFromOte,
  isPrivateLabelHost,
  isSecureServerHost
} from '@godaddy/gasket-private-labels';

describe('@godaddy/gasket-private-labels', function () {
  it('getEnvPlid', function () {
    const envPlid = getEnvPlids('prod');
    const plid = envPlid.reamaze;
    // @ts-expect-error - getEnvPlids is not typed
    const plid2: string = envPlid.reamaze;
  });

  it('getPlidFromHost', function () {
    const plid = getPlidFromHost('www.godaddy.com');
    // @ts-expect-error - getPlidFromHost is not typed
    const plid2: string = getPlidFromHost('www.godaddy.com');
  });

  it('getPlidFromDomain', function () {
    const plid = getPlidFromDomain('godaddy.com', 'prod');
    // @ts-expect-error - getPlidFromDomain is not typed
    const plid2: string = getPlidFromDomain('godaddy.com', 'prod');
    // @ts-expect-error - getPlidFromDomain is not typed
    getPlidFromDomain('godaddy.com', 1234);
  });

  it('getProdPlidFromOte', function () {
    const plid = getProdPlidFromOte(123);
    // @ts-expect-error - getProdPlidFromOte is not typed
    const plid2: string = getProdPlidFromOte(123);
  });

  it('isPrivateLabelHost', function () {
    const isPrivateLabel = isPrivateLabelHost('www.godaddy.com');
    // @ts-expect-error - isPrivateLabelHost is not typed
    const isPrivateLabel2: string = isPrivateLabelHost('www.godaddy.com');
  });

  it('isSecureServerHost', function () {
    const isSecureServer = isSecureServerHost('www.godaddy.com');
    // @ts-expect-error - isSecureServerHost is not typed
    const isSecureServer2: string = isSecureServerHost('www.godaddy.com');
  });
});
