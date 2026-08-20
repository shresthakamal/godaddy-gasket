const ora = require('ora');

/**
 * Decorate a create action with spinner.
 * If an action throws, a fail spinner will render for the step, regardless of
 * if the spinner was started or not.
 * @param {string} label - Label for the spinner
 * @param {Function} fn - Action to wrap
 * @param {object} options - Options for new ora instance
 * @returns {Function} decorated action
 */
function withSpinner(label, fn, options = {}) {

  /**
   * Decorated function
   * @param {object} context - Action context
   * @returns {Promise} promise
   */
  async function wrapper(context) {
    const spinner = ora({ text: label, ...options });
    spinner.start();
    try {
      await fn(context, spinner);
      if (spinner.isSpinning) spinner.succeed();
    } catch (err) {
      spinner.fail();
      throw err;
    }
  }

  wrapper.wrapped = fn;
  return wrapper;
}

module.exports = withSpinner;
