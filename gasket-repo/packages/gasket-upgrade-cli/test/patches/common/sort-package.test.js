const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/common/sort-package');
const patch = wrapper.wrapped;


describe('common patch - sortPackage', () => {
  let mockContext, mockPackage;

  it('is decorated with spinner', async () => {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  beforeEach(() => {
    mockContext = makeContext();
    mockPackage = {
      dependencies: {}
    };

    mockContext.files.set('package.json', mockPackage);
  });

  ['dependencies', 'peerDependencies', 'devDependencies'].forEach((attr => {
    describe(`${attr}`, () => {

      it(`sorts ${attr}`, () => {
        mockPackage[attr] = {
          orange: '*',
          apple: '*',
          banana: '*'
        };

        patch(mockContext);

        expect(Object.keys(mockPackage[attr])).toEqual([
          'apple', 'banana', 'orange'
        ]);
      });

      it('ignores missing attr', () => {
        delete mockPackage[attr];

        // eslint-disable-next-line max-nested-callbacks
        expect(() => patch(mockContext)).not.toThrow();
      });
    });
  }));
});
