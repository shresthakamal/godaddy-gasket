import {
  PartType,
  transform,
  cleanChildren,
  traverse
} from '../src';

import {
  determinePartType
} from '../src/transforms';

import type {
  ComponentName,
  ComponentProps,
  ContentNode,
  ContentNodeChildren,
  ContentNodeVisitors
} from '../src';
import { vi } from 'vitest';


const unknownPart = Symbol();
const anyFunction = expect.any(Function);

describe('determinePartType', function () {
  const whenParent = (partType, msg?) => [`when parent type \`${partType}\``, msg].filter(Boolean).join(' ');

  describe(PartType.node, function () {
    it(whenParent(PartType.unknownValue), function () {
      expect(determinePartType(['h1', null], PartType.unknownValue)).toBe(PartType.node);
    });
    it(whenParent(PartType.children), function () {
      expect(determinePartType(['h1', null], PartType.children)).toBe(PartType.node);
    });
  });

  describe(PartType.name, function () {
    it(whenParent(PartType.node), function () {
      expect(determinePartType('h1', PartType.node)).toBe(PartType.name);
    });
  });

  describe(PartType.props, function () {
    it(whenParent(PartType.node), function () {
      expect(determinePartType({ key: 'a value' }, PartType.node)).toBe(PartType.props);
    });
    it(whenParent(PartType.node, 'and value `null`'), function () {
      expect(determinePartType(null, PartType.node)).toBe(PartType.props);
    });
  });

  describe(PartType.children, function () {
    it(whenParent(PartType.unknownValue), function () {
      expect(determinePartType([['h1', null], 'a string'], PartType.unknownValue)).toBe(PartType.children);
    });
    it(whenParent(PartType.node), function () {
      expect(determinePartType([['h1', null], 'a string'], PartType.node)).toBe(PartType.children);
    });
  });

  describe(PartType.childString, function () {
    it(whenParent(PartType.children), function () {
      expect(determinePartType('a string', PartType.children)).toBe(PartType.childString);
    });
  });

  describe(PartType.stringValue, function () {
    it(whenParent(PartType.props), function () {
      expect(determinePartType('a string', PartType.props)).toBe(PartType.stringValue);
    });
  });

  describe(PartType.unknownValue, function () {
    it(whenParent(PartType.props, 'and value type `boolean`'), function () {
      expect(determinePartType(true, PartType.props)).toBe(PartType.unknownValue);
    });
    it(whenParent(PartType.props, 'and value type `number`'), function () {
      expect(determinePartType(123, PartType.props)).toBe(PartType.unknownValue);
    });
    it(whenParent(PartType.props, 'and value type `array`'), function () {
      expect(determinePartType([123, 456], PartType.props)).toBe(PartType.unknownValue);
    });
    it(whenParent(PartType.props, 'and value type `object`'), function () {
      expect(determinePartType({ an: 'object' }, PartType.props)).toBe(PartType.unknownValue);
    });
  });
});

