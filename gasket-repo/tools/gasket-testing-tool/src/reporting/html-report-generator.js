import fs from 'fs';
import path from 'path';
import open from 'open';
import { readJsonFile, getReportPath } from '../utils/file-utils.js';
import { DIRS, REPORT_FILES } from '../config/constants.js';
import {
  isOsPreset,
  isInternalPreset,
  isOsTemplate,
  isInternalTemplate
} from '../utils/app-type-utils.js';

/**
 * HtmlReportGenerator - Generate interactive HTML reports
 */
export class HtmlReportGenerator {
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
   * Calculate statistics
   * @returns {void}
   */
  calculateStats() {
    const stats = {
      totalApps: 0,
      totalTests: 0,
      successful: 0,
      failed: 0,
      successRate: 0,
      timestamp: new Date().toISOString(),
      byCategory: {},
      byCommand: {},
      appResults: new Map()
    };

    const appTypes = new Set();

    // Process reports
    this.reports.forEach((report, reportName) => {
      stats.byCommand[reportName] = { success: 0, failed: 0 };

      Object.entries(report).forEach(([appType, result]) => {
        appTypes.add(appType);
        stats.totalTests++;

        // Initialize app results
        if (!stats.appResults.has(appType)) {
          stats.appResults.set(appType, {
            category: this.getCategory(appType),
            results: {}
          });
        }

        // Store result
        stats.appResults.get(appType).results[reportName] = result;

        // Update counters
        if (result.success) {
          stats.successful++;
          stats.byCommand[reportName].success++;
        } else {
          stats.failed++;
          stats.byCommand[reportName].failed++;

          this.failures.push({
            appType,
            command: reportName,
            errors: result.errors || [],
            duration: result.duration
          });
        }
      });
    });

    stats.totalApps = appTypes.size;
    stats.successRate = stats.totalTests > 0
      ? Math.round((stats.successful / stats.totalTests) * 100)
      : 0;

    // Calculate category stats
    const categories = ['os-presets', 'internal-presets', 'os-templates', 'internal-templates'];
    categories.forEach(cat => {
      stats.byCategory[cat] = { success: 0, failed: 0, total: 0 };
    });

    stats.appResults.forEach((data) => {
      const category = data.category;
      if (category && stats.byCategory[category]) {
        Object.values(data.results).forEach(result => {
          stats.byCategory[category].total++;
          if (result.success) {
            stats.byCategory[category].success++;
          } else {
            stats.byCategory[category].failed++;
          }
        });
      }
    });

    this.summary = stats;
  }

  /**
   * Get category for app type
   * @param {string} appType - The type of app to get the category for
   * @returns {string} The category for the app type
   */
  getCategory(appType) {
    if (isOsTemplate(appType)) return 'os-templates';
    if (isInternalTemplate(appType)) return 'internal-templates';
    if (isOsPreset(appType)) return 'os-presets';
    if (isInternalPreset(appType)) return 'internal-presets';
    return 'unknown';
  }

