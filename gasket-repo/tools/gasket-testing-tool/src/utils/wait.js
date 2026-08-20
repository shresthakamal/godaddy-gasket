import { WAIT_TIMES } from '../config/constants.js';

/**
 * Wait utility function
 * @param {number} ms - The number of milliseconds to wait
 * @returns {Promise<void>} - A promise that resolves after the specified time
 */
export async function wait(ms = WAIT_TIMES.DEFAULT) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}
