const mockWriteFile = jest.fn().mockResolvedValue();
const mockExistsSync = jest.fn().mockReturnValue(true);

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

const wrapper = require('../../../lib/patches/v6/rename-static-dir');
const { makeContext } = require('../../../lib/patcher');
const filePath = 'any.js';

describe('v6 patch - rename static dir', function () {
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
    mockContext.renameStaticDir = true;
    await patch(mockContext, mockSpinner);
    expect(mockContext.git.mv).toHaveBeenCalled();
    expect(mockContext.git.mv.mock.calls[0]).toEqual(['/path/to/app/static', '/path/to/app/public']);
  });

  it('fixes references', async function () {
    mockContext.renameStaticDir = true;
    const content = `<img src="/static/image.gif"/>`;
    mockContext.files.set(filePath, content);
    await patch(mockContext, mockSpinner);
    const results = mockContext.files.get(filePath);

    expect(results).not.toContain('static');
    expect(results).toEqual('<img src="/public/image.gif"/>');
  });

  it('reports next steps', async function () {
    mockContext.renameStaticDir = true;
    expect(mockContext.nextSteps).toHaveLength(0);
    await patch(mockContext, mockSpinner);
    expect(mockContext.nextSteps).toHaveLength(1);
  });

  it('logs info if not moving', async function () {
    mockContext.renameStaticDir = false;
    await patch(mockContext, mockSpinner);
    expect(mockSpinner.info).toHaveBeenCalledWith(
      expect.stringContaining('(skipped)')
    );
  });
});
