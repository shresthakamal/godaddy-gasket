#!/usr/bin/env node

import { EnvManager } from './config/env-manager.js';
import { CommandHandler } from './cli/command-handler.js';
import { Orchestrator } from './core/orchestrator.js';
import { ReportViewer } from './reporting/report-viewer.js';
import { HtmlReportGenerator } from './reporting/html-report-generator.js';
import {
  createAppsDir,
  createReportFiles,
  writeEnvFile
} from './utils/file-utils.js';
import {
  ALL_REPORTS,
  COMMANDS
} from './config/constants.js';

/**
 * Setup the initial environment
 */
async function setup() {
  await createAppsDir();
  await createReportFiles(ALL_REPORTS);
  await writeEnvFile();
}

/**
 * Main entry point
 */
async function main() {
  // Initialize environment manager
  const envManager = new EnvManager();

  // Initialize command handler
  const commandHandler = new CommandHandler(envManager);

  // Initialize orchestrator
  const orchestrator = new Orchestrator(envManager);

  // Setup environment
  await setup();

  // Check for special command modes
  const commandMode = commandHandler.getCommandMode();

  if (commandMode) {
    // Handle report commands
    if (commandMode === COMMANDS.PRINT_REPORTS) {
      const viewer = new ReportViewer();
      await viewer.displayReport();
      return;
    }

    if (commandMode === COMMANDS.REPORT_HTML) {
      const generator = new HtmlReportGenerator();
      await generator.generateAndOpen();
      return;
    }

    if (commandMode === COMMANDS.REPORT_JSON) {
      const viewer = new ReportViewer();
      await viewer.displayJson();
      return;
    }

    if (commandMode === COMMANDS.REPORT_FAILURES) {
      const viewer = new ReportViewer();
      await viewer.displayReport({ failuresOnly: true });
      return;
    }

    // Handle other command modes
    const appTypes = commandHandler.getAppTypes();
    await orchestrator.handleCommandMode(commandMode, appTypes);
    return;
  }

  // Get app type and local package preference
  const { appType, useLocalPackage } = await commandHandler.getAppType();

  if (!appType) {
    console.log('No app type selected. Exiting.');
    return;
  }

  // Determine if singular or batch processing
  const isSingular = commandHandler.isSingularAppType(appType);
  const allAppTypes = commandHandler.getAppTypes();

  // Execute main orchestration
  await orchestrator.execute(appType, useLocalPackage, allAppTypes, isSingular);
}

// Run main and handle errors
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