describe('traverse', function () {

  let mockDelegate;

  beforeEach(function () {
    mockDelegate = vi.fn((part) => part);
  });

  describe('delegate receives part type', function () {

    it(PartType.name, function () {
      traverse([['h1', null]], mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name, anyFunction);
    });

    it(PartType.name + ' from props', function () {
      const value = [['h1', { key: ['a node string', ['h2', null]] }]];
      traverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('h2', PartType.name, anyFunction);
    });

    it(PartType.props, function () {
      const value = [['h1', { key: 'a value' }, ['a node string']]];
      traverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith({ key: 'a value' }, PartType.props, anyFunction);
    });

    it(PartType.props + ' from children', function () {
      const value = [['h1', null, ['a node string', ['span', { key: 'a value' }]]]];
      traverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith({ key: 'a value' }, PartType.props, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('a value', PartType.stringValue, anyFunction);
    });

    it(PartType.childString, function () {
      const value = [['h1', null, ['a node string']]];
      traverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString, anyFunction);
    });

    it(PartType.childString + ' from props', function () {
      const value = [['h1', { key: ['a node string'] }]];
      traverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString, anyFunction);
    });

    it(PartType.childString + ' from children in props', function () {
      const value = [['h1', { key: ['a node string', ['h2', null, ['a deep node string']]] }]];
      traverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('h2', PartType.name, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('a deep node string', PartType.childString, anyFunction);
    });

    it(PartType.childString + ' from children in children', function () {
      const value = [['h1', null, ['a node string', ['span', { key: 'a value' }, ['a deep node string']]]]];
      traverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('a value', PartType.stringValue, anyFunction);
    });

    it(PartType.stringValue, function () {
      const value = [['h1', { key: 'a value' }, ['a node string']]];
      traverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith({ key: 'a value' }, PartType.props, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('a value', PartType.stringValue, anyFunction);
    });

    it(PartType.stringValue + ' from children', function () {
      const value = [['h1', null, ['a node string', ['span', { key: 'a value' }]]]];
      traverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('a value', PartType.stringValue, anyFunction);
    });

    it(PartType.unknownValue, function () {
      const value = [['h1', { key: unknownPart }]];
      traverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith({ key: unknownPart }, PartType.props, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith(unknownPart, PartType.unknownValue, anyFunction);
    });

    it(PartType.unknownValue + ' from array', function () {
      const value = [['h1', { key: [unknownPart, 78910] }]];
      traverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith({ key: [unknownPart, 78910] }, PartType.props, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith(unknownPart, PartType.unknownValue, anyFunction);
    });
  });

  describe('transformed types are traversed', function () {
    const whenChanged = (startPartType, endPartType) => `${startPartType} to ${endPartType}`;

    it(whenChanged(PartType.stringValue, PartType.children), function () {
      mockDelegate.mockImplementation((part) => {
        if (part === 'some splittable string') {
          return ['some', 'split', 'string'];
        }
        return part;
      });
      const value = [['h1', { key: 'some splittable string' }]];
      traverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith({ key: 'some splittable string' }, PartType.props, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('some splittable string', PartType.stringValue, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('some', PartType.childString, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('split', PartType.childString, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('string', PartType.childString, anyFunction);
    });

    it(whenChanged(PartType.stringValue, PartType.node), function () {
      mockDelegate.mockImplementation((part) => {
        if (part === 'some splittable string') {
          return ['h2', { key: 'split' }];
        }
        return part;
      });
      const value = [['h1', { key: 'some splittable string' }]];
      traverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith({ key: 'some splittable string' }, PartType.props, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('some splittable string', PartType.stringValue, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith(['h2', { key: 'split' }], PartType.node, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('split', PartType.stringValue, anyFunction);
    });

    it(whenChanged(PartType.childString, PartType.node), function () {
      mockDelegate.mockImplementation((part) => {
        if (part === 'some splittable string') {
          return ['h2', { key: 'split' }];
        }
        return part;
      });
      const value = [['h1', null, ['some splittable string']]];
      traverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith(['some splittable string'], PartType.children, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('some splittable string', PartType.childString, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith(['h2', { key: 'split' }], PartType.node, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('split', PartType.stringValue, anyFunction);
    });
  });

  describe('can be stopped at', function () {
    const mockStopWhen = (stopPartType) => {
      return vi.fn((part, partType, stop) => {
        if (partType === stopPartType) stop();
        return part;
      });
    };

    it(PartType.node, function () {
      mockDelegate = mockStopWhen(PartType.node);

      const value = [['h1', null, ['a node string', ['span', { key: 'a value' }]]]];
      traverse(value, mockDelegate);

      expect(mockDelegate).not.toHaveBeenCalledWith('h1', PartType.name, anyFunction);
      expect(mockDelegate).not.toHaveBeenCalledWith('a node string', PartType.childString, anyFunction);
      expect(mockDelegate).not.toHaveBeenCalledWith('a value', PartType.stringValue, anyFunction);
    });

    it(PartType.children, function () {
      mockDelegate = mockStopWhen(PartType.children);

      const value = ['h1', null, ['a node string', ['span', { key: 'a value' }]]];
      traverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name, anyFunction);
      expect(mockDelegate).not.toHaveBeenCalledWith('a node string', PartType.childString, anyFunction);
      expect(mockDelegate).not.toHaveBeenCalledWith('a value', PartType.stringValue, anyFunction);
    });

    it(PartType.props, function () {
      mockDelegate = mockStopWhen(PartType.props);

      const value = ['h1', null, ['a node string', ['span', { key: 'a value' }]]];
      traverse(value, mockDelegate);

      expect(mockDelegate).toHaveBeenCalledWith('h1', PartType.name, anyFunction);
      expect(mockDelegate).toHaveBeenCalledWith('a node string', PartType.childString, anyFunction);
      expect(mockDelegate).not.toHaveBeenCalledWith('a value', PartType.stringValue, anyFunction);
    });
  });
});

describe('transform', function () {
  let value: ContentNode;

  function spyOn(obj, key) {
    obj[key] = vi.fn(obj[key]);
  }

  let visitors: ContentNodeVisitors;
  beforeEach(function () {
    visitors = {};
  });

  describe(PartType.node, function () {

    it('is visited', function () {
      value = ['h1', { key: 'a value' }];

      visitors[PartType.node] = (part): ContentNode => part;
      spyOn(visitors, PartType.node);
      transform(value, visitors);

      expect(visitors[PartType.node]).toHaveBeenCalledWith(
        expect.arrayContaining(['h1', { key: 'a value' }]), anyFunction
      );
    });

    it('is visited in children', function () {
      value = ['parent', null, [['h1', { key: 'a value' }, [['h2', { key: 'a child value' }]]]]];

      visitors[PartType.node] = (part): ContentNode => part;
      spyOn(visitors, PartType.node);
      transform(value, visitors);

      expect(visitors[PartType.node]).toHaveBeenCalledWith(
        expect.arrayContaining(['h1', { key: 'a value' }]), anyFunction
      );
      expect(visitors[PartType.node]).toHaveBeenCalledWith(
        expect.arrayContaining(['h2', { key: 'a child value' }]), anyFunction
      );
    });

    it('is visited in props', function () {
      value = ['h1', {
        key: 'a value',
        child: ['h2', { key: 'a child value' }]
      }];

      visitors[PartType.node] = (part): ContentNode => part;
      spyOn(visitors, PartType.node);
      transform(value, visitors);

      expect(visitors[PartType.node]).toHaveBeenCalledWith(
        expect.arrayContaining(['h1', { key: 'a value', child: expect.any(Array) }]), anyFunction
      );
      expect(visitors[PartType.node]).toHaveBeenCalledWith(
        expect.arrayContaining(['h2', { key: 'a child value' }]), anyFunction
      );
    });

    it('is visited in children in props', function () {
      value = ['h1', {
        key: 'a value',
        children: [['h2', { key: 'a child value' }]]
      }];

      visitors[PartType.node] = function (part): ContentNode {
        return part;
      };
      spyOn(visitors, PartType.node);
      transform(value, visitors);

      expect(visitors[PartType.node]).toHaveBeenCalledWith(
        expect.arrayContaining(['h1', { key: 'a value', children: expect.any(Array) }]), anyFunction
      );
      expect(visitors[PartType.node]).toHaveBeenCalledWith(
        expect.arrayContaining(['h2', { key: 'a child value' }]), anyFunction
      );
    });

    it('can transform results', function () {
      value = ['h1', { key: 'a value' }];

      visitors[PartType.node] = (part): ContentNode => {
        const [name, props, children] = part;
        if (name === 'h1') {
          return cleanChildren([name, { ...props, extra: true }, children]);
        }

        return part;
      };

      spyOn(visitors, PartType.node);
      const results = transform(value, visitors);
      expect(results).toEqual(expect.arrayContaining(['h1', { key: 'a value', extra: true }]));
    });

    it('visits children in transform results', function () {
      value = ['h1', { key: 'a value' }];

      visitors[PartType.node] = (part): ContentNode => {
        const [name, props] = part;
        if (name === 'h1') {
          return [name, props, [['h2', { key: 'a child value' }]]];
        }

        return part;
      };

      spyOn(visitors, PartType.node);
      const results = transform(value, visitors);
      expect(results).toEqual(expect.arrayContaining(['h1', { key: 'a value' }, [['h2', { key: 'a child value' }]]]));

      expect(visitors[PartType.node]).toHaveBeenCalledWith(
        expect.arrayContaining(['h1', { key: 'a value' }]), anyFunction
      );

      expect(visitors[PartType.node]).toHaveBeenCalledWith(
        expect.arrayContaining(['h2', { key: 'a child value' }]), anyFunction
      );
    });

    it('can stop traversal', function () {
      value = ['h1', {
        key: 'a value',
        children: [['h2', { key: 'a child value' }]]
      }];

      visitors[PartType.node] = function (part, stopTraversal): ContentNode {
        stopTraversal();
        return part;
      };
      spyOn(visitors, PartType.node);
      transform(value, visitors);

      expect(visitors[PartType.node]).toHaveBeenCalledWith(
        expect.arrayContaining(['h1', { key: 'a value', children: expect.any(Array) }]), anyFunction
      );

      expect(visitors[PartType.node]).toHaveBeenCalledTimes(1);

      expect(visitors[PartType.node]).not.toHaveBeenCalledWith(
        expect.arrayContaining(['h2', { key: 'a child value' }]), anyFunction
      );
    });

    it('has expected types signature', function () {
      visitors[PartType.node] = (part): ContentNode => part;
      visitors[PartType.node] = (part): ContentNode => ['h1', null];
      visitors[PartType.node] = (part): ContentNode => ['h1', { key: 'a value' }, [['h2', null]]];
      visitors[PartType.node] = (part, stopTraversal): ContentNode => {
        stopTraversal();
        return part;
      };

      // @ts-expect-error
      visitors[PartType.node] = (part): ComponentProps => (1234);
      // @ts-expect-error
      visitors[PartType.node] = (part): ComponentProps => {
      };
    });

    it('can be removed from children', function () {
      value = ['h1', { key: 'a value' }, [
        ['h2', { key: 'a child value' }],
        ['h3', { key: 'another child value' }]
      ]];

      visitors[PartType.node] = (part): ContentNode | undefined => {
        const [name, props] = part;
        if (name === 'h2') {
          return;
        }

        return part;
      };

      spyOn(visitors, PartType.node);
      const results = transform(value, visitors);

      expect(results).toEqual(expect.arrayContaining(
        ['h1', { key: 'a value' }, [
          ['h3', { key: 'another child value' }]
        ]]
      ));

      expect(visitors[PartType.node]).toHaveBeenCalledWith(
        expect.arrayContaining(['h1', { key: 'a value' }]), anyFunction
      );

      expect(visitors[PartType.node]).toHaveBeenCalledWith(
        expect.arrayContaining(['h2', { key: 'a child value' }]), anyFunction
      );

      expect(visitors[PartType.node]).toHaveBeenCalledWith(
        expect.arrayContaining(['h3', { key: 'another child value' }]), anyFunction
      );
    });


    it('can be removed from props', function () {
      value = ['h1', {
        key: 'a value',
        child: ['h2', { key: 'a child value' }]
      }];

      visitors[PartType.node] = (part): ContentNode | undefined => {
        const [name, props] = part;
        if (name === 'h2') {
          return;
        }
        return part;
      };

      spyOn(visitors, PartType.node);
      const results = transform(value, visitors);

      expect(results).toEqual(expect.arrayContaining(
        ['h1', {
          key: 'a value'
        }]
      ));

      expect(visitors[PartType.node]).toHaveBeenCalledWith(
        expect.arrayContaining(['h2', { key: 'a child value' }]), anyFunction
      );
    });

    it('does not harm to empty string children', function () {
      value = ['h1', { key: 'a value' }, [
        ['h2', { key: 'a child value' }],
        '',
        ' ',
        'a string',
        '0',
        ['h3', { key: 'another child value' }]
      ]];

      visitors[PartType.node] = (part): ContentNode | undefined => {
        const [name, props] = part;
        if (name === 'h2') {
          return;
        }

        return part;
      };

      const results = transform(value, visitors);

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

  describe(PartType.name, function () {

    it('is visited', function () {
      value = ['h1', { key: 'a value' }];

      visitors[PartType.name] = (part): ComponentName => part;
      spyOn(visitors, PartType.name);
      transform(value, visitors);

      expect(visitors[PartType.name]).toHaveBeenCalledWith('h1', anyFunction);
    });

    it('is visited in children', function () {
      value = ['parent', null, [['h1', { key: 'a value' }, [['h2', { key: 'a child value' }]]]]];

      visitors[PartType.name] = (part): ComponentName => part;
      spyOn(visitors, PartType.name);
      transform(value, visitors);

      expect(visitors[PartType.name]).toHaveBeenCalledWith('h1', anyFunction);
      expect(visitors[PartType.name]).toHaveBeenCalledWith('h2', anyFunction);
    });

    it('has expected types signature', function () {
      visitors[PartType.name] = (part): ComponentName => part;
      visitors[PartType.name] = (part): ComponentName => 'h1';
      visitors[PartType.name] = (part, stopTraversal): ComponentName => {
        stopTraversal();
        return part;
      };

      // @ts-expect-error
      visitors[PartType.name] = (part): ComponentProps => (1234);
      // @ts-expect-error
      visitors[PartType.name] = (part): ComponentProps => {
      };
    });
  });

  describe(PartType.props, function () {

    it('is visited', function () {
      value = ['h1', { key: 'a value' }];

      visitors[PartType.props] = (part): ComponentProps => ({ ...part, extra: true });
      spyOn(visitors, PartType.props);
      transform(value, visitors);

      expect(visitors[PartType.props]).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'a value' }), anyFunction
      );

      expect(visitors[PartType.props]).toHaveReturnedWith(
        expect.objectContaining({ key: 'a value', extra: true })
      );
    });

    it('is visited in children', function () {
      value = ['parent', null, [['h1', { key: 'a value' }, [['h2', { key: 'a child value' }]]]]];

      visitors[PartType.props] = (part): ComponentProps => ({ ...part, extra: true });
      spyOn(visitors, PartType.props);
      transform(value, visitors);

      expect(visitors[PartType.props]).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'a value' }), anyFunction
      );
      expect(visitors[PartType.props]).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'a child value' }), anyFunction
      );
    });

    it('not visited for object properties in props', function () {
      value = ['h1', { key: 'a value', obj: { key: 'a nested value' } }];

      visitors[PartType.props] = (part): ComponentProps => ({ ...part, extra: true });
      spyOn(visitors, PartType.props);
      transform(value, visitors);

      expect(visitors[PartType.props]).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'a value', obj: { key: 'a nested value' } }), anyFunction
      );
      expect(visitors[PartType.props]).toHaveBeenCalledTimes(1);
    });

    it('can transform results', function () {
      value = ['h1', { key: 'a value' }];
      visitors[PartType.props] = (part): ComponentProps => ({ ...part, extra: true });
      const results = transform(value, visitors);
      expect(results).toEqual(['h1', { key: 'a value', extra: true }]);
    });

    it('has expected types signature', function () {
      visitors[PartType.props] = (part): ComponentProps => part;
      visitors[PartType.props] = (part): ComponentProps => ({ some: 'object' });
      visitors[PartType.props] = (part, stopTraversal): ComponentProps => {
        stopTraversal();
        return part;
      };

      // @ts-expect-error
      visitors[PartType.props] = (part): ComponentProps => (1234);
      // @ts-expect-error
      visitors[PartType.props] = (part): ComponentProps => {
      };
    });
  });

  describe(PartType.children, function () {

    it('is visited', function () {
      value = ['h1', { key: 'a value' }, [['h2', null]]];

      visitors[PartType.children] = (part): ContentNodeChildren => part;
      spyOn(visitors, PartType.children);
      transform(value, visitors);

      expect(visitors[PartType.children]).toHaveBeenCalledWith([['h2', null]], anyFunction);
    });

    it('is visited in children', function () {
      value = ['h1', { key: 'a value' }, [['h2', null, [['h3', null]]]]];

      visitors[PartType.children] = (part): ContentNodeChildren => part;
      spyOn(visitors, PartType.children);
      transform(value, visitors);

      expect(visitors[PartType.children]).toHaveBeenCalledWith([['h2', null, [['h3', null]]]], anyFunction);
      expect(visitors[PartType.children]).toHaveBeenCalledWith([['h3', null]], anyFunction);
    });

    it('is visited in props', function () {
      value = ['h1', {
        key: 'a value',
        children: [['h2', { key: 'a child value' }]]
      }];

      visitors[PartType.children] = (part): ContentNodeChildren => part;
      spyOn(visitors, PartType.children);
      transform(value, visitors);

      expect(visitors[PartType.children]).toHaveBeenCalledWith(
        expect.arrayContaining([['h2', { key: 'a child value' }]]), anyFunction);
    });

    it('can transform results', function () {
      value = ['h1', {
        key: 'a value',
        children: [['h2', { key: 'a child value' }]]
      }];

      visitors[PartType.children] = (part): ContentNodeChildren => {
        if (part[0][0] === 'h2') {
          return [...part, 'a child string'];
        }
        return part;
      };
      const results = transform(value, visitors);
      expect(results).toEqual(['h1', {
        key: 'a value',
        children: [['h2', { key: 'a child value' }], 'a child string']
      }]);
    });

    it('has expected types signature', function () {
      visitors[PartType.children] = (part): ContentNodeChildren => part;
      visitors[PartType.children] = (part): ContentNodeChildren => [['h1', null]];
      visitors[PartType.children] = (part, stopTraversal): ContentNodeChildren => {
        stopTraversal();
        return part;
      };

      // @ts-expect-error
      visitors[PartType.children] = (part): ComponentProps => (1234);
      // @ts-expect-error
      visitors[PartType.children] = (part): ComponentProps => {
      };
    });
  });

  describe(PartType.childString, function () {

    it('is visited', function () {
      value = ['h1', { key: 'a value' }, ['a child string']];

      visitors[PartType.childString] = (part): string => part;
      spyOn(visitors, PartType.childString);
      transform(value, visitors);

      expect(visitors[PartType.childString]).toHaveBeenCalledWith('a child string', anyFunction);
    });

    it('is visited in children', function () {
      value = ['h1', { key: 'a value' }, [['h2', { key: 'a child value' }], 'a child string']];

      visitors[PartType.childString] = (part): string => part;
      spyOn(visitors, PartType.childString);
      transform(value, visitors);

      expect(visitors[PartType.childString]).toHaveBeenCalledWith('a child string', anyFunction);
    });

    it('can transform results', function () {
      value = ['h1', { key: 'a value' }, ['a child string']];

      visitors[PartType.childString] = (part): string | ContentNode => {
        if (part === 'a child string') {
          return 'a different string';
        }
        return part;
      };
      const results = transform(value, visitors);
      expect(results).toEqual(['h1', { key: 'a value' }, ['a different string']]);
    });

    it('can transform to ContentNode', function () {
      value = ['h1', { key: 'a value' }, ['a child string']];

      visitors[PartType.childString] = (part): string | ContentNode => {
        if (part === 'a child string') {
          return ['InnerHtml', { text: 'a child string' }];
        }
        return part;
      };
      const results = transform(value, visitors);
      expect(results).toEqual(['h1', { key: 'a value' }, [['InnerHtml', { text: 'a child string' }]]]);
    });

    it('can transform to ContentNode with children', function () {
      value = ['h1', { key: 'a value' }, ['a child string']];

      visitors[PartType.childString] = (part): string | ContentNode => {
        if (part === 'a child string') {
          return ['div', null, [['span', null, ['a']], ['span', null, ['child']], ['span', null, ['string']]]];
        }
        return part;
      };
      const results = transform(value, visitors);
      expect(results).toEqual(['h1', { key: 'a value' }, [
        ['div', null, [['span', null, ['a']], ['span', null, ['child']], ['span', null, ['string']]]]
      ]]);
    });

    it('has expected types signature', function () {
      visitors[PartType.childString] = (part): string => part;
      visitors[PartType.childString] = (part): string => 'a string';
      visitors[PartType.childString] = (part, stopTraversal): string => {
        stopTraversal();
        return part;
      };

      // @ts-expect-error
      visitors[PartType.childString] = (part): string => (1234);
      // @ts-expect-error
      visitors[PartType.childString] = (part): string => {
      };
      // @ts-expect-error
      visitors[PartType.childString] = (part): number => 'a string';
    });
  });

  describe(PartType.stringValue, function () {

    it('is visited', function () {
      value = ['h1', { key: 'a value' }, ['a child string']];

      visitors[PartType.stringValue] = (part): ComponentName => part;
      spyOn(visitors, PartType.stringValue);
      transform(value, visitors);

      expect(visitors[PartType.stringValue]).toHaveBeenCalledWith('a value', anyFunction);
    });

    it('is visited in children', function () {
      value = ['h1', { key: 'a value' }, [['h2', { key: 'a child value' }], 'a child string']];

      visitors[PartType.stringValue] = (part): ComponentName => part;
      spyOn(visitors, PartType.stringValue);
      transform(value, visitors);

      expect(visitors[PartType.stringValue]).toHaveBeenCalledWith('a value', anyFunction);
      expect(visitors[PartType.stringValue]).toHaveBeenCalledWith('a child value', anyFunction);
    });

    it('can transform results', function () {
      value = ['h1', { key: 'a value' }, ['a child string']];

      visitors[PartType.stringValue] = (part): string | ContentNode => {
        if (part === 'a value') {
          return 'a different value';
        }
        return part;
      };
      const results = transform(value, visitors);
      expect(results).toEqual(['h1', { key: 'a different value' }, ['a child string']]);
    });

    it('can transform to ContentNode', function () {
      value = ['h1', { key: 'a value' }, ['a child string']];

      visitors[PartType.stringValue] = (part, stopTraversal): string | ContentNode => {
        stopTraversal();

        if (part === 'a value') {
          return ['InnerHtml', { text: 'a value' }];
        }
        return part;
      };
      const results = transform(value, visitors);
      expect(results).toEqual(['h1', { key: ['InnerHtml', { text: 'a value' }] }, ['a child string']]);
    });

    it('can transform to ContentNode with children', function () {
      value = ['h1', { key: 'a value' }, ['a child string']];

      visitors[PartType.stringValue] = (part): string | ContentNode => {
        if (part === 'a value') {
          return ['div', null, [['span', null, ['a']], ['span', null, ['child']], ['span', null, ['string']]]];
        }
        return part;
      };
      const results = transform(value, visitors);
      expect(results).toEqual(['h1', {
        key: ['div', null, [['span', null, ['a']], ['span', null, ['child']], ['span', null, ['string']]]]
      }, ['a child string']
      ]);
    });

    it('has expected types signature', function () {
      visitors[PartType.stringValue] = (part): string => part;
      visitors[PartType.stringValue] = (part): string => 'a string';
      visitors[PartType.stringValue] = (part, stopTraversal): string => {
        stopTraversal();
        return part;
      };

      // @ts-expect-error
      visitors[PartType.stringValue] = (part): string => (1234);
      // @ts-expect-error
      visitors[PartType.stringValue] = (part): string => {
      };
      // @ts-expect-error
      visitors[PartType.stringValue] = (part): number => 'a string';
    });
  });

  describe(PartType.unknownValue, function () {

    it('is visited', function () {
      value = ['h1', { key: 123 }, ['a child string']];

      visitors[PartType.unknownValue] = (part): ComponentName => part;
      spyOn(visitors, PartType.unknownValue);
      transform(value, visitors);

      expect(visitors[PartType.unknownValue]).toHaveBeenCalledWith(123, anyFunction);
    });

    it('is visited in children', function () {
      value = ['h1', { key: 123 }, [['h2', { key: 456 }], 'a child string']];

      visitors[PartType.unknownValue] = (part): ComponentName => part;
      spyOn(visitors, PartType.unknownValue);
      transform(value, visitors);

      expect(visitors[PartType.unknownValue]).toHaveBeenCalledWith(123, anyFunction);
      expect(visitors[PartType.unknownValue]).toHaveBeenCalledWith(456, anyFunction);
    });

    it('has expected types signature', function () {
      visitors[PartType.unknownValue] = (part): any => part;
      visitors[PartType.unknownValue] = (part): any => 123;
      visitors[PartType.unknownValue] = (part, stopTraversal): any => {
        stopTraversal();
        return part;
      };

      visitors[PartType.unknownValue] = (part): any => (1234);
      visitors[PartType.unknownValue] = (part): any => {
      };
      visitors[PartType.unknownValue] = (part): any => 'a string';
    });
  });

  describe('cleanChildren', function () {
    it('strips children element if undefined', function () {
      // eslint-disable-next-line no-undefined
      expect(cleanChildren(['h1', { key: 'value' }, undefined])).toEqual(['h1', { key: 'value' }]);
    });

    it('strips children element if empty array', function () {
      expect(cleanChildren(['h1', null, []])).toEqual(['h1', null]);
    });

    it('does nothing if ok', function () {
      expect(cleanChildren(['h1', { key: 'value' }])).toEqual(['h1', { key: 'value' }]);
      expect(cleanChildren(['h1', null])).toEqual(['h1', null]);
      expect(cleanChildren(['h1', null, ['a child string']])).toEqual(['h1', null, ['a child string']]);
    });
  });
});
