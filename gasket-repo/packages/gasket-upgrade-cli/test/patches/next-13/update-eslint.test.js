const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/next-13/update-eslint');
const patch = wrapper.wrapped;

describe('next 13 patch - update eslint', function () {
  let mockContext, mockPackage;

  beforeEach(function () {
    mockContext = makeContext();
    mockPackage = {
      dependencies: {}
    };

    mockContext.files.set('package.json', mockPackage);
  });

  it('is decorated with spinner', function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('adds nextSteps', async function () {
    await patch(mockContext);

    expect(mockContext.nextSteps).toHaveLength(1);
    expect(mockContext.nextSteps[0]).toContain('ESLint rules were updated');
  });

  describe('devDependencies', function () {
    it(`updates to newer versions`, async function () {
      mockPackage.devDependencies = {
        'eslint': '5.0.0',
        'eslint-config-godaddy': '^4.0.0'
      };

      await patch(mockContext);

      expect(mockPackage.devDependencies).toEqual({
        'eslint': '^8.51.0',
        'eslint-config-godaddy': '^7.0.2',
        'eslint-config-next': '^13.5.5'
      });
    });

    it(`does not downgrade if min version is met`, async function () {
      mockPackage.devDependencies = {
        'eslint': '^8.52.0',
        'eslint-config-godaddy': '^7.1.0',
        'eslint-config-next': '^13.6.0'
      };

      await patch(mockContext);

      expect(mockPackage.devDependencies).toEqual({
        'eslint': '^8.52.0',
        'eslint-config-godaddy': '^7.1.0',
        'eslint-config-next': '^13.6.0'
      });
    });

    it('adds eslint-config-next if missing', async function () {
      mockPackage.devDependencies = {};

      await patch(mockContext);

      expect(mockPackage.devDependencies).toHaveProperty(
        'eslint-config-next',
        '^13.5.5'
      );
    });

    it('ignores other packages', async function () {
      mockPackage.devDependencies = {
        '@some/fake': '1.2.3'
      };

      await patch(mockContext);

      expect(mockPackage.devDependencies).toHaveProperty('@some/fake', '1.2.3');
    });

    it('ignores missing attr', async function () {
      delete mockPackage.devDependencies;

      expect(() => patch(mockContext)).not.toThrow();
    });
  });
});
