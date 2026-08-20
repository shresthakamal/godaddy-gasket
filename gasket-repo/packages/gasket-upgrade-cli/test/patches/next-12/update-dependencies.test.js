const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/next-12/update-dependencies');
const patch = wrapper.wrapped;

describe('next 12 patch - update dependencies', function () {
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

  ['dependencies', 'peerDependencies', 'devDependencies'].forEach((attr => {
    describe(`${attr}`, function () {

      it(`updates to newer versions`, async function () {
        mockPackage[attr] = {
          '@gasket/engine': '5.0.0',
          '@gasket/plugin-intl': '^6.0.0'
        };

        await patch(mockContext);

        expect(Object.values(mockPackage[attr])).toEqual([
          '^6.17.0',
          '^6.17.1'
        ]);
      });

      it(`does not downgrade if min version is met`, async function () {
        mockPackage[attr] = {
          '@gasket/engine': '>=6.100.0',
          '@gasket/plugin-intl': '^6.100.0'
        };

        await patch(mockContext);

        expect(Object.values(mockPackage[attr])).toEqual([
          '>=6.100.0',
          '^6.100.0'
        ]);
      });

      it('updates other package versions', async function () {
        mockPackage[attr] = {
          'next': '^10.0.0',
          '@ux/uxcore2': '^2102.0.0'
        };

        await patch(mockContext);

        expect(Object.values(mockPackage[attr])).not.toEqual([
          '^12.0.8',
          '^2200.0.0'
        ]);
      });

      it('ignores other packages', async function () {
        mockPackage[attr] = {
          '@some/fake': '1.2.3'
        };

        await patch(mockContext);

        expect(mockPackage[attr]).toEqual({ '@some/fake': '1.2.3' });
      });

      it('ignores missing attr', async function () {
        delete mockPackage[attr];

        // eslint-disable-next-line max-nested-callbacks
        expect(() => patch(mockContext)).not.toThrow();
      });
    });
  }));

  it('adds @ux/webpack-config for apps with @ux/uxcore2', async function () {
    mockPackage.dependencies = {
      '@ux/uxcore2': '^10.0.0'
    };
    await patch(mockContext);

    expect(mockPackage.dependencies).toHaveProperty('@ux/uxcore2', '^2200.0.0');
    expect(mockPackage.devDependencies).toHaveProperty('@ux/webpack-config', '^2200.0.0');
  });

  it('adds postcss for apps with next', async function () {
    mockPackage.dependencies = {
      next: '^10.0.0'
    };
    await patch(mockContext);

    expect(mockPackage.dependencies).toHaveProperty('next', '^12.1.0');
    expect(mockPackage.devDependencies).toHaveProperty('postcss', '^8.4.4');
  });
});
