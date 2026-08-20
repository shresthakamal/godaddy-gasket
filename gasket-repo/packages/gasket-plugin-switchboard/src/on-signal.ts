/**
 * Gasket lifecycle hook to destroy the Switchboard client.
 */
export default async function onSignal() {
  const { destroyClient } = await import('@switchboard/client');
  destroyClient('gasket');
}
