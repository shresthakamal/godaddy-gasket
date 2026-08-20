const mockWriteFile = jest.fn().mockResolvedValue();
const mockExistsSync = jest.fn().mockReturnValue(false);

jest.mock('fs', () => {
  const mod = jest.requireActual('fs');
  return {
    ...mod,
    promises: {
      ...mod.promises,
      writeFile: mockWriteFile
    },
    existsSync: mockExistsSync
  };
});

jest.mock('util', () => ({
  ...jest.requireActual('util'),
  promisify: f => f
}));

const wrapper = require('../../../lib/patches/v6/move-locales-to-public');
const { makeContext } = require('../../../lib/patcher');

describe('v6 patch - move locales to public', function () {
  let mockContext, mockSpinner, patch;

  beforeEach(function () {
    mockContext = makeContext({
      cwd: '/path/to/app',
      pkg: {},
      git: {
        mv: jest.fn()
      }
    });
    mockContext.files.set('package.json', { name: 'app-name' });
    mockSpinner = {
      info: jest.fn()
    };
    patch = wrapper.wrapped;
  });

  it('is decorated with spinner', function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('git mv the directory', async function () {
    mockContext.moveLocaleToPublic = true;
    await patch(mockContext, mockSpinner);
    expect(mockContext.git.mv).toHaveBeenCalledWith('/path/to/app/locales', '/path/to/app/public/locales');
  });

  it('logs info if not moving', async function () {
    mockContext.moveLocaleToPublic = false;
    await patch(mockContext, mockSpinner);
    expect(mockSpinner.info).toHaveBeenCalledWith(
      expect.stringContaining('(skipped)')
    );
  });
});
