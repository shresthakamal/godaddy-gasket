import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import create from '../lib/create.js';

const packageJsonPath = new URL('../package.json', import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const { name, version } = pkg;

describe('create', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      gasketConfig: {
        addPlugin: vi.fn()
      },
      pkg: {
        add: vi.fn()
      },
      files: {
        add: vi.fn()
      }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('adds the plugin to the gasket config', async function () {
    // @ts-expect-error - minimal mock for testing
    await create({}, mockContext);
    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginSharedHeader', name);
  });

  it('adds the expected dependencies', async function () {
    // @ts-expect-error - minimal mock for testing
    await create({}, mockContext);
    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      [name]: `^${version}`
    });
  });
});
