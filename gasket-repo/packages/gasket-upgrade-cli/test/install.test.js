const mockConstructor = jest.fn();
const mockInstall = jest.fn().mockResolvedValue();
const mockRimraf = jest.fn().mockResolvedValue();
const mockExistsSync = jest.fn().mockReturnValue(false);

jest.mock('fs', () => ({
  existsSync: mockExistsSync
}));

jest.mock('rimraf', () => mockRimraf);

jest.mock('@gasket/utils', () => ({
  PackageManager: class PackageManager {
    constructor() { mockConstructor(...arguments); }
    install() {
      mockInstall(...arguments);
    }
  }
}));

jest.mock('util', () => ({
  promisify: f => f
}));

const install = require('../lib/install');
const path = require('path');

describe('install', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      cwd: path.join('path', 'to', 'project'),
      flags: { install: true }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('wipes out existing node_modules', async () => {
    await install(mockContext);
    const expected = path.join(mockContext.cwd, 'node_modules');
    expect(mockRimraf).toHaveBeenCalledWith(expected);
  });

  it('wipes out existing package-lock.json for npm', async () => {
    await install(mockContext);
    const expected = path.join(mockContext.cwd, 'package-lock.json');
    expect(mockRimraf).toHaveBeenCalledWith(expected);
  });

  it('wipes out existing yarn.lock for yarn', async () => {
    mockExistsSync.mockReturnValueOnce(true);
    await install(mockContext);
    const expected = path.join(mockContext.cwd, 'yarn.lock');
    expect(mockRimraf).toHaveBeenCalledWith(expected);
  });

  it('instantiates PackageManager with npm as default', async () => {
    await install(mockContext);
    const expected = { dest: mockContext.cwd, packageManager: 'npm' };
    expect(mockConstructor).toHaveBeenCalledWith(expected);
  });

  it('instantiates PackageManager with yarn if yarn.lock found', async () => {
    mockExistsSync.mockReturnValueOnce(true);
    await install(mockContext);
    const expected = { dest: mockContext.cwd, packageManager: 'yarn' };
    expect(mockConstructor).toHaveBeenCalledWith(expected);
  });

  it('executes install method', async () => {
    await install(mockContext);
    expect(mockInstall).toHaveBeenCalled();
  });

  it('does not clean or install with flag: `--no-install`', async () => {
    mockContext.flags.install = false;
    await install(mockContext);
    expect(mockRimraf).not.toHaveBeenCalled();
    expect(mockInstall).not.toHaveBeenCalled();
  });
});
