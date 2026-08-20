/* eslint-disable no-lonely-if */
/**
 * Logger service with different verbosity levels and output formatting
 * @param {object} options - The options for the logger
 * @param {boolean} options.verbose - Whether to enable verbose mode
 * @param {boolean} options.quiet - Whether to enable quiet mode
 */
export class Logger {
  constructor(options = {}) {
    this.verboseMode = options.verbose || process.env.VERBOSE === '1';
    this.quietMode = options.quiet || process.env.QUIET === '1';
    this.currentSection = null;
    this.sectionStartTime = new Map();
    this.sectionLineCount = new Map();
    this.maxSectionLines = 15; // Max lines to show in a section before scrolling
  }

  // Log levels
  static LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
    VERBOSE: 'verbose'
  };

  // ANSI color codes
  static COLORS = {
    reset: '\x1b[0m',
    dim: '\x1b[2m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m'
  };

  /**
   * Get prefix for log level
   * @param {string} level - The level of the log
   * @returns {string} The prefix for the log level
   */
  getPrefix(level) {
    const prefixes = {
      [Logger.LEVELS.ERROR]: this.color('✗', 'red'),
      [Logger.LEVELS.WARN]: this.color('⚠', 'yellow'),
      [Logger.LEVELS.INFO]: this.color('ℹ', 'blue'),
      [Logger.LEVELS.DEBUG]: this.color('○', 'gray'),
      [Logger.LEVELS.VERBOSE]: this.color('▫', 'dim')
    };
    return prefixes[level] || '';
  }

  /**
   * Apply color to text
   * @param {string} text - The text to apply the color to
   * @param {string} color - The color to apply to the text
   * @returns {string} The text with the color applied
   */
  color(text, color) {
    return `${Logger.COLORS[color]}${text}${Logger.COLORS.reset}`;
  }

  /**
   * Start a section (formatted in default mode, plain in verbose)
   * @param {string} name - The name of the section
   * @param {string} title - The title of the section
   */
  startSection(name, title) {
    if (this.quietMode) return;

    this.sectionStartTime.set(name, Date.now());
    this.currentSection = name;
    this.sectionLineCount.set(name, 0);

    if (this.verboseMode) {
      // Verbose mode: simple output
      console.log(this.color(`\n=== ${title} ===`, 'cyan'));
    } else {
      // Default mode: formatted section header with bold white title
      console.log('');
      console.log(this.color('┌─', 'gray') + this.color(` ${title} `, 'white') + this.color('─'.repeat(Math.max(0, 60 - title.length - 4)), 'gray'));
    }
  }

  /**
   * Output content within a section
   * @param {string} content - The content to output within the section
   */
  sectionOutput(content) {
    if (this.quietMode || !content || content.trim() === '') return;

    if (this.verboseMode) {
      // Verbose mode: just output as-is
      console.log(content);
    } else if (this.currentSection) {
      // Default mode: formatted with prefix and dimmed content
      const lines = content.split('\n').filter(line => line.trim());

      lines.forEach(line => {
        const count = this.sectionLineCount.get(this.currentSection) || 0;

        // Add section border and indent with dimmed content
        if (count < this.maxSectionLines || line.includes('error') || line.includes('Error')) {
          // Errors show in normal color, everything else is dimmed
          if (line.includes('error') || line.includes('Error')) {
            console.log(this.color('│ ', 'gray') + ' ' + line);
          } else {
            console.log(this.color('│ ', 'gray') + ' ' + this.color(line, 'gray'));
          }
        } else if (count === this.maxSectionLines) {
          console.log(this.color('│ ', 'gray') + this.color(' ... (additional output hidden, use VERBOSE=1 to see all)', 'dim'));
        }

        this.sectionLineCount.set(this.currentSection, count + 1);
      });
    } else {
      // No section active, just output
      console.log(content);
    }
  }

  /**
   * End a section
   * @param {string} name - The name of the section
   * @param {boolean} success - Whether the section was successful
   */
  endSection(name, success = true) {
    if (this.quietMode) return;

    const duration = Date.now() - (this.sectionStartTime.get(name) || Date.now());
    const durationStr = `${(duration / 1000).toFixed(2)}s`;

    if (this.verboseMode) {
      // Verbose mode: simple status
      const status = success ? this.color('✓ SUCCESS', 'green') : this.color('✗ FAILED', 'red');
      console.log(`${status} (${durationStr})\n`);
    } else {
      // Default mode: formatted section footer
      const status = success
        ? this.color('✓', 'green')
        : this.color('✗', 'red');
      const statusText = success ? 'Complete' : 'Failed';

      console.log(this.color('└─', 'gray') + ` ${status} ${statusText} ${this.color(`(${durationStr})`, 'gray')}`);
    }

    this.currentSection = null;
    this.sectionLineCount.delete(name);
    this.sectionStartTime.delete(name);
  }

  /**
   * Log a message with a specific level
   * @param {string} level - The level of the log
   * @param {string} message - The message to log
   * @param {object} context - The context for the log
   */
  log(level, message, context = {}) {
    if (this.quietMode && level !== Logger.LEVELS.ERROR) return;

    const prefix = this.getPrefix(level);
    const formattedMessage = this.formatMessage(level, message, context);

    if (this.currentSection && !this.verboseMode) {
      // We're in a section, format accordingly
      if (level === Logger.LEVELS.ERROR) {
        // Errors always show
        console.log(this.color('│ ', 'gray') + `${prefix} ${formattedMessage}`);
      } else if (level === Logger.LEVELS.DEBUG || level === Logger.LEVELS.VERBOSE) {
        // Only show debug/verbose in verbose mode
        if (this.verboseMode) {
          console.log(`${prefix} ${formattedMessage}`);
        }
      } else {
        // Info/warn show in sections
        const count = this.sectionLineCount.get(this.currentSection) || 0;
        if (count < this.maxSectionLines) {
          console.log(this.color('│ ', 'gray') + `${prefix} ${formattedMessage}`);
          this.sectionLineCount.set(this.currentSection, count + 1);
        }
      }
    } else {
      // Not in a section, normal logging
      if ((level === Logger.LEVELS.DEBUG || level === Logger.LEVELS.VERBOSE) && !this.verboseMode) {
        return; // Skip debug/verbose in non-verbose mode
      }
      console.log(`${prefix} ${formattedMessage}`);
    }
  }

  /**
   * Format message with context
   * @param {string} level - The level of the log
   * @param {string} message - The message to log
   * @param {object} context - The context for the log
   * @returns {string} The formatted message
   */
  formatMessage(level, message, context) {
    if (!context || Object.keys(context).length === 0) {
      return message;
    }

    const contextStr = Object.entries(context)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');

    return `${message} ${this.color(`[${contextStr}]`, 'gray')}`;
  }

  // Convenience methods
  /**
   * Log an error message
   * @param {string} message - The message to log
   * @param {object} context - The context for the log
   */
  error(message, context = {}) {
    this.log(Logger.LEVELS.ERROR, message, context);
  }

  /**
   * Log a warning message
   * @param {string} message - The message to log
   * @param {object} context - The context for the log
   */
  warn(message, context = {}) {
    this.log(Logger.LEVELS.WARN, message, context);
  }

  /**
   * Log an info message
   * @param {string} message - The message to log
   * @param {object} context - The context for the log
   */
  info(message, context = {}) {
    this.log(Logger.LEVELS.INFO, message, context);
  }

  /**
   * Log a debug message
   * @param {string} message - The message to log
   * @param {object} context - The context for the log
   */
  debug(message, context = {}) {
    this.log(Logger.LEVELS.DEBUG, message, context);
  }

  /**
   * Log a verbose message
   * @param {string} message - The message to log
   * @param {object} context - The context for the log
   */
  verbose(message, context = {}) {
    this.log(Logger.LEVELS.VERBOSE, message, context);
  }

  /**
   * Progress indicator for tasks
   * @param {number} current - The current progress
   * @param {number} total - The total progress
   * @param {string} message - The message to log
   */
  progress(current, total, message = '') {
    if (this.quietMode) return;

    // Always show progress bar, even for single items
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    const barLength = 30;
    const filled = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);

    if (this.verboseMode) {
      // In verbose mode, just print progress updates
      console.log(`Progress: ${percentage}% - ${message}`);
    } else {
      // In default mode, use dynamic progress bar
      if (process.stdout && process.stdout.clearLine) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`${this.color(bar, 'cyan')} ${percentage}% ${message}`);

        if (current >= total) {
          // Clear and move to new line when complete
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
        }
      } else {
        console.log(`${this.color(bar, 'cyan')} ${percentage}% ${message}`);
      }
    }
  }

  /**
   * Display a formatted box with title and content
   * @param {string} title - The title of the box
   * @param {string[]} lines - The lines of the box
   */
  box(title, lines) {
    if (this.quietMode) return;

    const maxLength = Math.max(title.length, ...lines.map(l => l.length)) + 2;
    const width = Math.min(maxLength, 60);

    if (this.verboseMode) {
      // Simple format in verbose mode
      console.log(`\n=== ${title} ===`);
      lines.forEach(line => console.log(line));
      console.log('');
    } else {
      // Fancy box in default mode
      console.log('');
      console.log(this.color('╔' + '═'.repeat(width + 2) + '╗', 'cyan'));
      console.log(this.color('║', 'cyan') + ` ${title.padEnd(width)} ` + this.color('║', 'cyan'));
      console.log(this.color('╠' + '═'.repeat(width + 2) + '╣', 'cyan'));

      lines.forEach(line => {
        const truncated = line.length > width ? line.substring(0, width - 3) + '...' : line;
        console.log(this.color('║', 'cyan') + ` ${truncated.padEnd(width)} ` + this.color('║', 'cyan'));
      });

      console.log(this.color('╚' + '═'.repeat(width + 2) + '╝', 'cyan'));
      console.log('');
    }
  }

  /**
   * Table output for structured data
   * @param {object} data - The data to display in the table
   * @param {string} title - The title of the table
   */
  table(data, title) {
    if (this.quietMode) return;

    if (title) {
      console.log(this.color(`\n${title}`, 'bright'));
      console.log(this.color('─'.repeat(50), 'gray'));
    }

    console.table(data);
  }

  /**
   * Group related log messages
   * @param {string} label - The label of the group
   */
  group(label) {
    if (!this.quietMode && !this.verboseMode) {
      console.log(this.color(`\n▼ ${label}`, 'cyan'));
    } else if (this.verboseMode) {
      console.log(`\n--- ${label} ---`);
    }
  }

  /**
   * End a group
   * @returns {void}
   */
  groupEnd() {
    // Could track nesting level if needed
  }

  /**
   * Clear the console
   */
  clear() {
    if (!this.quietMode && process.stdout && process.stdout.write) {
      process.stdout.write('\x1Bc');
    }
  }

  /**
   * Create a child logger with the same options
   * @param {string} prefix - The prefix to add to the log messages
   * @returns {Logger} The child logger
   */
  child(prefix) {
    const childLogger = new Logger({
      verbose: this.verboseMode,
      quiet: this.quietMode
    });

    // Override methods to add prefix
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (level, message, context) => {
      originalLog(level, `[${prefix}] ${message}`, context);
    };

    return childLogger;
  }
}
