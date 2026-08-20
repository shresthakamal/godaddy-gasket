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

const wrapper = require('../../../lib/patches/v6/ignore-locales-artifacts');
const { makeContext } = require('../../../lib/patcher');


describe('v6 patch - ignore locales artifacts', function () {
  let mockContext, patch;

  beforeEach(function () {
    mockContext = makeContext({
      cwd: '/path/to/app',
      pkg: {},
      git: {
        add: jest.fn()
      }
    });
    mockContext.files.set('package.json', { name: 'app-name' });
    patch = wrapper.wrapped;
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  it('is decorated with spinner', function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('writes .gitignore if /public/locales dir', async function () {
    mockExistsSync.mockReturnValueOnce(true);
    await patch(mockContext);
    expect(mockWriteFile).toHaveBeenCalledWith(
      '/path/to/app/public/locales/.gitignore',
      expect.any(String),
      'utf8'
    );
  });

  it('writes .gitignore if root /locales dir', async function () {
    mockExistsSync
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    await patch(mockContext);
    expect(mockWriteFile).toHaveBeenCalledWith(
      '/path/to/app/locales/.gitignore',
      expect.any(String),
      'utf8'
    );
  });

  it('does not write .gitignore if no locales dir', async function () {
    mockExistsSync.mockReturnValueOnce(false);
    await patch(mockContext);
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it('adds .gitignore file to git', async function () {
    mockExistsSync.mockReturnValueOnce(true);
    await patch(mockContext);
    expect(mockWriteFile).toHaveBeenCalledWith(
      '/path/to/app/public/locales/.gitignore',
      expect.any(String),
      'utf8'
    );
    expect(mockContext.git.add).toHaveBeenCalled();
  });
});
