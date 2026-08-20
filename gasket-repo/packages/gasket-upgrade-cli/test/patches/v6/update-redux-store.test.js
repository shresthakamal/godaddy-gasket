const { makeContext } = require('../../../lib/patcher');
const wrapper = require('../../../lib/patches/v6/update-redux-store');
const patch = wrapper.wrapped;

const mockStoreData = `
const { configureMakeStore } = require('@gasket/redux');

const emojiApi = require('./lib/emoji-api');
const cartReducers = require('./lib/cart/reducers');

const reducers = {
  ...emojiApi.reducers,
  ...cartReducers
};

module.exports = configureMakeStore({ reducers });
`;

const storeSnapshot = `
const { configureMakeStore, getOrCreateStore } = require('@gasket/redux');
const { HYDRATE, createWrapper } = require('next-redux-wrapper');
const merge = require('lodash.merge');

// Basic hydrate reducer for next-redux-wrapper
// @see: https://github.com/kirill-konshin/next-redux-wrapper#usage
const rootReducer = (state, { type, payload }) => type === HYDRATE ? merge({}, state, payload) : state;

const emojiApi = require('./lib/emoji-api');
const cartReducers = require('./lib/cart/reducers');

const reducers = {
  ...emojiApi.reducers,
  ...cartReducers
};

const makeStore = configureMakeStore({ rootReducer, reducers });
const nextRedux = createWrapper(getOrCreateStore(makeStore));

module.exports = makeStore;
module.exports.nextRedux = nextRedux;
`;

const filePath = 'store.js';

describe('v6 patch - update redux store', function () {
  let mockContext;

  beforeEach(function () {
    mockContext = makeContext();
    mockContext.files.set('package.json', { name: 'app-name' });
  });

  it('is decorated with spinner', async function () {
    expect(wrapper).toHaveProperty('wrapped');
    expect(wrapper.wrapped).toBeInstanceOf(Function);
  });

  it('updates store file contents', async function () {
    mockContext.files.set(filePath, mockStoreData);
    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(results).toEqual(storeSnapshot);
  });

  it('does not re-modify store', async function () {
    mockContext.files.set(filePath, storeSnapshot);
    await patch(mockContext);
    const results = mockContext.files.get(filePath);
    expect(results).toEqual(storeSnapshot);
  });
});
