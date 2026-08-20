const withSpinner = require('../with-spinner');

/**
 * Decorate a patch function with spinner.
 * If an action throws, a fail spinner will render for the step, regardless of
 * if the spinner was started or not.
 *
 * @param {string} label - Label for the spinner
 * @param {function} fn - Action to wrap
 * @param {object} options - Options for new ora instance
 * @returns {function} decorated action
 */
function withPatchSpinner(label, fn, options = {}) {
  return withSpinner(label, fn, { indent: 4, ...options });
}

module.exports = withPatchSpinner;
