/* eslint-disable no-control-regex */
import Table from 'cli-table3';
import fs from 'fs';
import { readJsonFile, getReportPath } from '../utils/file-utils.js';
import { REPORT_FILES } from '../config/constants.js';
import {
  isOsPreset,
  isInternalPreset,
  isOsTemplate,
  isInternalTemplate
} from '../utils/app-type-utils.js';

/**
 * ReportViewer - Enhanced terminal visualization for reports
 */
export class ReportViewer {
  constructor() {
    this.reports = new Map();
    this.summary = {};
    this.failures = [];
  }

  /**
   * Load all reports
   * @returns {Promise<void>}
   */
  async loadReports() {
    for (const reportFile of Object.values(REPORT_FILES)) {
      const reportPath = getReportPath(reportFile);
      if (fs.existsSync(reportPath)) {
        const data = await readJsonFile(reportPath);
        if (data && Object.keys(data).length > 0) {
          const reportName = reportFile.replace('report.', '').replace('.json', '');
          this.reports.set(reportName, data);
        }
      }
    }
  }

  /**
   * Calculate summary statistics
   * @returns {void}
   */
  calculateSummary() {
    const summary = {
      totalApps: 0,
      totalTests: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      totalDuration: 0,
      byCommand: {},
      byCategory: {
        'os-presets': { success: 0, failed: 0, total: 0 },
        'internal-presets': { success: 0, failed: 0, total: 0 },
        'os-templates': { success: 0, failed: 0, total: 0 },
        'internal-templates': { success: 0, failed: 0, total: 0 }
      }
    };

    const appTypes = new Set();

    // Process each report
    this.reports.forEach((report, reportName) => {
      if (!summary.byCommand[reportName]) {
        summary.byCommand[reportName] = { success: 0, failed: 0, skipped: 0, total: 0 };
      }

      Object.entries(report).forEach(([appType, result]) => {
        appTypes.add(appType);
        summary.totalTests++;
        summary.byCommand[reportName].total++;

        if (result.success) {
          summary.successful++;
          summary.byCommand[reportName].success++;
          this.categorizeApp(appType, 'success', summary.byCategory);
        } else {
          summary.failed++;
          summary.byCommand[reportName].failed++;
          this.categorizeApp(appType, 'failed', summary.byCategory);

          // Track failures
          this.failures.push({
            appType,
            command: reportName,
            errors: result.errors || [],
            duration: result.duration
          });
        }

        // Add duration if available
        if (result.duration) {
          summary.totalDuration += result.duration;
        }
      });
    });

    summary.totalApps = appTypes.size;
    summary.successRate = summary.totalTests > 0
      ? Math.round((summary.successful / summary.totalTests) * 100)
      : 0;

    this.summary = summary;
  }

  /**
   * Categorize app type
   * @param {string} appType - The type of app to categorize
   * @param {string} status - The status of the app
   * @param {object} categories - The categories to categorize the app
   * @returns {void}
   */
  categorizeApp(appType, status, categories) {
    let category = null;

    if (isOsTemplate(appType)) {
      category = 'os-templates';
    } else if (isInternalTemplate(appType)) {
      category = 'internal-templates';
    } else if (isOsPreset(appType)) {
      category = 'os-presets';
    } else if (isInternalPreset(appType)) {
      category = 'internal-presets';
    }

    if (category && categories[category]) {
      categories[category].total++;
      if (status === 'success') {
        categories[category].success++;
      } else {
        categories[category].failed++;
      }
    }
  }

  /**
   * Display summary box
   * @returns {void}
   */
  displaySummary() {
    console.log('');
    console.log('\x1b[36m╔══════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[36m║\x1b[0m              Test Execution Summary                  \x1b[36m║\x1b[0m');
    console.log('\x1b[36m╠══════════════════════════════════════════════════════╣\x1b[0m');
    console.log('\x1b[36m║\x1b[0m ' + this.padRight(`Total Apps Tested: ${this.summary.totalApps}`, 52) + ' \x1b[36m║\x1b[0m');
    console.log('\x1b[36m║\x1b[0m ' + this.padRight(`Total Test Runs: ${this.summary.totalTests}`, 52) + ' \x1b[36m║\x1b[0m');
    console.log('\x1b[36m║\x1b[0m ' + this.padRight(`✅ Successful: ${this.summary.successful} (${this.summary.successRate}%)`, 52) + ' \x1b[36m║\x1b[0m');
    console.log('\x1b[36m║\x1b[0m ' + this.padRight(`❌ Failed: ${this.summary.failed} (${100 - this.summary.successRate}%)`, 52) + ' \x1b[36m║\x1b[0m');

    if (this.summary.totalDuration > 0) {
      const duration = this.formatDuration(this.summary.totalDuration);
      console.log('\x1b[36m║\x1b[0m ' + this.padRight(`⏱️  Total Duration: ${duration}`, 52) + ' \x1b[36m║\x1b[0m');
    }

    console.log('\x1b[36m╚══════════════════════════════════════════════════════╝\x1b[0m');
    console.log('');
  }

