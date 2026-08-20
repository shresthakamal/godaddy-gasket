/// <reference types="@gasket/plugin-https" />

/** @type {import('@gasket/core').HookHandler<'preboot'>} */
export default async function preboot(gasket) {
  await gasket.actions.getAtlas();
}
