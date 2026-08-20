const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/v6/update-eslint-locales-config');
const patch = wrapper.wrapped;


describe('v6 patch - update eslint locales config', function () {
  let mockContext, mockSpinner, mockPackage;

  beforeEach(function () {
    mockContext = makeContext();
    mockPackage = {
      name: 'app-name'
    };

    mockContext.files.set('package.json', mockPackage);
    mockSpinner = {
      info: jest.fn()
    };
  });

  it('is decorated with spinner', async function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('adds default settings', async function () {
    mockContext.moveLocaleToPublic = true;
    await patch(mockContext, mockSpinner);
    const results = mockContext.files.get('package.json');
    expect(results).toEqual({
      name: 'app-name',
      eslintConfig: {
        settings: {
          localeFiles: [
            'public/locales/en-US.json'
          ]
        }
      }
    });
  });

  it('merges with existing settings', async function () {
    mockContext.moveLocaleToPublic = true;
    mockPackage.eslintConfig = {
      settings: {
        react: {
          version: 'detect'
        }
      }
    };
    await patch(mockContext, mockSpinner);
    const results = mockContext.files.get('package.json');
    expect(results).toEqual({
      name: 'app-name',
      eslintConfig: {
        settings: {
          localeFiles: [
            'public/locales/en-US.json'
          ],
          react: {
            version: 'detect'
          }
        }
      }
    });
  });

  it('prepends public/ to existing localeFiles', async function () {
    mockContext.moveLocaleToPublic = true;
    mockPackage.eslintConfig = {
      settings: {
        localeFiles: [
          'locales/bogus/en-US.json'
        ]
      }
    };
    await patch(mockContext, mockSpinner);
    const results = mockContext.files.get('package.json');
    expect(results).toEqual({
      name: 'app-name',
      eslintConfig: {
        settings: {
          localeFiles: [
            'public/locales/bogus/en-US.json'
          ]
        }
      }
    });
  });

  it('logs info if not moving locales dir', async function () {
    mockContext.moveLocaleToPublic = false;
    await patch(mockContext, mockSpinner);
    expect(mockSpinner.info).toHaveBeenCalledWith(
      expect.stringContaining('(avoided)')
    );
  });
});
