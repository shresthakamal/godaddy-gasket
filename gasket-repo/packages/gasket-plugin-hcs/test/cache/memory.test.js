import { describe, it, expect } from 'vitest';
import memory from '../../lib/cache/memory.js';

describe('Memory', () => {

  it('Init', async () => {
    const cache = await memory({ items: { a: 1, b: 2, c: 3 } });
    const b = await cache.get('b');
    const c = await cache.get('c');
    expect(b).toEqual(2);
    expect(c).toEqual(3);
    expect(await cache.size()).toEqual(3);
  });

  it('set, get', async () => {
    const cache = await memory();
    expect(await cache.size()).toEqual(0);

    await cache.set('item', 'val');
    const item = await cache.get('item');
    expect(await cache.size()).toEqual(1);
    expect(item).toEqual('val');
  });

  it('remove, size, clear', async () => {
    const cache = await memory({ items: { a: 1, b: 2, c: 3 } });
    expect(await cache.size()).toEqual(3);
    expect(await cache.get('b')).toEqual(2);
    await cache.remove('a');
    await cache.remove('b');

    expect(await cache.size()).toEqual(1);
    expect(await cache.get('a')).toEqual(void 0);
    expect(await cache.get('b')).toEqual(void 0);
    expect(await cache.get('c')).toEqual(3);

    await cache.clear();

    expect(await cache.get('c')).toEqual(void 0);
    expect(await cache.size()).toEqual(0);
  });

});
