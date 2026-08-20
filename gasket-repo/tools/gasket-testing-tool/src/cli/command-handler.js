import prompts from 'prompts';
import { COMMANDS, APP_CATEGORIES } from '../config/constants.js';
import { questions } from '../questions.js';

/**
 * CommandHandler - Processes CLI arguments and user input
 * @param {object} envManager - The environment manager
 */
export class CommandHandler {
  constructor(envManager) {
    this.envManager = envManager;
    this.args = process.argv.slice(2);
  }

  /**
   * Get all available app types
   * @returns {string[]} The list of all available app types
   */
  getAppTypes() {
    return questions[1].choices
      .filter(choice => !choice.disabled) // Filter out disabled separators
      .map(choice => choice.value)
      .filter(type =>
        type !== APP_CATEGORIES.ALL &&
        type !== APP_CATEGORIES.ALL_OS &&
        type !== APP_CATEGORIES.ALL_INTERNAL &&
        type !== APP_CATEGORIES.ALL_TEMPLATES &&
        type !== APP_CATEGORIES.ALL_OS_TEMPLATES &&
        type !== APP_CATEGORIES.ALL_INTERNAL_TEMPLATES &&
        type !== APP_CATEGORIES.ALL_PRESETS &&
        !type.startsWith('separator-') // Filter out separator values
      );
  }

  /**
   * Check if a specific command mode is requested
   * @returns {string|null} The command mode
   */
  getCommandMode() {
    const command = this.args[0];

    if (command === COMMANDS.BUILD_ONLY) return COMMANDS.BUILD_ONLY;
    if (command === COMMANDS.TEST_ONLY) return COMMANDS.TEST_ONLY;
    if (command === COMMANDS.RENDER_ONLY) return COMMANDS.RENDER_ONLY;
    if (command === COMMANDS.PRINT_REPORTS) return COMMANDS.PRINT_REPORTS;
    if (command === COMMANDS.REPORT_HTML) return COMMANDS.REPORT_HTML;
    if (command === COMMANDS.REPORT_JSON) return COMMANDS.REPORT_JSON;
    if (command === COMMANDS.REPORT_FAILURES) return COMMANDS.REPORT_FAILURES;

    return null;
  }

  /**
   * Determine app type from arguments or prompt user
   * @returns {Promise<{appType: string, useLocalPackage: boolean}>} The app type and use local package flag
   */
  async getAppType() {
    const appTypes = this.getAppTypes();

    // Check if app type is provided as argument
    if (this.args[0] === APP_CATEGORIES.ALL) {
      return {
        appType: APP_CATEGORIES.ALL,
        useLocalPackage: this.envManager.useLocalPackages()
      };
    }

    if (appTypes.includes(this.args[0])) {
      return {
        appType: this.args[0],
        useLocalPackage: this.envManager.useLocalPackages()
      };
    }

    // Prompt user if no valid argument provided
    const response = await prompts(questions);
    return {
      appType: response.appType,
      useLocalPackage: this.envManager.useLocalPackages() || response.useLocalPackage
    };
  }

  /**
   * Check if this is a singular app type (not a batch)
   * @param {string} appType - The type of app to check
   * @returns {boolean} Whether this is a singular app type
   */
  isSingularAppType(appType) {
    return appType !== APP_CATEGORIES.ALL &&
           appType !== APP_CATEGORIES.ALL_OS &&
           appType !== APP_CATEGORIES.ALL_INTERNAL &&
           appType !== APP_CATEGORIES.ALL_TEMPLATES &&
           appType !== APP_CATEGORIES.ALL_OS_TEMPLATES &&
           appType !== APP_CATEGORIES.ALL_INTERNAL_TEMPLATES &&
           appType !== APP_CATEGORIES.ALL_PRESETS;
  }
}
