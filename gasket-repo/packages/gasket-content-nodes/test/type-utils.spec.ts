import {
  ensureArray,
  isArray,
  isContentNode,
  isContentNodeChildren,
  isContentNodeOrString,
  isDefined,
  isFunction,
  isObject,
  isString
} from '../src/type-utils';

// eslint-disable-next-line no-undefined
const empty = undefined;

describe('Type Utils', function () {

  describe('isArray', function () {
    it('returns true', function () {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
    });
    it('returns false', function () {
      // @ts-expect-error
      expect(isArray()).toBe(false);
      expect(isArray(empty)).toBe(false);
      expect(isArray(null)).toBe(false);
      expect(isArray('hello')).toBe(false);
      expect(isArray(123)).toBe(false);
    });
  });

  describe('isDefined', function () {
    it('returns true', function () {
      expect(isDefined(null)).toBe(true);
      expect(isDefined('hello')).toBe(true);
      expect(isDefined(123)).toBe(true);
    });
    it('returns false', function () {
      // @ts-expect-error
      expect(isDefined()).toBe(false);
      expect(isDefined(empty)).toBe(false);
    });
  });

  describe('isFunction', function () {
    it('returns true', function () {
      const func = function () {
      };
      expect(isFunction(() => {
      })).toBe(true);
      expect(isFunction(func)).toBe(true);
    });
    it('returns false', function () {
      // @ts-expect-error
      expect(isFunction()).toBe(false);
      expect(isFunction(empty)).toBe(false);
      expect(isFunction(null)).toBe(false);
      expect(isFunction('hello')).toBe(false);
      expect(isFunction(123)).toBe(false);
    });
  });

  describe('isObject', function () {
    it('returns true', function () {
      expect(isObject({})).toBe(true);
      expect(isObject(Object())).toBe(true);
    });
    it('returns false', function () {
      // @ts-expect-error
      expect(isObject()).toBe(false);
      expect(isObject(empty)).toBe(false);
      expect(isObject(null)).toBe(false);
      expect(isObject('hello')).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject([1, 2, 3])).toBe(false);
    });
  });

  describe('isString', function () {
    it('returns true', function () {
      expect(isString('hello')).toBe(true);
      expect(isString(`hello ${'again'}`)).toBe(true);
    });
    it('returns false', function () {
      // @ts-expect-error
      expect(isString()).toBe(false);
      expect(isString(empty)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(123)).toBe(false);
      expect(isString([1, 2, 3])).toBe(false);
    });
  });

  describe('ensureArray', function () {
    it('always returns an array', function () {
      // @ts-expect-error
      // eslint-disable-next-line no-undefined
      expect(ensureArray()).toEqual([undefined]);
      expect(ensureArray(null)).toEqual([null]);
      expect(ensureArray([])).toEqual([]);
      expect(ensureArray('hello')).toEqual(['hello']);
      expect(ensureArray(123)).toEqual([123]);
      expect(ensureArray({})).toEqual([{}]);
    });
  });

  describe('isContentNode', function () {
    it('returns true', function () {
      expect(isContentNode(['h1', {}, ['hello']])).toEqual(true);
      expect(isContentNode(['h1', {}, [['h2', {}, 'world']]])).toEqual(true);
      expect(isContentNode(['h1', {}, []])).toEqual(true);
      expect(isContentNode(['h1', {}])).toEqual(true);
      expect(isContentNode(['h1', null])).toEqual(true);
      expect(isContentNode(['h1', null, []])).toEqual(true);
      // eslint-disable-next-line no-undefined
      expect(isContentNode(['h1', null, undefined])).toEqual(true);
    });

    it('returns false', function () {
      // @ts-expect-error
      expect(isContentNode()).toBe(false);
      expect(isContentNode(empty)).toBe(false);
      expect(isContentNode(null)).toBe(false);
      expect(isContentNode(123)).toBe(false);
      expect(isContentNode([1, 2, 3])).toBe(false);

      expect(isContentNode('a string')).toBe(false);
    });
  });

  describe('isContentNodeOrString', function () {
    it('returns true', function () {
      expect(isContentNodeOrString(['h1', {}, ['hello']])).toEqual(true);
      expect(isContentNodeOrString(['h1', {}, [['h2', {}, 'world']]])).toEqual(true);
      expect(isContentNodeOrString(['h1', {}, []])).toEqual(true);
      expect(isContentNodeOrString(['h1', {}])).toEqual(true);
      expect(isContentNodeOrString(['h1', null])).toEqual(true);
      expect(isContentNodeOrString(['h1', null, []])).toEqual(true);

      expect(isContentNodeOrString('a string')).toBe(true);
    });

    it('returns false', function () {
      // @ts-expect-error
      expect(isContentNodeOrString()).toBe(false);
      expect(isContentNodeOrString(empty)).toBe(false);
      expect(isContentNodeOrString(null)).toBe(false);
      expect(isContentNodeOrString(123)).toBe(false);
      expect(isContentNodeOrString([1, 2, 3])).toBe(false);
    });
  });

  describe('isContentNodeChildren', function () {
    it('returns true', function () {
      expect(isContentNodeChildren([['h1', {}, ['hello']]])).toEqual(true);
      expect(isContentNodeChildren([['h1', {}, [['h2', {}, 'world']]]])).toEqual(true);
      expect(isContentNodeChildren([['h1', {}, []]])).toEqual(true);
      expect(isContentNodeChildren([['h1', {}]])).toEqual(true);
      expect(isContentNodeChildren([['h1', null]])).toEqual(true);
      expect(isContentNodeChildren([['h1', null, []]])).toEqual(true);

      expect(isContentNodeChildren(['a string'])).toBe(true);
      expect(isContentNodeChildren(['a string', ['h1', {}, ['hello']]])).toBe(true);
    });

    it('returns false', function () {
      // @ts-expect-error
      expect(isContentNodeChildren()).toBe(false);
      expect(isContentNodeChildren(empty)).toBe(false);
      expect(isContentNodeChildren(null)).toBe(false);
      expect(isContentNodeChildren(123)).toBe(false);
      expect(isContentNodeChildren([1, 2, 3])).toBe(false);
    });
  });
});