  /**
   * Display results by category
   * @returns {void}
   */
  displayCategoryTables() {
    const categories = [
      { name: 'Open Source Presets', key: 'os-presets', filter: isOsPreset },
      { name: 'Internal Presets', key: 'internal-presets', filter: isInternalPreset },
      { name: 'Open Source Templates', key: 'os-templates', filter: isOsTemplate },
      { name: 'Internal Templates', key: 'internal-templates', filter: isInternalTemplate }
    ];

    for (const category of categories) {
      const apps = this.getAppsByCategory(category.filter);
      if (apps.length === 0) continue;

      console.log(`\n\x1b[1m${category.name}\x1b[0m`);

      // Create table
      const table = new Table({
        head: ['App Type', 'Create', 'Build', 'Test', 'Start', 'Local', 'Docs'],
        style: {
          head: ['cyan'],
          border: ['gray']
        }
      });

      // Add rows
      apps.forEach(appType => {
        const row = [appType];
        ['create', 'build', 'test', 'start', 'local', 'docs'].forEach(cmd => {
          const report = this.reports.get(cmd);
          if (report && report[appType]) {
            const result = report[appType];
            if (result.success) {
              row.push('✅');
            } else {
              row.push('❌');
            }
          } else {
            row.push('⏭️');
          }
        });
        table.push(row);
      });

      console.log(table.toString());

      // Show category stats
      const stats = this.summary.byCategory[category.key];
      if (stats && stats.total > 0) {
        const successRate = Math.round((stats.success / stats.total) * 100);
        console.log(`\x1b[90mSuccess Rate: ${successRate}% (${stats.success}/${stats.total})\x1b[0m`);
      }
    }

    // Legend
    console.log('\n\x1b[90mLegend: ✅ Success | ❌ Failed | ⏭️ Skipped\x1b[0m');
  }

  /**
   * Display command statistics
   * @returns {void}
   */
  displayCommandStats() {
    console.log('\n\x1b[1mCommand Statistics\x1b[0m');

    const table = new Table({
      head: ['Command', 'Success', 'Failed', 'Success Rate'],
      style: {
        head: ['cyan'],
        border: ['gray']
      }
    });

    Object.entries(this.summary.byCommand).forEach(([cmd, stats]) => {
      if (stats.total > 0) {
        const rate = Math.round((stats.success / stats.total) * 100);
        table.push([
          cmd.toUpperCase(),
          `${stats.success}`,
          `${stats.failed}`,
          `${rate}%`
        ]);
      }
    });

    console.log(table.toString());
  }

  /**
   * Display failures
   * @returns {void}
   */
  displayFailures() {
    if (this.failures.length === 0) {
      console.log('\n\x1b[32m✅ All tests passed!\x1b[0m\n');
      return;
    }

    console.log('\n\x1b[1m\x1b[31mFailed Operations\x1b[0m');
    console.log('\x1b[90m' + '─'.repeat(50) + '\x1b[0m');

    this.failures.forEach(failure => {
      console.log(`\n❌ \x1b[1m${failure.appType}\x1b[0m → \x1b[33m${failure.command}\x1b[0m`);

      if (failure.errors && failure.errors.length > 0) {
        failure.errors.forEach(error => {
          // Truncate very long errors
          const errorMsg = error.length > 200
            ? error.substring(0, 197) + '...'
            : error;
          console.log(`   \x1b[31m${errorMsg}\x1b[0m`);
        });
      }

      if (failure.duration) {
        console.log(`   \x1b[90mDuration: ${failure.duration.toFixed(2)}s\x1b[0m`);
      }
    });
  }

  /**
   * Get apps by category filter
   * @param {Function} filterFn - The filter function to use
   * @returns {string[]} The apps by category
   */
  getAppsByCategory(filterFn) {
    const appTypes = new Set();

    this.reports.forEach(report => {
      Object.keys(report).forEach(appType => {
        if (filterFn(appType)) {
          appTypes.add(appType);
        }
      });
    });

    return Array.from(appTypes).sort();
  }

  /**
   * Display full report
   * @param {object} options - The options to use
   * @returns {Promise<void>}
   */
  async displayReport(options = {}) {
    await this.loadReports();
    this.calculateSummary();

    if (options.failuresOnly) {
      this.displayFailures();
      return;
    }

    this.displaySummary();

    if (!options.summaryOnly) {
      this.displayCategoryTables();
      this.displayCommandStats();
      this.displayFailures();
    }
  }

  /**
   * Display raw JSON
   * @returns {Promise<void>}
   */
  async displayJson() {
    await this.loadReports();
    this.calculateSummary();

    const output = {
      summary: this.summary,
      reports: Object.fromEntries(this.reports),
      failures: this.failures
    };

    console.log(JSON.stringify(output, null, 2));
  }

  /**
   * Utility: Pad string to the right
   * @param {string} str - The string to pad
   * @param {number} length - The length to pad the string to
   * @returns {string} The padded string
   */
  padRight(str, length) {
    // Remove ANSI color codes for accurate length calculation
    const plainStr = str.replace(/\x1b\[[0-9;]*m/g, '');
    const padding = Math.max(0, length - plainStr.length);
    return str + ' '.repeat(padding);
  }

  /**
   * Utility: Format duration
   * @param {number} seconds - The seconds to format
   * @returns {string} The formatted duration
   */
  formatDuration(seconds) {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(0);
    return `${minutes}m ${secs}s`;
  }
}
