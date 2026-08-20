import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import createHook from '../lib/create.js';

const packageJsonPath = new URL('../package.json', import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const { name, version } = pkg;

describe('create', function () {
  let mockContext, mockPkgAdd, mockAddPlugin, mockGasketConfigAdd;

  beforeEach(() => {
    mockPkgAdd = vi.fn();
    mockGasketConfigAdd = vi.fn();
    mockAddPlugin = vi.fn();
    mockContext = {
      pkg: {
        add: mockPkgAdd
      },
      gasketConfig: {
        addPlugin: mockAddPlugin,
        add: mockGasketConfigAdd
      }
    };
  });

  it('adds plugin and dependencies', function () {
    // @ts-expect-error - minimal mock for testing
    createHook({}, mockContext);
    expect(mockAddPlugin).toHaveBeenCalledWith('pluginTraffic', name);
    expect(mockPkgAdd).toHaveBeenCalledWith('dependencies', {
      [name]: `^${version}`,
      '@opentelemetry/api': expect.any(String),
      '@opentelemetry/resources': expect.any(String),
      '@opentelemetry/semantic-conventions': expect.any(String)
    });
  });
});
