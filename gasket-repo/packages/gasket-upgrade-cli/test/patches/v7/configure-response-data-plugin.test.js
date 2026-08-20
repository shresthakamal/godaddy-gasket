const { makeContext } = require('../../../lib/patcher');

jest.mock('fs', () => {
  const mod = jest.requireActual('fs');
  return {
    ...mod,
    existsSync: jest.fn((path) => {
      if (path.includes('data')) {
        return false;
      }
      return true;
    })
  };
});
const wrapper = require('../../../lib/patches/v7/configure-response-data-plugin');
const patch = wrapper.wrapped;

const filePath = 'any.js';

describe('v7 patch - configure response data plugin', function () {
  let mockContext;

  beforeEach(function () {
    mockContext = makeContext({
      cwd: '/path/to/app',
      pkg: {},
      git: {
        mv: jest.fn().mockResolvedValue()
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is decorated with spinner', function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('git mv the directory', async function () {
    mockContext.files.set('config/base.js', 'content');
    const delSpy = jest.spyOn(mockContext.files, 'delete');
    const setSpy = jest.spyOn(mockContext.files, 'set');

    await patch(mockContext);
    expect(mockContext.git.mv).toHaveBeenCalledWith('/path/to/app/config', '/path/to/app/gasket-data');

    expect(delSpy).toHaveBeenCalledWith('config/base.js');
    expect(setSpy).toHaveBeenCalledWith('gasket-data/base.js', expect.any(String));

  });

  it('git mv files', async function () {
    await patch(mockContext);
    expect(mockContext.git.mv).toHaveBeenCalledWith('/path/to/app/app.config.js', '/path/to/app/gasket-data.config.js');
  });

  it('renames dirs', async function () {
    const content = `require('../config/any-file.js')`;
    mockContext.files.set(filePath, content);
    await patch(mockContext);
    const results = mockContext.files.get(filePath);

    expect(results).not.toContain('config');
    expect(results).toContain(`require('../gasket-data/any-file.js')`);
  });

  it('renames files', async function () {
    const content = `require('../app.config.js')`;
    mockContext.files.set(filePath, content);
    await patch(mockContext);
    const results = mockContext.files.get(filePath);

    expect(results).not.toContain('app.config.js');
    expect(results).toContain(`require('../gasket-data.config.js')`);
  });

  it('does not rename other files in path name', async function () {
    const content = `require('../other.config.js')`;
    mockContext.files.set(filePath, content);
    await patch(mockContext);
    const results = mockContext.files.get(filePath);

    expect(results).toContain('other.config.js');
  });

  it('does not rename other dirs in path name', async function () {
    const content = `require('../other/any-file.js')`;
    mockContext.files.set(filePath, content);
    await patch(mockContext);
    const results = mockContext.files.get(filePath);

    expect(results).toContain('other');
  });
});
