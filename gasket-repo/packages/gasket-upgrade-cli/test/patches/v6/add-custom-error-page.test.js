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

const wrapper = require('../../../lib/patches/v6/add-custom-error-page');
const { makeContext } = require('../../../lib/patcher');

describe('v6 patch - add custom error page', function () {
  let mockContext, mockSpinner, patch;

  beforeEach(function () {
    mockContext = makeContext({
      cwd: '/path/to/app',
      pkg: {}
    });
    mockSpinner = {
      info: jest.fn()
    };

    patch = wrapper.wrapped;
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  it('is decorated with spinner', function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  describe('when _error page is missing', function () {
    it('creates one', async function () {
      await patch(mockContext, mockSpinner);
      expect(mockWriteFile).toHaveBeenCalled();
    });
  });

  describe('when _error page is present', function () {
    it('does nothing', async function () {
      mockExistsSync.mockReturnValue(true);
      await patch(mockContext, mockSpinner);
      expect(mockWriteFile).not.toHaveBeenCalled();
    });
  });
});
