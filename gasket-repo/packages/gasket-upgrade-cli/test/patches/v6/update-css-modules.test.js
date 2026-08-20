const wrapper = require('../../../lib/patches/v6/update-css-modules');
const patch = wrapper.wrapped;

const { makeContext } = require('../../../lib/patcher');

describe('v6 patch - update css modules', function () {
  let mockContext, mockSpinner;

  beforeEach(function () {
    mockContext = makeContext({
      cwd: '/path/to/app',
      pkg: {},
      git: {
        mv: jest.fn()
      },
      cssModuleFiles: true
    });
    mockContext.files.set('package.json', { name: 'app-name' });
    mockSpinner = {
      info: jest.fn()
    };
  });

  it('is decorated with spinner', function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('renames css files in component imports', async function () {
    mockContext.files.set('components/example.js', 'import \'./example.scss\';');
    await patch(mockContext, mockSpinner);
    expect(mockContext.git.mv).toHaveBeenCalled();
    expect(mockContext.git.mv.mock.calls[0][0]).toContain('/components/example.scss');
    expect(mockContext.git.mv.mock.calls[0][1]).toContain('/components/example.module.scss');
  });

  it('ignores css files in _app.js imports', async function () {
    mockContext.files.set('pages/_app.js', 'import \'./example.scss\';');
    await patch(mockContext, mockSpinner);
    expect(mockContext.git.mv).not.toHaveBeenCalled();
  });

  it('ignores css files already containing .module', async function () {
    mockContext.files.set('components/example.js', 'import \'./example.module.scss\';');
    await patch(mockContext, mockSpinner);
    expect(mockContext.git.mv).not.toHaveBeenCalled();
  });

  it('renames css imports', async function () {
    mockContext.files.set('components/example.js', 'import \'./example.scss\';');
    await patch(mockContext, mockSpinner);
    const results = mockContext.files.get('components/example.js');
    expect(results).toEqual('import \'./example.module.scss\';');
  });

  it('logs info if not moving', async function () {
    mockContext.cssModuleFiles = false;
    await patch(mockContext, mockSpinner);
    expect(mockSpinner.info).toHaveBeenCalledWith(
      expect.stringContaining('(skipped)')
    );
  });
});
