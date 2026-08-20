import { CommandRunner } from '../runners/command-runner.js';
import { RenderRunner } from '../runners/render-runner.js';
import { DocsRunner } from '../runners/docs-runner.js';
import { Reporter } from '../reporting/reporter.js';
import { Logger } from '../services/logger.js';
import {
  osFilter,
  internalFilter,
  templateFilter,
  osTemplateFilter,
  internalTemplateFilter,
  presetFilter
} from '../utils/app-type-utils.js';
import {
  getConfigFile,
  getAppFlag,
  getAppPackage
} from '../utils/package-utils.js';
import { updateProxy, removeOtel } from '../utils/proxy-utils.js';
import { createRegistryFile } from '../utils/file-utils.js';
import {
  DIRS,
  REPORT_FILES,
  APP_CATEGORIES
} from '../config/constants.js';

/**
 * Orchestrator - Manages the overall execution of tests
 * @param {object} envManager - The environment manager
 */
export class Orchestrator {
  constructor(envManager) {
    this.envManager = envManager;
    this.exitOnError = envManager.shouldExitOnError();
    this.isCI = envManager.isCI();

    const loggerOptions = envManager.getLoggerOptions();
    this.logger = new Logger(loggerOptions);

    this.commandRunner = new CommandRunner(this.exitOnError, loggerOptions);
    this.renderRunner = new RenderRunner(this.exitOnError, this.isCI, loggerOptions);
    this.docsRunner = new DocsRunner(this.exitOnError, loggerOptions);
    this.reporter = new Reporter();
  }

  /**
   * Determine which filter to use based on app type category
   * @param {string} appType - The type of app to get the filter for
   * @returns {Function} The filter function
   */
  getFilter(appType) {
    switch (appType) {
      case APP_CATEGORIES.ALL_OS:
        return osFilter;
      case APP_CATEGORIES.ALL_INTERNAL:
        return internalFilter;
      case APP_CATEGORIES.ALL_TEMPLATES:
        return templateFilter;
      case APP_CATEGORIES.ALL_OS_TEMPLATES:
        return osTemplateFilter;
      case APP_CATEGORIES.ALL_INTERNAL_TEMPLATES:
        return internalTemplateFilter;
      case APP_CATEGORIES.ALL_PRESETS:
        return presetFilter;
      default:
        return null;
    }
  }

  /**
   * Get the list of app types to process
   * @param {string} appType - The type of app to process
   * @param {string[]} allAppTypes - The list of all app types
   * @param {boolean} isSingular - Whether to process a singular app type
   * @returns {string[]} The list of app types to process
   */
  getAppTypesToProcess(appType, allAppTypes, isSingular) {
    if (isSingular) {
      return [appType];
    }

    if (appType === APP_CATEGORIES.ALL) {
      return allAppTypes;
    }

    const filter = this.getFilter(appType);
    return filter ? allAppTypes.filter(filter) : [];
  }

  /**
   * Create a Gasket application
   * @param {string} appType - The type of app to create
   * @param {boolean} useLocalPackage - Whether to use local packages
   * @returns {Promise<void>}
   */
  async createApp(appType, useLocalPackage) {
    const args = [appType];

    // Add config for presets only (templates don't use config files)
    const configFile = getConfigFile(appType);
    if (configFile) {
      args.push('--config', configFile);
    }

    // Add appropriate flag and package
    args.push(
      getAppFlag(appType, useLocalPackage),
      getAppPackage(appType, useLocalPackage, this.envManager)
    );

    await this.commandRunner.runCommand({
      bin: 'create-gasket-app',
      reportFile: REPORT_FILES.CREATE,
      appType: appType,
      args,
      options: {
        cwd: DIRS.APPS
      }
    });
  }

  /**
   * Apply CI-specific modifications
   * @param {string} appType - The type of app to apply CI modifications to
   * @returns {Promise<void>}
   */
  async applyCIModifications(appType) {
    if (this.isCI) {
      await updateProxy(appType);
      await removeOtel(appType);
    }
  }

  /**
   * Run build task
   * @param {string} appType - The type of app to run the build task for
   * @returns {Promise<void>}
   */
  async runBuild(appType) {
    await this.commandRunner.runCommand({
      bin: 'npm',
      reportFile: REPORT_FILES.BUILD,
      appType: appType,
      args: ['run', 'build'],
      options: {
        cwd: `${DIRS.APPS}/${appType}`
      }
    });
  }

