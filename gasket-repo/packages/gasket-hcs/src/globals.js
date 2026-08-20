// @ts-nocheck
import deepMerge from 'deepmerge';

/**
 * Deep merge layers of props objects
 * @param  {...object} propsLayers Layers of props to merge
 * @returns {object} Merged props
 */
function mergeProps(...propsLayers) {
  return deepMerge.all(propsLayers);
}

if (typeof window !== 'undefined') {
  (function (w) {
    w.ux = w.ux || {};
    w.ux.hcs = w.ux.hcs || {};
    w.ux.hcs.mergeProps = mergeProps;
  }(window));
}

export { mergeProps };
