import lodash from 'lodash';
const { merge } = lodash;
import type { Gasket } from '@gasket/core';
import type { Client } from '@switchboard/client';
import { withGasketRequestCache, type GasketRequest } from '@gasket/request';
import { getCachedClientOptions } from './utils/config.js';

const groupPrefix = /^(.*\|)*/;

let switchboardClient: Client | Promise<Client> | null = null;

/**
 * Get the Switchboard client for the given Gasket instance.
 */
async function getSwitchboardClient(gasket: Gasket) {
  await gasket.isReady;
  const { startClient } = await import('@switchboard/client');

  if (gasket.config.switchboard?.enable === false) return null;

  if (!switchboardClient) {
    const promise = startClient(getCachedClientOptions(gasket));

    promise.then(client => {
      switchboardClient = client;
    });

    switchboardClient = promise;
  }

  return switchboardClient;
}

const getPerAppConfig = withGasketRequestCache(async (gasket, req) => {
  const clientOptions = getCachedClientOptions(gasket);
  const { dataRetrieval = {} } = clientOptions;

  const [client, params] = await Promise.all([
    gasket.actions.getSwitchboardClient(),
    getConfigParameters(gasket, req)
  ]);

  return Object.fromEntries(
    Object
      .keys(dataRetrieval)
      .map(fqAppId => [
        fqAppId,
        client!.getValuesTree(
          fqAppId,
          '',
          params as Record<string, unknown>
        )
      ])
  );
});

const getSwitchboardConfig = withGasketRequestCache(async (gasket, req) => {
  await gasket.isReady;
  const {
    output: {
      multiApp = 'merge'
    } = {},
    overrides,
    enable = true
  } = gasket.config.switchboard ?? {};

  let perAppValues: Record<string, unknown>;
  if (overrides) {
    perAppValues = overrides;
  } else {
    const isEnabled =
      enable === true
      || (typeof enable === 'function' && await enable({ req }));

    if (!isEnabled) {
      return {};
    }

    perAppValues = await getPerAppConfig(gasket, req);
  }

  const switchboardConfig = multiApp === 'merge'
    ? merge({}, ...Object.values(perAppValues))
    : Object.fromEntries(
      Object.entries(perAppValues).map(
        ([fqAppId, tree]) => [fqAppId.replace(groupPrefix, ''), tree]
      )
    );

  return gasket.execWaterfall(
    'switchboardConfigOverride',
    switchboardConfig,
    { req });
});

const getPublicSwitchboardConfig = withGasketRequestCache(async (gasket, req) => {
  await gasket.isReady;
  const switchboardConfig = await gasket.actions.getSwitchboardConfig(req);

  return gasket.execWaterfall(
    'switchboardBrowserState',
    switchboardConfig,
    { req }
  );
});

const getExperimentCohorts = withGasketRequestCache(async (gasket, req) => {
  await gasket.isReady;
  const {
    overrides
  } = gasket.config.switchboard ?? {};

  let perAppValues: Record<string, unknown>;
  if (overrides) {
    perAppValues = overrides;
  } else {
    perAppValues = await getPerAppConfig(gasket, req);
  }

  return Object.fromEntries(
    Object
      .entries(perAppValues.hivemind ?? {})
      .map(([fqAppId, { cohortId }]) => [fqAppId, cohortId])
  );
});

/**
 * Retrieves configuration parameters for the request, including trace ID,
 */
async function getConfigParameters(gasket: Gasket, req: GasketRequest) {
  const [
    traceId,
    visitor,
    shopperAuth
  ] = await Promise.all([
    gasket.actions.getTraceId?.(req),
    gasket.actions.getVisitor?.(req),
    gasket.actions.checkShopperAuth?.(req)
  ]);

  const trace = traceId ? { traceId } : {};
  const { shopperId, customerId } = shopperAuth?.valid ? shopperAuth.details : {};
  const shopper = shopperId ? { shopperId, customerId } : {};

  const standardParams = {
    ...trace,
    ...visitor,
    ...shopper
  } as any;

  return gasket.execWaterfall(
    'switchboardPerRequestParams',
    standardParams,
    { req }
  );
}

export default {
  getSwitchboardClient,
  getSwitchboardConfig,
  getPublicSwitchboardConfig,
  getExperimentCohorts
};

export const testClearSwitchboardClient = () => {
  switchboardClient = null;
};
