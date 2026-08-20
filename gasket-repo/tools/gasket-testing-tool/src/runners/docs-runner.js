/* eslint-disable no-async-promise-executor */
import terminate from 'terminate/promise';
import { CommandRunner } from './command-runner.js';
import { Reporter } from '../reporting/reporter.js';
import { Logger } from '../services/logger.js';
import { wait } from '../utils/wait.js';
import { WAIT_TIMES, REPORT_FILES } from '../config/constants.js';

/**
 * DocsRunner - Handles documentation server tests
 * @param {boolean} exitOnError - Whether to exit on error
 * @param {object} loggerOptions - The options for the logger
 */
export class DocsRunner {
  constructor(exitOnError = false, loggerOptions = {}) {
    this.exitOnError = exitOnError;
    this.commandRunner = new CommandRunner(exitOnError, loggerOptions);
    this.reporter = new Reporter();
    this.logger = new Logger(loggerOptions);
  }

  /**
   * Test documentation server
   * @param {string} appType - The type of app to test
   * @returns {Promise<void>}
   */
  async runDocs(appType) {
    return new Promise(async (resolve) => {
      const errors = [];
      const reportFile = REPORT_FILES.DOCS;
      const taskName = `docs-${appType}`;

      // Start logging section
      const displayName = `Running docs for ${appType}`;
      this.logger.startSection(taskName, displayName);

      const cmd = await this.commandRunner.spawnCommand({
        bin: 'npm',
        args: ['run', 'docs'],
        options: {
          cwd: `__apps__/${appType}`
        }
      });

      cmd.stdout.on('data', async (data) => {
        let req;
        const str = data.toString();
        this.logger.sectionOutput(str.trim());

        if (str.includes(' http://localhost:3000')) {
          await wait(WAIT_TIMES.SERVER_START);
          req = await fetch('http://localhost:3000');
        }

        // Check response status
        if (req) {
          if (req?.status === 200) {
            this.logger.info(`Received 200 response for docs site from app type: ${appType}`);
          } else if (req?.status !== 200) {
            this.logger.error(`Did not receive a 200 response from docs site: ${req?.status}`);

            if (this.exitOnError) {
              this.logger.error('Exiting on error', { message: str });
              throw new Error(str);
            }
            errors.push(str);
          }

          // Terminate process
          await terminate(cmd.pid);
        }
      });

      cmd.stderr.on('data', (data) => {
        const str = data.toString();

        // Ignore docs-specific warnings
        if (str.includes('[WARNING] Docs markdown')) return;

        if (!this.commandRunner.isIgnoredError(str)) {
          if (this.commandRunner.isError(str)) {
            this.logger.error(str.trim());
            if (this.exitOnError) {
              this.logger.error('Fatal error in docs test', { appType });
              throw new Error(str);
            }
            errors.push(str);
          } else {
            this.logger.sectionOutput(str.trim());
          }
        }
      });

      cmd.on('exit', async () => {
        const success = errors.length === 0;
        this.logger.endSection(taskName, success);

        if (!success) {
          await this.reporter.recordError(reportFile, appType, errors);
        } else {
          await this.reporter.recordSuccess(reportFile, appType);
        }
        resolve();
      });
    });
  }
}
