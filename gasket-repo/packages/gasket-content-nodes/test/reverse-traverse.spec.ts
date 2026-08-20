import { ContentNode, ContentNodes } from '../src';
import { PartType, reverseTraverse } from '../src/transforms';
import { vi } from 'vitest';

describe('reverseTraverse', function () {
  let mockDelegate;

  beforeEach(function () {
    mockDelegate = vi.fn((part) => part);
  });

  const getCallIndex = (mockCall) => {
    const index = mockDelegate.mock.calls.findIndex(call => {
      return JSON.stringify(call) === JSON.stringify(mockCall);
    });
    if (index < 0) {
      throw new Error(`No calls found for ${JSON.stringify(mockCall)}`);
    }
    return index;
  };

  const callOrder = (before, after) => {
    return getCallIndex(before) < getCallIndex(after);
  };

  describe('delegate receives part type', function () {

    it(PartType.name, function () {
      const value = [['h1', null]];
      reverseTraverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name);

      expect(callOrder(
        [['h1', null], PartType.node],
        [[['h1', null]], PartType.children]
      )).toBeTruthy();
    });

    it(PartType.name + ' from props', function () {
      const value = [['h1', { key: ['a node string', ['h2', null]] }]];
      reverseTraverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString);
      expect(mockDelegate).toHaveBeenCalledWith('h2', PartType.name);

      expect(callOrder(
        [['h2', null], PartType.node],
        [['h1', { key: ['a node string', ['h2', null]] }], PartType.node]
      )).toBeTruthy();
    });

    it(PartType.props, function () {
      const value: ContentNodes = [['h1', { key: 'a value' }, ['a node string']]];
      reverseTraverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name);
      expect(mockDelegate).toHaveBeenCalledWith(['a node string'], PartType.children);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString);
      expect(mockDelegate).toHaveBeenCalledWith({ key: 'a value' }, PartType.props);
      expect(mockDelegate).toHaveBeenCalledWith('a value', PartType.stringValue);

      expect(callOrder(
        ['a value', PartType.stringValue],
        [{ key: 'a value' }, PartType.props]
      )).toBeTruthy();

      expect(callOrder(
        ['a node string', PartType.childString],
        [['a node string'], PartType.children]
      )).toBeTruthy();
    });

    it(PartType.props + ' from children', function () {
      const value = [['h1', null, ['a node string', ['span', { key: 'a value' }]]]];
      reverseTraverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString);
      expect(mockDelegate).toHaveBeenCalledWith({ key: 'a value' }, PartType.props);
      expect(mockDelegate).toHaveBeenCalledWith('a value', PartType.stringValue);

      expect(callOrder(
        [{ key: 'a value' }, PartType.props],
        [['span', { key: 'a value' }], PartType.node]
      )).toBeTruthy();

      expect(callOrder(
        [{ key: 'a value' }, PartType.props],
        [['a node string', ['span', { key: 'a value' }]], PartType.children]
      )).toBeTruthy();
    });

    it(PartType.childString, function () {
      const value = [['h1', null, ['a node string']]];
      reverseTraverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString);
      expect(mockDelegate).toHaveBeenCalledWith(['a node string'], PartType.children);

      expect(callOrder(
        ['a node string', PartType.childString],
        [['a node string'], PartType.children]
      )).toBeTruthy();
    });

    it(PartType.childString + ' from props', function () {
      const value = [['h1', { key: ['a node string'] }]];
      reverseTraverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString);

      expect(callOrder(
        ['a node string', PartType.childString],
        [['a node string'], PartType.children]
      )).toBeTruthy();

      expect(callOrder(
        ['a node string', PartType.childString],
        [{ key: ['a node string'] }, PartType.props]
      )).toBeTruthy();
    });

    it(PartType.childString + ' from children in props', function () {
      const value = [['h1', { key: ['a node string', ['h2', null, ['a deep node string']]] }]];
      reverseTraverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString);
      expect(mockDelegate).toHaveBeenCalledWith('h2', PartType.name);
      expect(mockDelegate).toHaveBeenCalledWith('a deep node string', PartType.childString);

      expect(callOrder(
        ['a deep node string', PartType.childString],
        [['a deep node string'], PartType.children]
      )).toBeTruthy();

      expect(callOrder(
        ['a deep node string', PartType.childString],
        [['h2', null, ['a deep node string']], PartType.node]
      )).toBeTruthy();
    });

    it(PartType.childString + ' from children in children', function () {
      const value = [['h1', null, ['a node string', ['span', { key: 'a value' }, ['a deep node string']]]]];
      reverseTraverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString);
      expect(mockDelegate).toHaveBeenCalledWith('a value', PartType.stringValue);

      expect(callOrder(
        ['a deep node string', PartType.childString],
        [['a deep node string'], PartType.children]
      )).toBeTruthy();

      expect(callOrder(
        ['a node string', PartType.childString],
        [['a node string', ['span', { key: 'a value' }, ['a deep node string']]], PartType.children]
      )).toBeTruthy();
    });

    it(PartType.stringValue, function () {
      const value = [['h1', { key: 'a value' }, ['a node string']]];
      reverseTraverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString);
      expect(mockDelegate).toHaveBeenCalledWith({ key: 'a value' }, PartType.props);
      expect(mockDelegate).toHaveBeenCalledWith('a value', PartType.stringValue);

      expect(callOrder(
        ['a value', PartType.stringValue],
        [{ key: 'a value' }, PartType.props]
      )).toBeTruthy();
    });

    it(PartType.stringValue + ' from children', function () {
      const value = [['h1', null, ['a node string', ['span', { key: 'a value' }]]]];
      reverseTraverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString);
      expect(mockDelegate).toHaveBeenCalledWith('a value', PartType.stringValue);

      expect(callOrder(
        ['a value', PartType.stringValue],
        [{ key: 'a value' }, PartType.props]
      )).toBeTruthy();
    });
  });

  describe(PartType.node, function () {

    it('is visited in children', function () {
      const value = ['h1', { key: 'a value' }, [
        ['h2', { key: 'a child value' }],
        ['h3', { key: 'another child value' }]
      ]];

      reverseTraverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith(['h1', { key: 'a value' }, expect.any(Array)], PartType.node);
      expect(mockDelegate).toHaveBeenCalledWith(['h2', { key: 'a child value' }], PartType.node);
      expect(mockDelegate).toHaveBeenCalledWith(['h3', { key: 'another child value' }], PartType.node);
    });

    it('is visited in props', function () {
      const value = ['h1', {
        key: 'a value',
        child: ['h2', { key: 'a child value' }]
      }];

      reverseTraverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('a value', PartType.stringValue);
      expect(mockDelegate).toHaveBeenCalledWith({ key: 'a value', child: expect.any(Array) }, PartType.props);
      expect(mockDelegate).toHaveBeenCalledWith('a child value', PartType.stringValue);
      expect(mockDelegate).toHaveBeenCalledWith({ key: 'a child value' }, PartType.props);
    });

    it('can be removed from children', function () {
      const value = ['h1', { key: 'a value' }, [
        ['h2', { key: 'a child value' }],
        ['h3', { key: 'another child value' }]
      ]];

      mockDelegate = vi.fn((part: any, partType: PartType): ContentNode | undefined => {
        if (partType === PartType.node) {
          const [name] = part;
          if (name === 'h2') {
            return;
          }
        }
        return part;
      });

      const results = reverseTraverse(value, mockDelegate);

      expect(results).toEqual(expect.arrayContaining(
        ['h1', { key: 'a value' }, [
          ['h3', { key: 'another child value' }]
        ]]
      ));

      expect(mockDelegate).toHaveBeenCalledWith(['h2', { key: 'a child value' }], PartType.node);
    });

    it('does no harm to non-children arrays', function () {
      /* eslint-disable no-undefined */
      const value = ['h1', {
        key: 'a value', arr: [{ type: 'temp' }, { type: 'or' }, { type: 'ary' }, undefined]
      }];

      mockDelegate = vi.fn((part: any, partType: PartType): ContentNode | undefined => {
        if (partType === PartType.unknownValue) {
          if (part?.type === 'temp') {
            return;
          }
        }
        return part;
      });

      const results = reverseTraverse(value, mockDelegate);

      expect(results).toEqual(expect.arrayContaining(
        ['h1', { key: 'a value', arr: [undefined, { type: 'or' }, { type: 'ary' }, undefined] }]
      ));

      expect(mockDelegate).toHaveBeenCalledWith({ type: 'temp' }, PartType.unknownValue);
      expect(mockDelegate).toHaveBeenCalledWith(undefined, PartType.unknownValue);
      /* eslint-enable no-undefined */
    });

    it('can be removed from props', function () {
      const value = ['h1', {
        key: 'a value',
        child: ['h2', { key: 'a child value' }]
      }];

      mockDelegate = vi.fn((part: any, partType: PartType): ContentNode | undefined => {
        if (partType === PartType.node) {
          const [name] = part;
          if (name === 'h2') {
            return;
          }
        }
        return part;
      });

      const results = reverseTraverse(value, mockDelegate);

      expect(results).toEqual(expect.arrayContaining(
        ['h1', {
          key: 'a value'
        }]
      ));

      expect(mockDelegate).toHaveBeenCalledWith(['h2', { key: 'a child value' }], PartType.node);
    });

    it('does no harm to empty string children', function () {
      const value = ['h1', { key: 'a value' }, [
        ['h2', { key: 'a child value' }],
        '',
        ' ',
        'a string',
        '0',
        ['h3', { key: 'another child value' }]
      ]];

      mockDelegate = vi.fn((part: any, partType: PartType): ContentNode | undefined => {
        if (partType === PartType.node) {
          const [name] = part;
          if (name === 'h2') {
            return;
          }
        }
        return part;
      });

      const results = reverseTraverse(value, mockDelegate);

      expect(results).toEqual(expect.arrayContaining(
        ['h1', { key: 'a value' }, [
          '',
          ' ',
          'a string',
          '0',
          ['h3', { key: 'another child value' }]
        ]]
      ));
    });
  });
});
