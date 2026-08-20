/// <reference types="@godaddy/gasket-plugin-atlas" />

import { Atlas } from '@godaddy/atlas';

let atlas;

/** @type {import('./internal').getAtlas} */
export async function getAtlas(gasket) {
  if (!atlas) {
    if ('getAtlas' in gasket.actions) {
      atlas = await gasket.actions.getAtlas();
    } else {
      const builder = Atlas.builder(gasket.config.env);
      builder.setLogger(gasket.logger);
      atlas = await builder.build();
    }
  }
  return atlas;
}

/** @type {import('./internal').clearAtlas} */
export function clearAtlas() {
  atlas = null;
}
