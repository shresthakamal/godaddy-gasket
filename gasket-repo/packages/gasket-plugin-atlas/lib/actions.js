/// <reference types="@gasket/core" />

import { Atlas } from '@godaddy/atlas';

let atlas;

/** @type {import('./internal').ResetAtlasForTesting} */
function _resetAtlasForTesting() {
  atlas = null;
}

/** @type {import('@gasket/core').ActionHandler<'getAtlas'>} */
async function getAtlas(gasket) {
  if (!atlas) {
    // Get atlas config from gasket config, defaulting to empty object
    const atlasConfig = gasket.config.atlas || {};

    // Use atlas.env if provided, otherwise fallback to gasket.config.env
    const env = atlasConfig.env || gasket.config.env;

    // Create the builder with the environment
    const builder = Atlas.builder(env);

    // Apply version if provided (defaults to env-based version)
    if (atlasConfig.version) {
      builder.setVersion(atlasConfig.version);
    }

    // Apply custom URL if provided (defaults to version-based URL)
    if (atlasConfig.url) {
      builder.setUrl(atlasConfig.url);
    }
    // Apply custom logger if provided, otherwise use gasket logger
    if (atlasConfig.logger) {
      builder.setLogger(atlasConfig.logger);
    } else {
      builder.setLogger(gasket.logger);
    }

    // Apply JSON directly if provided (bypasses remote fetching)
    if (atlasConfig.json) {
      builder.setJson(atlasConfig.json);
    }

    // Apply update interval if provided (defaults to 10 minutes = 600000ms)
    if (typeof atlasConfig.updateInterval !== 'undefined') {
      if (atlasConfig.updateInterval === 0) {
        // Disable updates if set to 0
        builder.setNoUpdate();
      } else {
        // Set custom update interval
        builder.setUpdateInterval(atlasConfig.updateInterval);
      }
    }

    atlas = await builder.build();
  }
  return atlas;
}

export {
  getAtlas,
  _resetAtlasForTesting
};
