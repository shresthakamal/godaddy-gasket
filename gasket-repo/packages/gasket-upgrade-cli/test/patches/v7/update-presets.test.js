const mockRunShellCommand = jest.fn().mockResolvedValue({
  stdout: `{ 'preset-dep': '1.0.0', 'create-only': '1.0.0' }`
});
const mockCreateOnlyPluginMap = {
  'create-only': true
};

jest.mock('@gasket/utils', () => ({ runShellCommand: mockRunShellCommand }));
jest.mock('../../../lib/utils/create-only-plugins.js', () => mockCreateOnlyPluginMap);

const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/v7/update-presets');
const patch = wrapper.wrapped;

describe('v7 patch - update presets', function () {
  let mockContext;

  beforeEach(function () {
    mockContext = makeContext();
  });

  it('is decorated with spinner', function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('retreives presets using npm info', async function () {
    const content = {
      dependencies: {
        'gasket-preset-next': '*'
      }
    };
    mockContext.files.set('package.json', content);
    await patch(mockContext);
    expect(mockRunShellCommand).toHaveBeenCalledWith('npm',
      [
        'info',
        'gasket-preset-next',
        'dependencies'
      ],
      {
        cwd: process.cwd()
      });
  });

  it('updates presets in package.json', async function () {
    const content = {
      dependencies: {
        'gasket-preset-next': '*'
      }
    };
    mockContext.files.set('package.json', content);
    await patch(mockContext);
    const results = mockContext.files.get('package.json');
    expect(results).toEqual({ dependencies: { 'preset-dep': '1.0.0' } });
  });

  it('does not include create-only plugins in dependencies', async function () {
    const content = {
      dependencies: {
        'gasket-preset-next': '*'
      }
    };
    mockContext.files.set('package.json', content);
    await patch(mockContext);
    const results = mockContext.files.get('package.json');
    expect(results).toEqual({ dependencies: { 'preset-dep': '1.0.0' } });
  });

  it('stages the package.json file to git', async function () {
    const content = {
      dependencies: {
        'gasket-preset-next': '*'
      }
    };
    mockContext.files.set('package.json', content);
    mockContext.git.add = jest.fn();

    await patch(mockContext);

    expect(mockContext.git.add).toHaveBeenCalledWith(expect.stringContaining('package.json'));
  });
});
