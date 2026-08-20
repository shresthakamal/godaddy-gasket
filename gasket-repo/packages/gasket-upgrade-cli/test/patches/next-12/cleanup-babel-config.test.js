const mockGlob = jest.fn().mockResolvedValue([]);

jest.mock('util', () => ({
  ...jest.requireActual('util'),
  promisify: jest.fn().mockImplementation(() => mockGlob)
}));

const wrapper = require('../../../lib/patches/next-12/cleanup-babel-config');
const { makeContext } = require('../../../lib/patcher');

describe('next 12 patch - cleanup babel config', function () {
  let mockContext, mockPackage, mockSpinner, patch, gitRmStub;

  beforeEach(function () {
    mockPackage = {
      dependencies: {},
      devDependencies: {}
    };
    mockContext = makeContext();
    jest.replaceProperty(mockContext, 'pkg', mockPackage);

    mockSpinner = {
      info: jest.fn()
    };

    gitRmStub = jest.spyOn(mockContext.git, 'rm').mockResolvedValue(true);
    patch = wrapper.wrapped;
    mockContext.files.set('package.json', mockPackage);
  });

  it('is decorated with spinner', function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('skips if no config', async function () {
    await patch(mockContext, mockSpinner);
    expect(mockSpinner.info).toHaveBeenCalledWith(
      expect.stringContaining('(skipped)')
    );
  });

  it('removes babel config file if found', async function () {
    mockGlob.mockResolvedValueOnce(['.babelrc']);
    await patch(mockContext, mockSpinner);
    expect(gitRmStub).toHaveBeenCalled();
  });

  it('removes babel config prop of found', async function () {
    mockPackage.babel = {};
    expect(mockPackage).toHaveProperty('babel');
    await patch(mockContext, mockSpinner);
    expect(mockPackage).not.toHaveProperty('babel');
  });

  describe('with mocha', function () {
    beforeEach(function () {
      mockPackage.scripts = {
        'test:runner': 'mocha --require setup-env --recursive "test/**/*.*(test|spec).js"'
      };
      mockGlob.mockResolvedValueOnce(['.babelrc']);
      mockPackage.devDependencies.mocha = '^8.0.0';
    });

    it('adds setup script', async function () {
      await patch(mockContext, mockSpinner);
      expect(mockContext.files.get('test/setup.js')).toBeDefined();
    });

    it('updates mocha script', async function () {
      mockPackage.scripts = {
        'test:runner': 'mocha -r setup-env --recursive "test/**/*.*(test|spec).js"'
      };
      await patch(mockContext, mockSpinner);
      expect(mockPackage.scripts).toHaveProperty('test:runner',
        'mocha -r setup-env -r ./test/setup.js --recursive "test/**/*.*(test|spec).js"'
      );
    });

    it('updates mocha script (shortens)', async function () {
      mockPackage.scripts = {
        'test:runner': 'mocha --require setup-env --recursive "test/**/*.*(test|spec).js"'
      };
      await patch(mockContext, mockSpinner);
      expect(mockPackage.scripts).toHaveProperty('test:runner',
        'mocha -r setup-env -r ./test/setup.js --recursive "test/**/*.*(test|spec).js"'
      );
    });
  });
});
