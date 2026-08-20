/* eslint-disable max-params */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { readJsonFile, writeJsonFile, getReportPath } from '../utils/file-utils.js';
import { STATUS, DIRS } from '../config/constants.js';

const require = createRequire(import.meta.url);

/**
 * Reporter class for managing test reports
 */
export class Reporter {
  constructor() {
    this.reports = new Map();
  }

  /**
   * Update a report with new data
   * @param {string} reportFile - The file to write the report to
   * @param {string} appType - The type of app to update the report for
   * @param {object} data - The data to update the report with
   * @returns {Promise<void>}
   */
  async updateReport(reportFile, appType, data) {
    const reportPath = getReportPath(reportFile);
    const report = await readJsonFile(reportPath) || {};
    report[appType] = data;
    await writeJsonFile(reportPath, report);
  }

  /**
   * Record a successful operation
   * @param {string} reportFile - The file to write the report to
   * @param {string} appType - The type of app to record the success for
   * @param {number} duration - The duration of the operation
   * @param {string} startTime - The start time of the operation
   * @returns {Promise<void>}
   */
  async recordSuccess(reportFile, appType, duration = null, startTime = null) {
    const data = {
      success: true,
      timestamp: startTime || new Date().toISOString()
    };
    if (duration != null) {
      data.duration = duration;
    }
    await this.updateReport(reportFile, appType, data);
  }

  /**
   * Record an error
   * @param {string} reportFile - The file to write the report to
   * @param {string} appType - The type of app to record the error for
   * @param {object} errors - The errors to record
   * @param {number} duration - The duration of the operation
   * @param {string} startTime - The start time of the operation
   * @returns {Promise<void>}
   */
  async recordError(reportFile, appType, errors, duration = null, startTime = null) {
    const errorArray = Array.isArray(errors) ? errors : [errors];
    const data = {
      success: false,
      errors: errorArray,
      timestamp: startTime || new Date().toISOString()
    };
    if (duration != null) {
      data.duration = duration;
    }
    await this.updateReport(reportFile, appType, data);
  }

  /**
   * Print a single report
   * @param {string} reportPath - The path to the report to print
   */
  printReport(reportPath) {
    const report = require(path.resolve(reportPath));
    if (!Object.keys(report).length) return;

    const formatted = Object.entries(report).reduce((acc, [key, value]) => {
      acc[key] = {
        status: value.success ? STATUS.SUCCESS : STATUS.FAILURE
      };
      return acc;
    }, {});

    const reportName = path.basename(reportPath, '.json')
      .replace('report.', '')
      .toUpperCase();

    console.log(`\n${reportName}`);
    console.log('----------------');
    console.table(formatted);
  }

  /**
   * Print all reports
   * @param {string[]} reports - The reports to print
   */
  printReports(reports) {
    for (const report of reports) {
      const reportPath = getReportPath(report);
      if (fs.existsSync(reportPath)) {
        this.printReport(reportPath);
      }
    }

    const appsDir = path.join(DIRS.APPS);
    if (fs.existsSync(appsDir)) {
      const apps = fs.readdirSync(appsDir);
      console.log(`\nTotal apps: ${apps.length}`);
    }
  }

  /**
   * Get summary of all reports
   * @param {string[]} reports - The reports to get the summary for
   * @returns {Promise<object>} The summary of the reports
   */
  async getSummary(reports) {
    const summary = {
      total: 0,
      successful: 0,
      failed: 0,
      byReport: {}
    };

    for (const reportFile of reports) {
      const reportPath = getReportPath(reportFile);
      const report = await readJsonFile(reportPath);

      if (report) {
        const reportName = reportFile.replace('report.', '').replace('.json', '');
        const entries = Object.entries(report);
        const successful = entries.filter(([, value]) => value.success).length;
        const failed = entries.filter(([, value]) => !value.success).length;

        summary.byReport[reportName] = {
          successful,
          failed,
          total: entries.length
        };

        summary.total += entries.length;
        summary.successful += successful;
        summary.failed += failed;
      }
    }

    return summary;
  }

  /**
   * Generate HTML report
   * @param {string[]} reports - The reports to generate the HTML report for
   * @param {string} outputPath - The path to the output file
   * @returns {Promise<void>}
   */
  async generateHtmlReport(reports, outputPath = 'report.html') {
    const summary = await this.getSummary(reports);
    const details = {};

    // Collect all report details
    for (const reportFile of reports) {
      const reportPath = getReportPath(reportFile);
      const report = await readJsonFile(reportPath);
      if (report) {
        const reportName = reportFile.replace('report.', '').replace('.json', '');
        details[reportName] = report;
      }
    }

    const html = this.generateHtmlContent(summary, details);
    await writeJsonFile(outputPath, html);
    console.log(`HTML report generated: ${outputPath}`);
  }

  /**
   * Generate HTML content for the report
   * @param {object} summary - The summary of the reports
   * @param {object} details - The details of the reports
   * @returns {string} The HTML content for the report
   */
  generateHtmlContent(summary, details) {
    // This is a simplified version - can be enhanced with better styling
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Gasket Testing Tool Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2 { color: #333; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .success { color: green; }
    .failure { color: red; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f2f2f2; }
    .status-success { background: #d4edda; }
    .status-failure { background: #f8d7da; }
  </style>
</head>
<body>
  <h1>Gasket Testing Tool Report</h1>

  <div class="summary">
    <h2>Summary</h2>
    <p>Total Tests: ${summary.total}</p>
    <p class="success">Successful: ${summary.successful}</p>
    <p class="failure">Failed: ${summary.failed}</p>
  </div>

  ${Object.entries(details).map(([reportName, report]) => `
    <h2>${reportName.toUpperCase()}</h2>
    <table>
      <thead>
        <tr>
          <th>App Type</th>
          <th>Status</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(report).map(([appType, result]) => `
          <tr class="${result.success ? 'status-success' : 'status-failure'}">
            <td>${appType}</td>
            <td>${result.success ? '✅' : '❌'}</td>
            <td>${result.errors ? result.errors.join('<br>') : 'Success'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `).join('')}

  <p><small>Generated: ${new Date().toISOString()}</small></p>
</body>
</html>
    `;
  }
}
