const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/v6/cleanup-redux-reducers');
const patch = wrapper.wrapped;


const mockStoreData = `
const { configureMakeStore } = require('@gasket/redux');
const authReducers = require('@godaddy/gasket-auth/reducers');
const intlReducers = require('@gasket/intl/reducers');
const cookiesReducers = require('@godaddy/gasket-cookies/reducers');

const emojiApi = require('./lib/emoji-api');
const cartReducers = require('./lib/cart/reducers');

const reducers = {
  ...authReducers,
  ...intlReducers,
  ...cookiesReducers,
  ...emojiApi.reducers,
  ...cartReducers,
  ...require('@godaddy/gasket-auth/reducers'),
  ...require('@gasket/intl/reducers'),
  ...require('@godaddy/gasket-cookies/reducers')
};

module.exports = configureMakeStore({ reducers });
`;


const filePath = 'store.js';

describe('v6 patch - cleanup redux reducers', function () {
  let mockContext;

  beforeEach(function () {
    mockContext = makeContext();
    mockContext.files.set('package.json', { name: 'app-name' });
  });

  it('is decorated with spinner', async function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('removes legacy reducer imports', async function () {
    mockContext.files.set(filePath, mockStoreData);
    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(mockStoreData).not.toEqual(results);
    // verify these exist
    expect(mockStoreData).toContain("= require('@godaddy/gasket-auth/reducers');");
    expect(mockStoreData).toContain("= require('@gasket/intl/reducers');");
    expect(mockStoreData).toContain("= require('@godaddy/gasket-cookies/reducers');");
    // check that they are removed
    expect(results).not.toContain("= require('@godaddy/gasket-auth/reducers');");
    expect(results).not.toContain("= require('@gasket/intl/reducers');");
    expect(results).not.toContain("= require('@godaddy/gasket-cookies/reducers');");
  });

  it('removes legacy reducer assignments', async function () {
    mockContext.files.set(filePath, mockStoreData);
    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(mockStoreData).not.toEqual(results);
    // verify these exist
    expect(mockStoreData).toContain('...authReducers');
    expect(mockStoreData).toContain('...intlReducers');
    expect(mockStoreData).toContain('...cookiesReducers');
    // check that they are removed
    expect(results).not.toContain('...authReducers');
    expect(results).not.toContain('...intlReducers');
    expect(results).not.toContain('...cookiesReducers');
  });

  it('retain custom reducers', async function () {
    mockContext.files.set(filePath, mockStoreData);
    await patch(mockContext);
    const results = mockContext.files.get(filePath);

    expect(results).toContain('emojiApi.reducers');
    expect(results).toContain('cartReducers');
  });

  it('removes legacy spread require reducers', async function () {
    mockContext.files.set(filePath, mockStoreData);
    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    // verify these exist
    expect(mockStoreData).toContain("...require('@godaddy/gasket-auth/reducers')");
    expect(mockStoreData).toContain("...require('@gasket/intl/reducers')");
    expect(mockStoreData).toContain("...require('@godaddy/gasket-cookies/reducers')");
    // check that they are removed
    expect(results).not.toContain("...require('@godaddy/gasket-auth/reducers')");
    expect(results).not.toContain("...require('@gasket/intl/reducers')");
    expect(results).not.toContain("...require('@godaddy/gasket-cookies/reducers')");
  });
});
