const mockGlob = jest.fn().mockResolvedValue([]);
const mockInquirer = jest.fn().mockResolvedValue({ useRtl: true });

jest.mock('util', () => ({
  ...jest.requireActual('util'),
  promisify: () => mockGlob
}));

jest.mock('inquirer', () => ({
  prompt: mockInquirer
}));

const wrapper = require('../../../lib/patches/next-12/setup-rtlcss');
const { makeContext } = require('../../../lib/patcher');

describe('next 12 patch - setup rtlcss', function () {
  let mockContext, mockPackage, mockSpinner, patch;

  beforeEach(function () {
    mockContext = makeContext();
    mockContext.useRtl = true;
    mockPackage = {
      dependencies: {}
    };
    mockSpinner = {
      info: jest.fn()
    };

    patch = wrapper.wrapped;
    mockContext.files.set('package.json', mockPackage);
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  it('is decorated with spinner', function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  describe('prompt', function () {
    beforeEach(function () {
      delete mockContext.useRtl;
    });

    it('prompts and adds useRtl', async function () {
      await wrapper.prompt(mockContext);
      expect(mockInquirer).toHaveBeenCalled();
      expect(mockContext).toHaveProperty('useRtl', true);
    });

    it('does not prompt if postcss config exists', async function () {
      mockGlob.mockResolvedValueOnce(['postcss.config.js']);
      await wrapper.prompt(mockContext);
      expect(mockInquirer).not.toHaveBeenCalled();
      expect(mockContext.useRtl).toBeFalsy();
    });
  });

  it('skips if not enable from prompt', async function () {
    delete mockContext.useRtl;
    await patch(mockContext, mockSpinner);
    expect(mockSpinner.info).toHaveBeenCalledWith(
      expect.stringContaining('(skipped)')
    );
  });

  it('adds expected dependencies', async function () {
    await patch(mockContext, mockSpinner);

    expect(mockPackage.devDependencies).toEqual({
      'postcss': '^8.4.5',
      'postcss-flexbugs-fixes': '^5.0.2',
      'postcss-preset-env': '^7.2.3',
      'postcss-rtlcss': '^3.5.0'
    });
  });

  it('adds expected dependencies: postcss', async function () {
    await patch(mockContext, mockSpinner);

    expect(mockPackage).toHaveProperty('postcss');
  });
});
