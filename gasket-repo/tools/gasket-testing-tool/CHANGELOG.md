# gasket-testing-tool

## 2.0.2

### Patch Changes

- 8e08725: Add update-scoped script, regen
- 8e08725: Update deps

## 2.0.1

### Patch Changes

- dfa21b7: React 19 & NextJS 16

## 2.0.0

### Major Changes

- eb0ef2c: ### Major Changes

  - **Complete architectural refactoring** - Modular design with clear separation of concerns
  - **Enhanced reporting system** - Multiple output formats (Terminal, HTML, JSON)
  - **Improved developer experience** - Better logging, progress indicators, and error handling

  ### Features

  #### Architecture & Organization

  - Refactored monolithic `index.js` into modular architecture
  - Created dedicated modules: `cli/`, `config/`, `core/`, `reporting/`, `runners/`, `services/`, `utils/`
  - Implemented clean separation of concerns with focused, single-responsibility modules
  - Added comprehensive error handling and reporting

  #### Enhanced Reporting

  - **Terminal Reports**: Beautiful tables with `cli-table3`, colored output, and visual indicators
  - **HTML Reports**: Interactive dashboards with filters, search, and auto-browser opening
  - **JSON Reports**: Structured data output for programmatic processing
  - **Failures-Only Mode**: Quick view of failed operations for debugging

  #### Improved Logging System

  - **Default Mode**: Formatted sections with limited output (15 lines) and visual borders
  - **Verbose Mode**: Complete output with detailed timing information
  - **Quiet Mode**: Only errors displayed for minimal output
  - **Progress Indicators**: Visual feedback during batch operations
  - **Collapsible Sections**: Clean, organized output similar to npm/pnpm

  #### New NPM Scripts

  - `run:all` - Test all app types
  - `run:all-presets` - Test all presets only
  - `run:all-templates` - Test all templates only
  - `run:os-templates` - Test open source templates
  - `run:os-presets` - Test open source presets
  - `run:internal-templates` - Test internal templates
  - `run:internal-presets` - Test internal presets
  - `report:html` - Generate HTML report
  - `report:json` - Generate JSON report
  - `report:failures` - Show only failures

  #### CLI Improvements

  - Reorganized prompt choices with visual separators and categories
  - Fixed progress bar calculations and display
  - Added support for batch operations from command line
  - Improved app type filtering and selection

  ### Removals

  - Removed `lint` npm script (redundant with test)
  - Removed `validate-files` functionality (not valuable)
  - Removed `report.lint.json` and `report.files.json`

  ### Technical Improvements

  - Added timing data capture for all operations
  - Implemented proper error categorization by npm command
  - Enhanced error detection for posttest scripts
  - Fixed verbose mode environment variable handling
  - Added utility functions for app type categorization
  - Improved file utilities with better error handling

  ### Dependencies

  - Added `cli-table3@^0.6.3` for terminal table formatting
  - Added `open@^10.0.3` for browser opening functionality

  ### Bug Fixes

  - Fixed HTML report generation browser environment error
  - Fixed progress bar showing 100% immediately
  - Fixed prompt separator display issues
  - Fixed logger verbose mode configuration
  - Fixed error capture from posttest scripts

## 1.1.3

### Patch Changes

- a72a8fe: Fix generated styles for new webapps

## 1.1.2

### Patch Changes

- fe92d45: Eslint9 upgrade

## 1.1.1

### Patch Changes

- 265ea31: Update workspace dependencies from workspace:\* to workspace:^.

## 1.1.0

### Minor Changes

- bc64c3c: include vitest in presets and generated code

## 1.0.3

### Patch Changes

- bf5bccc: Fix testing tool issues
- bf5bccc: Bump deps

## 1.0.2

### Patch Changes

- f3a6892: Fix issues with testing tool

## 1.0.1

### Patch Changes

- 6a9d887: Updates to support integrating the Gasket Testing Tool into this monorepo.
