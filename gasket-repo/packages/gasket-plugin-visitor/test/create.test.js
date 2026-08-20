import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRequire } from 'module';
import create from '../lib/create.js';

const require = createRequire(import.meta.url);
const { name, version } = require('../package.json');

describe('create', function () {
  let mockContext, pushMessageStub, mockPkgAdd, mockAddPlugin, mockGasketConfigAdd;

  beforeEach(function () {
    pushMessageStub = vi.fn();
    mockPkgAdd = vi.fn();
    mockGasketConfigAdd = vi.fn();
    mockAddPlugin = vi.fn();

    mockContext = {
      messages: { push: pushMessageStub },
      pkg: {
        add: mockPkgAdd
      },
      gasketConfig: {
        addPlugin: mockAddPlugin,
        add: mockGasketConfigAdd
      }
    };
  });

  it('exports a create hook', function () {
    expect(create).toBeTruthy();
  });

  it('pushes message onto context', function () {
    create({}, mockContext);
    expect(pushMessageStub).toHaveBeenCalled();
  });

  it('adds plugin and dependencies', function () {
    create({}, mockContext);
    expect(mockAddPlugin).toHaveBeenCalledWith('pluginVisitor', name);
    expect(mockPkgAdd).toHaveBeenCalledWith('dependencies', {
      [name]: `^${version}`
    });
  });
});
