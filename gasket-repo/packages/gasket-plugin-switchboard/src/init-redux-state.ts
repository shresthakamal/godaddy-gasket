import { RequestLike } from '@gasket/request';
import { Hook } from '@gasket/core';

const initReduxState: Hook<'initReduxState'> = async (
  gasket,
  priorState,
  ctx
) => {
  if (!gasket.config.switchboard?.enableRedux) {
    return priorState;
  }

  const oldState = (typeof priorState === 'object') ? priorState : {};

  const switchboard = await gasket.actions.getPublicSwitchboardConfig(
    ctx.req as unknown as RequestLike
  );

  return { ...oldState, switchboard };
};

export default initReduxState;
