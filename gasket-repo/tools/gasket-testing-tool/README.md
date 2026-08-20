# Gasket Testing Tool 🚀

<div style="background-color: rgb(13, 22, 36);">
  <p align="center">
    <img src="static/gasket-testing-tool-logo.png" alt="Gasket Testing Tool Logo" width="250"/>
  </p>
</div>

A comprehensive testing utility for validating `create-gasket-app` CLI functionality with both **presets** and **templates**.

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Features](#features)
- [Architecture](#architecture)
- [Usage](#usage)
- [Configuration](#configuration)
- [Reporting](#reporting)
- [NPM Scripts](#npm-scripts)
- [App Types](#app-types)
- [Logging](#logging)
- [Development](#development)

## Quick Start

```bash
# Install dependencies
pnpm install

# Run interactive mode
npm start

# Run all tests
npm run run:all

# View results
npm run report         # Terminal view
npm run report:html    # Browser view
```

## ✨ Features

### Core Capabilities
- ✅ **Automated Testing** - Test `create-gasket-app` with presets and templates
- ✅ **Multi-Command Support** - Tests `build`, `start`, `local`, `test`, and `docs` commands
- ✅ **Flexible Configuration** - Environment-based configuration via `.env`
- ✅ **Error Tracking** - Comprehensive error capture with `EXIT_ON_ERROR` for CI/CD
- ✅ **Local/Remote Package Support** - Test with local development or published packages

### Recent Enhancements
- 🎨 **Modular Architecture** - Clean separation of concerns with organized modules
- 📊 **Enhanced Reporting** - Terminal tables, HTML dashboards, and JSON output
- 🔍 **Smart Logging** - Formatted sections with verbose/quiet modes
- ⚡ **Batch Operations** - Run specific categories (OS/Internal, Presets/Templates)
- 📈 **Progress Indicators** - Visual feedback during long-running operations
- 🎯 **Focused Testing** - Removed redundant `lint` and `validate-files` features

## 🏗️ Architecture

The tool follows a modular architecture:

```
src/
├── cli/                 # Command-line interface
│   └── command-handler.js
├── questions.js         # Interactive prompts
├── config/             # Configuration management
│   ├── constants.js
│   ├── env-manager.js
│   └── preset-configs.js
├── core/               # Core orchestration
│   └── orchestrator.js
├── reporting/          # Report generation
│   ├── html-report-generator.js
│   ├── report-viewer.js
│   └── reporter.js
├── runners/            # Test execution
│   ├── command-runner.js
│   ├── docs-runner.js
│   └── render-runner.js
├── services/           # Shared services
│   └── logger.js
├── utils/              # Utility functions
│   ├── app-type-utils.js
│   ├── file-utils.js
│   ├── package-utils.js
│   ├── proxy-utils.js
│   └── wait.js
└── index.js           # Entry point
```

## 💻 Usage

### Interactive Mode
```bash
npm start
```
Select from categorized options:
- Individual app types (presets or templates)
- Batch operations (all, by category, by type)

### Command-Line Mode
```bash
# Test specific app type
npm run create-app express

# Run specific test phase
npm run build:only
npm run test:only
npm run render

# Batch operations
npm run run:all               # All app types
npm run run:all-presets       # All presets only
npm run run:all-templates     # All templates only
npm run run:os-presets        # Open source presets
npm run run:internal-presets  # Internal presets
```

## ⚙️ Configuration

### Preset Configuration System

The tool includes a sophisticated preset configuration system that automatically generates configuration files for each app type during creation. This system:

- **Shared Configuration**: Common settings applied to all presets (app description, package manager, test plugins, etc.)
- **Preset-Specific Configuration**: Tailored settings for each app type (TypeScript, Next.js router type, proxy settings, etc.)
- **Automatic Generation**: Configuration files are automatically created and passed to `create-gasket-app` during preset creation

Key configuration options include:
- `typescript`: Enable/disable TypeScript
- `nextServerType`: Next.js server configuration (`appRouter`, `pageRouter`, `customServer`)
- `nextDevProxy`: Proxy settings for development
- `hasGasketIntl`: Internationalization support
- `useRedux`: Redux integration
- `uxp`: UXP-specific settings for internal apps

### Environment Configuration

The tool generates a `.env` file on first run with customizable options:

### Package Configuration
```bash
# Open Source Preset Paths
OS_PRESET_NEXTJS=<path>
OS_PRESET_API=<path>
OS_PREID=latest          # Prerelease tag

# Internal Preset Paths
INTERNAL_PRESET_WEBAPP=<path>
INTERNAL_PRESET_API=<path>
INTERNAL_PRESET_HCS=<path>
INTERNAL_PREID=latest    # Prerelease tag
INTERNAL_REGISTRY=<url>  # Private registry

# Template Paths (Open Source)
OS_TEMPLATE_NEXTJS_APP=<path>
OS_TEMPLATE_NEXTJS_PAGES=<path>
OS_TEMPLATE_NEXTJS_EXPRESS=<path>
OS_TEMPLATE_API_EXPRESS=<path>
OS_TEMPLATE_API_FASTIFY=<path>

# Template Paths (Internal)
TEMPLATE_WEBAPP_APP=<path>
TEMPLATE_WEBAPP_PAGES=<path>
TEMPLATE_WEBAPP_EXPRESS=<path>
TEMPLATE_API_EXPRESS=<path>
TEMPLATE_API_FASTIFY=<path>
TEMPLATE_HCS=<path>
```

### Testing Configuration
```bash
# Control which tests run
RUN_BUILD=1      # Build applications
RUN_START=1      # Test production server
RUN_LOCAL=1      # Test development server
RUN_TEST=1       # Run test suites
RUN_DOCS=1       # Generate documentation

# General Options
SKIP_CREATE=1    # Skip app creation (use existing)
USE_LOCAL=1      # Use local packages
EXIT_ON_ERROR=1  # Stop on first error (CI/CD)
GASKET_CI=1      # Enable CI mode

# Logging Options
VERBOSE=1        # Show all output
QUIET=1          # Show only errors
```

### Package Management

The tool intelligently handles both open source and internal packages:

#### Local vs Remote Packages
- **Local Packages** (`USE_LOCAL=1`): Use local development versions via file paths
- **Remote Packages**: Use published packages from registries with version tags

#### Internal Package Support
- **Automatic Registry Setup**: Creates `.npmrc` files for internal package access
- **Dynamic Template/Preset Selection**: Automatically selects correct package based on app type
- **Version Tag Management**: Uses `INTERNAL_PREID` and `OS_PREID` for version control

#### Package Resolution
```bash
# Open Source Examples
@gasket/preset-nextjs@latest           # OS preset
@gasket/template-nextjs-app@latest     # OS template

# Internal Examples
@godaddy/gasket-preset-webapp@latest   # Internal preset
@godaddy/gasket-template-webapp-app@latest # Internal template
```

## 📊 Reporting

### Terminal Report
```bash
npm run report
```

Features:
- Summary statistics with success rates
- Categorized tables (OS/Internal, Presets/Templates)
- Command-specific statistics
- Failed operation details
- Visual indicators (✅ ❌ ⏭️)

### HTML Report
```bash
npm run report:html
```

Features:
- Interactive dashboard with filters
- Searchable results
- Visual progress bars
- Detailed error messages
- Auto-opens in browser

### JSON Report
```bash
npm run report:json
```

Outputs raw JSON for programmatic processing.

### Failures Only
```bash
npm run report:failures
```

Quick view of failed operations only.

## 📝 NPM Scripts

### Testing Commands
| Command | Description |
|---------|-------------|
| `npm start` | Interactive mode |
| `npm run cicd` | Run all tests (CI/CD mode) |
| `npm run build:only` | Build all apps |
| `npm run test:only` | Run tests only |
| `npm run render` | Test rendering |

### Batch Operations
| Command | Description |
|---------|-------------|
| `npm run run:all` | All app types |
| `npm run run:all-presets` | All presets |
| `npm run run:all-templates` | All templates |
| `npm run run:os-templates` | Open source templates |
| `npm run run:os-presets` | Open source presets |
| `npm run run:internal-templates` | Internal templates |
| `npm run run:internal-presets` | Internal presets |

### Reporting Commands
| Command | Description |
|---------|-------------|
| `npm run report` | Terminal report |
| `npm run report:html` | HTML report |
| `npm run report:json` | JSON output |
| `npm run report:failures` | Failures only |

### Utility Commands
| Command | Description |
|---------|-------------|
| `npm run clean:apps` | Remove generated apps |
| `npm run clean:files` | Clean test artifacts |
| `npm run clean:next` | Remove .next directories |

## 🎯 App Types

### Open Source Presets
- `app-router` - Next.js App Router
- `app-router-proxy` - App Router with proxy
- `app-router-ts` - App Router with TypeScript
- `app-router-ts-proxy` - App Router with TypeScript and proxy
- `page-router` - Next.js Page Router
- `page-router-proxy` - Page Router with proxy
- `page-router-ts` - Page Router with TypeScript
- `page-router-ts-proxy` - Page Router with TypeScript and proxy
- `page-router-express` - Page Router with Express
- `page-router-express-ts` - Page Router with Express and TypeScript
- `express` - Express API
- `express-ts` - Express API with TypeScript
- `fastify` - Fastify API
- `fastify-ts` - Fastify API with TypeScript

### Internal Presets
- `webapp-app-router` - Internal webapp with App Router
- `webapp-app-router-ts` - Internal webapp with App Router and TypeScript
- `webapp-page-router` - Internal webapp with Page Router
- `webapp-page-router-ts` - Internal webapp with Page Router and TypeScript
- `webapp-page-router-express` - Internal webapp with Page Router and Express
- `webapp-page-router-express-ts` - Internal webapp with Page Router, Express, and TypeScript
- `internal-express` - Internal Express API
- `internal-express-ts` - Internal Express API with TypeScript
- `hcs-express` - HCS application

### Templates
Templates are complete applications that require no configuration:

**Open Source:**
- `os-template-nextjs-app`
- `os-template-nextjs-pages`
- `os-template-nextjs-express`
- `os-template-api-express`
- `os-template-api-fastify`

**Internal:**
- `template-webapp-app`
- `template-webapp-pages`
- `template-webapp-express`
- `template-api-express`
- `template-api-fastify`
- `template-hcs`

## 🔍 Logging

The tool provides sophisticated logging with multiple modes:

### Default Mode
- Formatted sections with borders
- First 15 lines of output shown
- Errors always displayed
- Progress indicators for batch operations

```
┌─ Running build for express ───────────────
│  > express@0.0.0 build
│  > node gasket.js build
│  info: Wrote: swagger.json
└─ ✓ Complete (0.21s)
```

### Verbose Mode (`VERBOSE=1`)
- All output displayed
- Detailed timing information
- No output truncation

### Quiet Mode (`QUIET=1`)
- Only errors shown
- Minimal output

## 🔧 Development

### Project Structure
```
__apps__/         # Generated applications
.reports/         # Test reports
  ├── report.create.json
  ├── report.build.json
  ├── report.test.json
  ├── report.start.json
  ├── report.local.json
  ├── report.docs.json
  └── report.html
.env             # Configuration file
```

### Error Handling

The tool includes sophisticated error handling and filtering:

#### Error Classification
- **Real Errors**: Process failures, compilation errors, test failures
- **Ignored Patterns**: Common warnings and non-critical messages that shouldn't fail builds

#### Built-in Error Filtering
The tool automatically ignores common noise patterns:
- `Not implemented: window.computedStyle`
- `Found lockfile missing swc dependencies, patching`
- `No GASKET_ENV env variable set; defaulting to "local"`
- Webpack cache warnings
- NPM deprecation warnings
- And many more...

#### Error Processing
- Errors captured per app type and command
- `EXIT_ON_ERROR=1` for CI/CD fail-fast behavior
- Detailed error messages in reports
- Stack traces preserved for debugging
- Non-zero exit codes treated as failures even without explicit error messages

### Future Enhancements

#### Phase 2: Parallel Execution
- Port management for concurrent testing
- Dynamic port allocation
- Gasket config modification

#### Phase 3: Node Modules Caching
- Cache based on package.json hash
- Faster npm install operations
- Reduced CI/CD time

## 📚 Dependencies

### Core Dependencies
- **cli-table3** - Terminal table formatting for reports
- **create-gasket-app** - Gasket CLI for creating applications
- **dotenv** - Environment variable configuration management
- **open** - Browser opening for HTML reports
- **prompts** - Interactive CLI prompts and user input
- **terminate** - Graceful process termination

### Key Features
- **Dynamic Registry Creation**: Automatically creates `.npmrc` files for internal package registries
- **Port Management**: Handles port allocation for server testing (3000, 8080, 80, 8443)
- **Process Management**: Sophisticated process spawning and monitoring
- **Output Filtering**: Smart filtering of build output to reduce noise
- **Status Indicators**: Visual feedback with emoji indicators (🟢 🔴 🏁 🛠️ 💻 📦)

## 🤝 Contributing

1. Update `.env` with your package paths
2. Run tests with `npm run run:all`
3. Check reports with `npm run report`
4. Fix any failures
5. Submit PR with passing tests

---

This utility ensures the `create-gasket-app` CLI works correctly across all preset and template configurations, providing comprehensive validation of the Gasket ecosystem.
