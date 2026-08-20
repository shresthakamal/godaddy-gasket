/* eslint-disable no-async-promise-executor */
import terminate from 'terminate/promise';
import { CommandRunner } from './command-runner.js';
import { Reporter } from '../reporting/reporter.js';
import { Logger } from '../services/logger.js';
import { wait } from '../utils/wait.js';
import { isApi, isHcs } from '../utils/app-type-utils.js';
import { WAIT_TIMES, REPORT_FILES } from '../config/constants.js';

/**
 * RenderRunner - Handles server rendering tests
 * @param {boolean} exitOnError - Whether to exit on error
 * @param {boolean} isCI - Whether the test is running in CI
 * @param {object} loggerOptions - The options for the logger
 */
export class RenderRunner {
  constructor(exitOnError = false, isCI = false, loggerOptions = {}) {
    this.exitOnError = exitOnError;
    this.isCI = isCI;
    this.commandRunner = new CommandRunner(exitOnError, loggerOptions);
    this.reporter = new Reporter();
    this.logger = new Logger(loggerOptions);
  }

  /**
   * Test server rendering
   * @param {string} appType - The type of app to test
   * @param {string} renderCmd - The command to run for rendering
   */
  async runRender(appType, renderCmd = 'local') {
    return new Promise(async (resolve) => {
      let concatedStr = '';
      const errors = [];
      let hasProxy = false;
      const reportFile = renderCmd === 'start' ? REPORT_FILES.START : REPORT_FILES.LOCAL;
      const taskName = `render-${renderCmd}-${appType}`;

      // Start logging section
      const displayName = `Running ${renderCmd} for ${appType}`;
      this.logger.startSection(taskName, displayName);

      const cmd = await this.commandRunner.spawnCommand({
        bin: 'npm',
        args: ['run', renderCmd],
        options: {
          cwd: `__apps__/${appType}`
        }
      });

      cmd.stdout.on('data', async (data) => {
        let req;
        const str = data.toString();
        concatedStr += str;

        if (str.includes('nodemon')) return;

        this.logger.sectionOutput(str.trim());

        // NextJS w/Proxy
        if (str.includes('info: Proxy server started:')) {
          hasProxy = true;
          const host = str.match(/http.*/);
          await wait(WAIT_TIMES.SERVER_START);
          req = await fetch(host[0]);
        }

        // NextJS default server
        if (str.includes('- Local:         http://localhost:3000') && !hasProxy) {
          await wait(WAIT_TIMES.SERVER_START);
          // Wait to ensure that a proxy isn't present
          if (!concatedStr.includes('info: Proxy server started:')) {
            req = await fetch('http://localhost:3000');
          }
        }

        // API & NextJS Custom Server
        if (str.includes('info: Server started at')) {
          const host = str.match(/http.*/);
          await wait(WAIT_TIMES.SERVER_START);

          if (isApi(appType)) {
            req = await fetch(`${host[0]}default`);
            if (isHcs(appType) && !this.isCI) {
              req = await fetch(`${host[0]}v3/uxp-tester`);
              this.logger.debug('HCS request:', { url: `${host[0]}v3/uxp-tester` });
            }
          } else {
            req = await fetch(host[0]);
          }
        }

        // Check response status
        if (req) {
          if (req?.status === 200) {
            this.logger.info(`Received 200 response from app type: ${appType}`);
          } else if (req?.status !== 200) {
            this.logger.error(`Did not receive a 200 response: ${req?.status}`);

            if (this.exitOnError) {
              this.logger.error('Exiting on error', { message: str });
              throw new Error(str);
            }
            errors.push(str);
          }

          // Terminate process
          try {
            await terminate(cmd.pid);
          } catch (err) {
            this.logger.error('Error terminating process', { error: err.message });
          }
        }
      });

      cmd.stderr.on('data', (data) => {
        const str = data.toString();

        if (!this.commandRunner.isIgnoredError(str)) {
          if (this.commandRunner.isError(str)) {
            this.logger.error(str.trim());
            if (this.exitOnError) {
              this.logger.error('Fatal error in render test', { appType });
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
