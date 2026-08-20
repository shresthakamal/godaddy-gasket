const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/next-12/update-eslint');
const patch = wrapper.wrapped;

describe('next 12 patch - update eslint', function () {
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

  it('adds "next" to eslintConfig.extends', async function () {
    mockPackage.eslintConfig = {
      extends: ['godaddy']
    };

    await patch(mockContext);

    expect(mockPackage.eslintConfig.extends).toEqual([
      'godaddy', 'next'
    ]);
  });

  it('adds message if eslintConfig.extends not found', async function () {
    await patch(mockContext);

    expect(mockContext.messages).toHaveLength(1);
    expect(mockContext.messages[0]).toContain('Could not update');
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
        'eslint': '^8.6.0',
        'eslint-config-godaddy': '^6.0.0',
        'eslint-config-next': '^12.1.0'
      });
    });

    it(`does not downgrade if min version is met`, async function () {
      mockPackage.devDependencies = {
        'eslint': '^8.999.0',
        'eslint-config-godaddy': '6.999.0',
        'eslint-config-next': '>=12.999.0'
      };

      await patch(mockContext);

      expect(mockPackage.devDependencies).toEqual({
        'eslint': '^8.999.0',
        'eslint-config-godaddy': '6.999.0',
        'eslint-config-next': '>=12.999.0'
      });
    });

    it('adds eslint-config-next if missing', async function () {
      mockPackage.devDependencies = {};

      await patch(mockContext);

      expect(mockPackage.devDependencies).toHaveProperty('eslint-config-next', '^12.1.0');
    });

    it(`removes unnecessary devDependencies`, async function () {
      mockPackage.devDependencies = {
        'eslint-plugin-jsx-a11y': 'latest',
        'eslint-plugin-react': 'latest',
        'eslint-plugin-json': 'latest',
        'eslint-plugin-mocha': 'latest',
        'babel-core': 'latest',
        'babel-eslint': 'latest'
      };

      await patch(mockContext);

      expect(mockPackage.devDependencies).not.toHaveProperty('eslint-plugin-jsx-a11y');
      expect(mockPackage.devDependencies).not.toHaveProperty('eslint-plugin-react');
      expect(mockPackage.devDependencies).not.toHaveProperty('eslint-plugin-json');
      expect(mockPackage.devDependencies).not.toHaveProperty('eslint-plugin-mocha');
      expect(mockPackage.devDependencies).not.toHaveProperty('babel-core');
      expect(mockPackage.devDependencies).not.toHaveProperty('babel-eslint');
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
