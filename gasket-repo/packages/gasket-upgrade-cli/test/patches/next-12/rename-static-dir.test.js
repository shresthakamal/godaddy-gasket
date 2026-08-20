const mockOriginal = jest.fn();
const mockExistsSync = jest.fn();

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: mockExistsSync
}));

jest.mock('../../../lib/patches/v6/rename-static-dir', () => mockOriginal);

const patch = require('../../../lib/patches/next-12/rename-static-dir');
const { makeContext } = require('../../../lib/patcher');

describe('next 12 patch - rename static dir', function () {
  let mockContext;

  beforeEach(function () {
    mockContext = makeContext({
      patches: {
        'next-12': true,
        'v6': false
      }
    });
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  it('calls original if next-12 patch-only', async function () {
    mockContext.patches.v6 = false;
    await patch(mockContext);
    expect(mockOriginal).toHaveBeenCalled();
  });

  it('does not call original if v6 patch also', async function () {
    mockContext.patches.v6 = true;
    await patch(mockContext);
    expect(mockOriginal).not.toHaveBeenCalled();
  });

  describe('prompt', function () {
    it('forces renameStaticDir if dir exists', async function () {
      mockExistsSync.mockReturnValue(true);
      await patch.prompt(mockContext);
      expect(mockContext.renameStaticDir).toBeTruthy();
    });

    it('does not set renameStaticDir if dir does not exists', async function () {
      mockExistsSync.mockReturnValue(false);
      await patch.prompt(mockContext);
      expect(mockContext.renameStaticDir).toBeFalsy();
    });
  });
});
