import { vi } from 'vitest';
import { reverseTransformNodesAsync, ContentNode } from '../src';

describe('reverseTransformNodesAsync', function () {
  let mockDelegate;
  let contentNode: ContentNode;

  beforeEach(function () {
    mockDelegate = vi.fn(async (part) => part);
  });

  it('returns tranformed ContentNode', async function () {
    const expected = ['TransformedNode', null];
    mockDelegate = () => expected;
    contentNode = ['ExampleNode', { key: 'a value' }];
    const result = await reverseTransformNodesAsync(contentNode, 'ExampleNode', mockDelegate);

    expect(result).toEqual(expected);
  });

  it('returns string', async function () {
    const expected = 'String';
    mockDelegate = () => expected;
    contentNode = ['ExampleNode', { key: 'a value' }];
    const result = await reverseTransformNodesAsync(contentNode, 'ExampleNode', mockDelegate);

    expect(result).toEqual(expected);
  });

  it('returns undefined', async function () {
    // eslint-disable-next-line no-undefined
    const expected = undefined;
    mockDelegate = () => expected;
    contentNode = ['ExampleNode', { key: 'a value' }];
    const result = await reverseTransformNodesAsync(contentNode, 'ExampleNode', mockDelegate);

    expect(result).toEqual(expected);
  });

  it('does not tranform non-target node', async function () {
    contentNode = ['AnotherNode', null, [['ExampleNode', { key: 'a value' }]]];
    await reverseTransformNodesAsync(contentNode, 'ExampleNode', mockDelegate);

    expect(mockDelegate).not.toHaveBeenCalledWith(contentNode);
  });

  it('transforms target node in children', async function () {
    const targetNode = ['ExampleNode', { key: 'a value' }] as ContentNode;
    contentNode = ['AnotherNode', null, [targetNode]];
    await reverseTransformNodesAsync(contentNode, 'ExampleNode', mockDelegate);

    expect(mockDelegate).toHaveBeenCalledWith(targetNode);
  });

  it('transforms target node in props', async function () {
    const targetNode = ['ExampleNode', { key: 'a value' }] as ContentNode;
    contentNode = ['AnotherNode', { key: targetNode }];
    await reverseTransformNodesAsync(contentNode, 'ExampleNode', mockDelegate);

    expect(mockDelegate).toHaveBeenCalledWith(targetNode);
  });
});

