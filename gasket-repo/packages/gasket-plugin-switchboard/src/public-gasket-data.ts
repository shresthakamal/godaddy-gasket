import { Hook } from '@gasket/core';

const publicGasketData: Hook<'publicGasketData'> = async (
  gasket,
  priorConfig,
  ctx
) => {
  if (!gasket.config.switchboard?.enableGasketData) {
    return priorConfig;
  }

  const switchboard = await gasket.actions.getPublicSwitchboardConfig(ctx.req);
  return { ...priorConfig, switchboard };
};

export default publicGasketData;
