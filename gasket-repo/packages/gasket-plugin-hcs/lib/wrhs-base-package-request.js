/// <reference types="@gasket/plugin-metadata" />

import { DEFAULT_VARIANTS } from './constants.js';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Returns a list of base package assets that need to be fetched from warehouse
 * @type {import('./internal').wrhsBasePackageRequest}
 */
export default function wrhsBasePackageRequest(gasket) {

  const { name, version } = require(path.join(gasket.config.root, 'package.json'));
  const { variant = '_default' } = gasket.config.wrhs || {};

  let acceptedVariants;
  if (DEFAULT_VARIANTS.includes(variant)) {
    acceptedVariants = DEFAULT_VARIANTS;
  } else {
    acceptedVariants = [variant, ...DEFAULT_VARIANTS];
  }

  return {
    name,
    version,
    acceptedVariants: [...new Set(acceptedVariants)] // ensure no duplicates
  };
}

