/// <reference types="@godaddy/gasket-plugin-switchboard" />
/// <reference path="./index.d.ts" />
import { withGasketRequestCache } from '@gasket/request';

/** @type {import('@gasket/core').ActionHandler<'getTrafficData'>} */
export const getTrafficData = withGasketRequestCache(async (gasket, req) => {
  const data = {
    'loadSource': 'gasket',
    'tcc.spa': true
  };

  /** @type {import('@godaddy/gasket-plugin-traffic').TrafficOptions[]} */
  const injections = await gasket.exec('trafficDataLayer', { req });
  injections.forEach(injection => Object.assign(data, injection));

  return gasket.execWaterfall('tccData', data, { req });
});

/** @type {import('@gasket/core').ActionHandler<'getSignalsConfig'>} */
export const getSignalsConfig = withGasketRequestCache(async (gasket, req) => {
  try {
    const experimentCohorts = await gasket.actions.getExperimentCohorts?.(req) ?? {};
    const experiments = Object.entries(experimentCohorts).map(([id, variant]) => ({ id, variant }));
    // Only create config if we have experiments to avoid unnecessary set_config calls
    if (experiments.length === 0) {
      return {};
    }

    const config = {
      config: {
        experiments: experiments
      }
    };

    // Allow apps to customize the signals config
    const customizations = await gasket.exec('signalsConfig', config, { req });
    return { ...config, ...customizations };
  } catch (error) {
    gasket.logger.error('Failed to get signals config:', error);
    return {};
  }
});
