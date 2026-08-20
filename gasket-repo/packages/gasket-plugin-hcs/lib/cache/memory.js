/**
 * Simple in-memory caching module
 * @type {import('./internal').memory}
 */
async function memory(opts) {
  const { items } = opts || {};
  let _items = { ...items };

  /** @type {import('./internal').memoryMethods} */
  const methods = {
    async get(key) {
      if (Object.prototype.hasOwnProperty.call(_items, key)) {
        return _items[key];
      }
    },

    async set(key, val) {
      _items[key] = val;
    },

    async remove(key) {
      delete _items[key];
    },

    async clear() {
      _items = {};
    },

    async size() {
      return Object.keys(_items).length;
    }

  };

  return methods;
}

export default memory;