  /**
   * Generate HTML content
   * @returns {string} The generated HTML content
   */
  generateHtml() {
    const appResultsArray = Array.from(this.summary.appResults.entries());

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gasket Testing Tool Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 0;
      margin-bottom: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    header h1 {
      text-align: center;
      font-size: 2.5em;
    }

    .timestamp {
      text-align: center;
      opacity: 0.9;
      margin-top: 10px;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }

    .card-title {
      font-size: 0.9em;
      color: #666;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .card-value {
      font-size: 2em;
      font-weight: bold;
    }

    .card.success { border-left: 4px solid #28a745; }
    .card.failure { border-left: 4px solid #dc3545; }
    .card.info { border-left: 4px solid #17a2b8; }
    .card.warning { border-left: 4px solid #ffc107; }

    .section {
      background: white;
      border-radius: 10px;
      padding: 25px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .section-title {
      font-size: 1.5em;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e9ecef;
      color: #444;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }

    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #555;
      position: sticky;
      top: 0;
    }

    tr:hover {
      background: #f8f9fa;
    }

    .status-icon {
      font-size: 1.2em;
    }

    .status-success { color: #28a745; }
    .status-failure { color: #dc3545; }
    .status-skipped { color: #6c757d; }

    .category-header {
      background: linear-gradient(90deg, #f8f9fa 0%, transparent 100%);
      font-weight: bold;
      font-size: 1.1em;
    }

    .error-details {
      background: #fff5f5;
      border-left: 3px solid #dc3545;
      padding: 15px;
      margin: 10px 0;
      border-radius: 5px;
    }

    .error-title {
      font-weight: bold;
      color: #dc3545;
      margin-bottom: 10px;
    }

    .error-message {
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      color: #666;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .filter-controls {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .filter-btn {
      padding: 8px 16px;
      border: 1px solid #dee2e6;
      background: white;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-btn:hover {
      background: #f8f9fa;
      border-color: #adb5bd;
    }

    .filter-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .search-box {
      padding: 8px 16px;
      border: 1px solid #dee2e6;
      border-radius: 5px;
      width: 300px;
    }

    .hidden { display: none; }

    .progress-bar {
      width: 100%;
      height: 20px;
      background: #e9ecef;
      border-radius: 10px;
      overflow: hidden;
      margin-top: 10px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
      transition: width 0.3s ease;
    }

    @media (max-width: 768px) {
      .container { padding: 10px; }
      .summary-cards { grid-template-columns: 1fr; }
      table { font-size: 0.9em; }
      th, td { padding: 8px; }
    }

    @media print {
      header { background: #666; }
      .filter-controls { display: none; }
      .card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>🚀 Gasket Testing Tool Report</h1>
      <div class="timestamp">Generated: ${new Date(this.summary.timestamp).toLocaleString()}</div>
    </div>
  </header>

  <div class="container">
    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="card info">
        <div class="card-title">Total Apps</div>
        <div class="card-value">${this.summary.totalApps}</div>
      </div>
      <div class="card info">
        <div class="card-title">Total Tests</div>
        <div class="card-value">${this.summary.totalTests}</div>
      </div>
      <div class="card success">
        <div class="card-title">Successful</div>
        <div class="card-value">${this.summary.successful}</div>
      </div>
      <div class="card failure">
        <div class="card-title">Failed</div>
        <div class="card-value">${this.summary.failed}</div>
      </div>
      <div class="card ${this.summary.successRate >= 80 ? 'success' : this.summary.successRate >= 60 ? 'warning' : 'failure'}">
        <div class="card-title">Success Rate</div>
        <div class="card-value">${this.summary.successRate}%</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${this.summary.successRate}%"></div>
        </div>
      </div>
    </div>

    <!-- Filter Controls -->
    <div class="section">
      <div class="filter-controls">
        <button class="filter-btn active" onclick="filterResults('all')">All</button>
        <button class="filter-btn" onclick="filterResults('success')">✅ Successful</button>
        <button class="filter-btn" onclick="filterResults('failure')">❌ Failed</button>
        <button class="filter-btn" onclick="filterResults('os-presets')">OS Presets</button>
        <button class="filter-btn" onclick="filterResults('internal-presets')">Internal Presets</button>
        <button class="filter-btn" onclick="filterResults('templates')">Templates</button>
        <input type="text" class="search-box" placeholder="Search app types..." onkeyup="searchApps(this.value)">
      </div>
    </div>

    <!-- Results Table -->
    <div class="section">
      <h2 class="section-title">Test Results by App Type</h2>
      <table id="results-table">
        <thead>
          <tr>
            <th>App Type</th>
            <th>Category</th>
            <th>Create</th>
            <th>Build</th>
            <th>Test</th>
            <th>Start</th>
            <th>Local</th>
            <th>Docs</th>
          </tr>
        </thead>
        <tbody>
          ${this.generateTableRows(appResultsArray)}
        </tbody>
      </table>
    </div>

    <!-- Command Statistics -->
    <div class="section">
      <h2 class="section-title">Command Statistics</h2>
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>Success</th>
            <th>Failed</th>
            <th>Success Rate</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(this.summary.byCommand).map(([cmd, stats]) => {
            const total = stats.success + stats.failed;
            const rate = total > 0 ? Math.round((stats.success / total) * 100) : 0;
            return `
                    <tr>
                      <td><strong>${cmd.toUpperCase()}</strong></td>
                      <td class="status-success">${stats.success}</td>
                      <td class="status-failure">${stats.failed}</td>
                      <td>
                        <div style="display: flex; align-items: center;">
                          <span style="margin-right: 10px;">${rate}%</span>
                          <div class="progress-bar" style="width: 100px; height: 10px;">
                            <div class="progress-fill" style="width: ${rate}%;"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <!-- Failures Section -->
    ${this.failures.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Failed Operations</h2>
      ${this.failures.map(failure => `
        <div class="error-details">
          <div class="error-title">
            ${failure.appType} → ${failure.command}
            ${failure.duration ? `<span style="color: #666; font-weight: normal;">(${failure.duration.toFixed(2)}s)</span>` : ''}
          </div>
          ${failure.errors.map(err => `
            <div class="error-message">${this.escapeHtml(err)}</div>
          `).join('')}
        </div>
      `).join('')}
    </div>
    ` : `
    <div class="section">
      <h2 class="section-title" style="color: #28a745;">✅ All Tests Passed!</h2>
    </div>
    `}
  </div>

  <script>
    function filterResults(filter) {
      const buttons = document.querySelectorAll('.filter-btn');
      buttons.forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');

      const rows = document.querySelectorAll('#results-table tbody tr');
      rows.forEach(row => {
        const category = row.dataset.category;
        const hasFailure = row.dataset.hasFailure === 'true';

        if (filter === 'all') {
          row.classList.remove('hidden');
        } else if (filter === 'success') {
          row.classList.toggle('hidden', hasFailure);
        } else if (filter === 'failure') {
          row.classList.toggle('hidden', !hasFailure);
        } else if (filter === 'templates') {
          row.classList.toggle('hidden', !category.includes('templates'));
        } else {
          row.classList.toggle('hidden', category !== filter);
        }
      });
    }

    function searchApps(query) {
      const rows = document.querySelectorAll('#results-table tbody tr');
      const lowerQuery = query.toLowerCase();

      rows.forEach(row => {
        const appType = row.querySelector('td:first-child').textContent.toLowerCase();
        row.classList.toggle('hidden', !appType.includes(lowerQuery));
      });
    }
  </script>
</body>
</html>`;
  }

  /**
   * Generate table rows
   * @param {Array} appResults - The app results to generate table rows for
   * @returns {string} The generated table rows
   */
  generateTableRows(appResults) {
    return appResults.map(([appType, data]) => {
      const commands = ['create', 'build', 'test', 'start', 'local', 'docs'];
      const hasFailure = Object.values(data.results).some(r => !r.success);

      return `
        <tr data-category="${data.category}" data-has-failure="${hasFailure}">
          <td><strong>${appType}</strong></td>
          <td>${this.formatCategory(data.category)}</td>
          ${commands.map(cmd => {
            const result = data.results[cmd];
            if (!result) {
              return '<td><span class="status-icon status-skipped">⏭️</span></td>';
            }
            return `<td><span class="status-icon ${result.success ? 'status-success">✅' : 'status-failure">❌'}</span></td>`;
          }).join('')}
        </tr>
      `;
    }).join('');
  }

  /**
   * Format category name
   * @param {string} category - The category to format
   * @returns {string} The formatted category
   */
  formatCategory(category) {
    const formatted = {
      'os-presets': 'OS Preset',
      'internal-presets': 'Internal Preset',
      'os-templates': 'OS Template',
      'internal-templates': 'Internal Template',
      'unknown': 'Unknown'
    };
    return formatted[category] || category;
  }

  /**
   * Escape HTML
   * @param {string} text - The text to escape
   * @returns {string} The escaped text
   */
  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Generate and save HTML report
   * @param {string} outputPath - The path to the output file
   * @returns {Promise<string>} The path to the output file
   */
  async generateReport(outputPath = null) {
    await this.loadReports();
    this.calculateStats();

    const html = this.generateHtml();
    const reportPath = outputPath || path.join(DIRS.REPORTS, 'report.html');

    await fs.promises.writeFile(reportPath, html, 'utf8');
    console.log(`\n✅ HTML report generated: ${reportPath}`);

    return reportPath;
  }

  /**
   * Generate and open HTML report
   * @param {string} outputPath - The path to the output file
   * @returns {Promise<string>} The path to the output file
   */
  async generateAndOpen(outputPath = null) {
    const reportPath = await this.generateReport(outputPath);

    console.log('📂 Opening report in browser...');
    await open(reportPath);

    return reportPath;
  }
}
