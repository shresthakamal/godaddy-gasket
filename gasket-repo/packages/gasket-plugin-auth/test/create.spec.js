import { vi } from 'vitest';
import create from '../lib/create.js';
import pkg from '../package.json' with { type: 'json' };

const { name, version, devDependencies } = pkg;

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
    await create({}, mockContext);
    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginAuth', name);
  });

  it('adds the expected dependencies', async function () {
    await create({}, mockContext);
    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      [name]: `^${version}`
    });
    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      '@godaddy/gasket-auth': devDependencies['@godaddy/gasket-auth']
    });
  });

  it('skips extra additions for APIs', async function () {
    mockContext.apiApp = true;

    await create({}, mockContext);
    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      [name]: `^${version}`
    });
    expect(mockContext.pkg.add).not.toHaveBeenCalledWith('dependencies', {
      '@godaddy/gasket-auth': devDependencies['@godaddy/gasket-auth']
    });
  });

  it('skips file generation if using customServer', async function () {
    mockContext.nextServerType = 'customServer';
    await create({}, mockContext);
    expect(mockContext.files.add).not.toHaveBeenCalled();
  });

  it('adds files for the default server', async function () {
    mockContext.nextServerType = 'defaultServer';
    await create({}, mockContext);
    expect(mockContext.files.add).toHaveBeenCalled();
  });

  it('adds files for the app router', async function () {
    mockContext.useAppRouter = true;
    mockContext.nextServerType = 'defaultServer';
    await create({}, mockContext);
    expect(mockContext.files.add).toHaveBeenCalledWith(expect.stringMatching(/app-router/));
  });

  it('adds files for the page router', async function () {
    mockContext.useAppRouter = false;
    mockContext.nextServerType = 'defaultServer';
    await create({}, mockContext);
    expect(mockContext.files.add).toHaveBeenCalledWith(expect.stringMatching(/page-router/));
  });

  it('adds files for typescript', async function () {
    mockContext.typescript = true;
    mockContext.nextServerType = 'defaultServer';
    await create({}, mockContext);
    expect(mockContext.files.add).toHaveBeenCalledWith(expect.stringMatching(/!\(\*.js\)$/));
  });
});
