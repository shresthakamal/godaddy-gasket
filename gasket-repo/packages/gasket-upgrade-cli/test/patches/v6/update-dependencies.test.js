const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/v6/update-dependencies');
const patch = wrapper.wrapped;
const { gasketVersion } = wrapper;


describe('v6 patch - update dependencies', function () {
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

      it('updates to new @gasket names', async function () {
        mockPackage[attr] = {
          '@gasket/intl': '*'
        };

        await patch(mockContext);

        expect(Object.keys(mockPackage[attr])).toEqual([
          '@gasket/react-intl'
        ]);
      });

      it(`updates to new @gasket versions (${gasketVersion})`, async function () {
        mockPackage[attr] = {
          '@gasket/plugin-engine': '*',
          '@gasket/intl-plugin': '*'
        };

        await patch(mockContext);

        expect(Object.values(mockPackage[attr])).toEqual([
          gasketVersion, gasketVersion
        ]);
      });

      it('updates other package versions', async function () {
        mockPackage[attr] = {
          'next': '*',
          '@ux/uxcore2': '*'
        };

        await patch(mockContext);

        expect(Object.values(mockPackage[attr])).not.toEqual([
          '*', '*'
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
});