  /**
   * Run test task
   * @param {string} appType - The type of app to run the test task for
   * @returns {Promise<void>}
   */
  async runTest(appType) {
    await this.commandRunner.runCommand({
      bin: 'npm',
      reportFile: REPORT_FILES.TEST,
      appType: appType,
      args: ['run', 'test'],
      options: {
        cwd: `${DIRS.APPS}/${appType}`
      }
    });
  }

  /**
   * Process a single app type
   * @param {string} appType - The type of app to process
   * @param {boolean} useLocalPackage - Whether to use local packages
   * @returns {Promise<void>}
   */
  async processAppType(appType, useLocalPackage) {
    this.logger.info(`Processing app type: ${appType}`);

    // Create app if not skipping
    if (!this.envManager.shouldSkipCreate()) {
      await this.createApp(appType, useLocalPackage);
      await this.applyCIModifications(appType);
    }

    // Run build
    if (this.envManager.shouldRun('build')) {
      await this.runBuild(appType);

      // Run start (depends on build)
      if (this.envManager.shouldRun('start')) {
        await this.renderRunner.runRender(appType, 'start');
      }
    }

    // Run local
    if (this.envManager.shouldRun('local')) {
      await this.renderRunner.runRender(appType, 'local');
    }

    // Run test
    if (this.envManager.shouldRun('test')) {
      await this.runTest(appType);
    }

    // Run docs
    if (this.envManager.shouldRun('docs')) {
      await this.docsRunner.runDocs(appType);
    }
  }

  /**
   * Process all app types
   * @param {string[]} appTypes - The list of app types to process
   * @param {boolean} useLocalPackage - Whether to use local packages
   * @returns {Promise<void>}
   */
  async processAllApps(appTypes, useLocalPackage) {
    const startTime = Date.now();

    if (!this.envManager.shouldSkipCreate()) {
      const packageType = useLocalPackage ? 'local' : 'remote';
      this.logger.info(`Using ${packageType} packages`);
    }

    // Show progress
    this.logger.box('Testing Configuration', [
      `Total Apps: ${appTypes.length}`,
      `Package Source: ${useLocalPackage ? 'Local' : 'Remote'}`,
      `CI Mode: ${this.isCI ? 'Yes' : 'No'}`,
      `Exit on Error: ${this.exitOnError ? 'Yes' : 'No'}`
    ]);

    for (let i = 0; i < appTypes.length; i++) {
      const type = appTypes[i];
      // Show progress before processing, not after
      if (appTypes.length > 1) {
        this.logger.progress(i, appTypes.length, `Processing ${type}`);
      }
      await this.processAppType(type, useLocalPackage);
    }

    // Show summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    this.logger.box('Testing Complete', [
      `Total Apps Processed: ${appTypes.length}`,
      `Duration: ${duration}s`
    ]);
  }

  /**
   * Handle special command modes
   * @param {string} mode - The mode to handle
   * @param {string[]} appTypes - The list of app types to handle
   * @returns {Promise<void>}
   */
  async handleCommandMode(mode, appTypes) {
    switch (mode) {
      case 'build_only':
        for (const type of appTypes) {
          await this.runBuild(type);
        }
        break;

      case 'test_only':
        for (const type of appTypes) {
          await this.runTest(type);
        }
        break;

      case 'render_only':
        for (const type of appTypes) {
          await this.renderRunner.runRender(type, 'local');
        }
        break;

      case 'print_reports':
        this.reporter.printReports(Object.values(REPORT_FILES));
        break;

      default:
        break;
    }
  }

  /**
   * Main execution method
   * @param {string} appType - The type of app to execute
   * @param {boolean} useLocalPackage - Whether to use local packages
   * @param {string[]} allAppTypes - The list of all app types
   * @param {boolean} isSingular - Whether to process a singular app type
   * @returns {Promise<void>}
   */
  async execute(appType, useLocalPackage, allAppTypes, isSingular) {
    // Set up registry for internal apps
    await createRegistryFile(appType, this.envManager.getInternalRegistry());

    // Get list of apps to process
    const appTypes = this.getAppTypesToProcess(appType, allAppTypes, isSingular);

    if (appTypes.length === 0) {
      console.log('No app types to process.');
      return;
    }

    // Process all apps
    await this.processAllApps(appTypes, useLocalPackage);
  }
}
