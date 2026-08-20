import path from 'path';
import { spawn } from 'child_process';
import { createRequire } from 'module';
import { Reporter } from '../reporting/reporter.js';
import { Logger } from '../services/logger.js';
import { IGNORED_ERRORS } from '../config/constants.js';

const require = createRequire(import.meta.url);

/**
 * CommandRunner - Executes shell commands and manages their output
 * @param {boolean} exitOnError - Whether to exit on error
 * @param {object} loggerOptions - The options for the logger
 */
export class CommandRunner {
  constructor(exitOnError = false, loggerOptions = {}) {
    this.exitOnError = exitOnError;
    this.reporter = new Reporter();
    this.logger = new Logger(loggerOptions);
  }

  /**
   * Generate a human-readable display name for the command being executed
   * @param {string} bin - The command to execute
   * @param {string[]} args - The arguments to pass to the command
   * @param {string} appType - The type of app to execute the command for
   * @returns {string} The human-readable display name for the command
   */
  getDisplayName(bin, args, appType) {
    if (bin === 'create-gasket-app') {
      return `Creating ${appType}`;
    }

    if (bin === 'npm') {
      if (args[0] === 'run') {
        return `Running ${args.slice(1).join(' ')} for ${appType}`;
      }
      return `Running ${args.join(' ')} for ${appType}`;
    }

    return `${bin} ${appType}`;
  }

  /**
   * Check if a string contains an ignored error pattern
   * @param {string} str - The string to check
   * @returns {boolean} Whether the string contains an ignored error pattern
   */
  isIgnoredError(str) {
    return IGNORED_ERRORS.some(pattern => str.includes(pattern));
  }

  /**
   * Check if a string contains an actual error
   * @param {string} str - The string to check
   * @returns {boolean} Whether the string contains an actual error
   */
  isError(str) {
    // First check if it's an ignored pattern
    if (this.isIgnoredError(str)) {
      return false;
    }

    // Then check for error indicators
    return str.includes('error') ||
      str.includes('fail') ||
      str.includes('Error') ||
      str.includes('Failed to compile') ||
      str.includes('ERR!') ||
      str.includes('npm ERR!') ||
      str.includes('posttest') && str.includes('Exit status');
  }

  /**
   * Run a command with standard handling
   * @param {object} options - The options for the command
   * @param {string} options.bin - The command to execute
   * @param {string[]} options.args - The arguments to pass to the command
   * @param {object} options.options - The options for the command
   * @param {string} options.reportFile - The file to write the report to
   * @param {string} options.appType - The type of app to execute the command for
   * @param {boolean} options.handleCmd - Whether to handle the command
   * @returns {Promise<void>}
   */
  async runCommand({ bin, args, options, reportFile, appType, handleCmd = false }) {
    return new Promise((resolve, reject) => {
      const errors = [];
      const taskName = `${bin}-${appType}`;

      // Check if app exists (except for create-gasket-app)
      if (bin !== 'create-gasket-app') {
        try {
          require(path.join(process.cwd(), '__apps__', appType, 'package.json'));
        } catch (err) {
          this.logger.error(`App type: ${appType} not found.`);
          return reject(err);
        }
      }

      // Start logging section
      const displayName = this.getDisplayName(bin, args, appType);
      this.logger.startSection(taskName, displayName);
      this.logger.debug(`Command: ${bin} ${args.join(' ')}`, { cwd: options.cwd });

      // Set up environment
      options.env = {
        ...process.env,
        ...options.env || {},
        ESLINT_USE_FLAT_CONFIG: 'false'
      };

      // Spawn process
      const cmd = spawn(bin, args, options);

      // Return command object if requested (for special handling)
      if (handleCmd) {
        return resolve(cmd);
      }

      // Handle stdout
      cmd.stdout.on('data', (data) => {
        const str = data.toString();
        // Output to section
        this.logger.sectionOutput(str.trim());
      });

      // Handle stderr
      cmd.stderr.on('data', (data) => {
        const str = data.toString();

        if (!this.isIgnoredError(str)) {
          if (this.isError(str)) {
            this.logger.error(str.trim());
            errors.push(str);

            if (this.exitOnError) {
              this.logger.error(`Fatal error in ${appType}: ${str}`);
              process.exit(1);
            }
          } else {
            // Output non-error stderr to section
            this.logger.sectionOutput(str.trim());
          }
        }
      });

      // Handle process exit
      cmd.on('exit', async (code) => {
        this.logger.debug(`Process exited with code ${code}`);

        // Consider non-zero exit code as failure even without explicit errors
        if (code !== 0 && errors.length === 0) {
          errors.push(`Process exited with code ${code}`);
        }

        const success = code === 0 && errors.length === 0;
        this.logger.endSection(taskName, success);

        if (!success) {
          await this.reporter.recordError(reportFile, appType, errors);
        } else {
          await this.reporter.recordSuccess(reportFile, appType);
        }

        resolve();
      });

      // Handle process errors
      cmd.on('error', (error) => {
        this.logger.error(`Process error: ${error}`);
        this.logger.endSection(taskName, false);
        reject(error);
      });
    });
  }

  /**
   * Run a command and return the child process for custom handling
   * @param {object} options - The options for the command
   * @param {string} options.bin - The command to execute
   * @param {string[]} options.args - The arguments to pass to the command
   * @param {object} options.options - The options for the command
   * @returns {Promise<any>} The child process for the command
   */
  async spawnCommand({ bin, args, options }) {
    options.env = {
      ...process.env,
      ...options.env || {},
      ESLINT_USE_FLAT_CONFIG: 'false'
    };

    return spawn(bin, args, options);
  }
}
