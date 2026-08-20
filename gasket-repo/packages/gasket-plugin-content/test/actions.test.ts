import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Gasket } from '@gasket/core';
import { getTransformedContent } from '../src/actions.js';
import { ContentData } from '../src/types.js';
import { ContentNode } from '@godaddy/gasket-content-nodes';

const mockSingleTransform = {
  name: 'mockSingleLocaleTransform',
  handler: vi.fn().mockImplementation((_gasket, contentNodes) => {
    const [name, props, children = []] = contentNodes[0];
    return [[name, props, [...children, `child-${children.length}`]]];
  })
};

const mockMutatingTransform = {
  name: 'mockMutatingTransform',
  handler: vi.fn().mockImplementation((_gasket, contentNodes) => {
    const [, props] = contentNodes[0];
    props.mutated ??= [];
    props.mutated.push('mutated');
    return contentNodes;
  })
};

function mockMultipleTransforms(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    name: `mockSingleLocaleTransform-${i}`,
    handler: mockSingleTransform.handler
  }));
}

function mockMultipleMutatingTransforms(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    name: `mockMutatingTransform-${i}`,
    handler: mockMutatingTransform.handler
  }));
}

describe('actions.getTransformedContent', () => {
  let mockGasket: Gasket;
  let mockContentData: ContentData;
  let mockContext: any;

  beforeEach(() => {
    mockSingleTransform.handler.mockClear();
    mockGasket = {
      trace: vi.fn(),
      plugins: [],
      root: '/path/to/root',
      config: {
        env: 'local'
      },
      actions: {
        getVisitor: vi.fn(),
        getTransformedContent
      },
      logger: {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
      }
    } as unknown as Gasket;
    mockContentData = {
      contentNodes: [
        ['h1', null, ['hello world']]
      ],
      debug: {}
    };
    mockContext = {};
  });

  it('does not mutate the original content data', async () => {
    const contentNodes: ContentNode[] = [['h1', null, ['hello world']]];
    const contentData = { contentNodes, debug: {} };
    const transforms = [mockSingleTransform];

    const result = await getTransformedContent(mockGasket, transforms, contentData, mockContext);

    expect(result).not.toBe(contentData);
  });

  it('awaits async transforms', async () => {
    const contentNodes: ContentNode[] = [['h1', null, ['hello world']]];
    const contentData = { contentNodes, debug: {} };
    mockSingleTransform.handler.mockImplementationOnce(async (_gasket, contentNodes) => {
      await new Promise(resolve => setTimeout(resolve, 5));
      return 'async result';
    });
    const transforms = [mockSingleTransform];

    const result = await getTransformedContent(mockGasket, transforms, contentData, mockContext);

    expect(result.contentNodes).toEqual('async result');
  });

  describe('validation', () => {
    it('warns if no transforms are provided', async () => {
      const result = await getTransformedContent(mockGasket, [], mockContentData, mockContext);
      expect(result).toEqual(mockContentData);
      expect(mockGasket.logger.warn).toHaveBeenCalled();
    });

    it('warns if no content nodes are provided', async () => {
      mockContentData = { contentNodes: [], debug: {} };
      const result = await getTransformedContent(mockGasket, [mockSingleTransform], mockContentData, mockContext);
      expect(result).toEqual(mockContentData);
      expect(mockGasket.logger.warn).toHaveBeenCalled();
    });

    it('throws if a transform is missing a name', async () => {
      const transforms = [{ handler: vi.fn() }];
      await expect(async () => {
        // @ts-expect-error
        await getTransformedContent(mockGasket, transforms, mockContentData, mockContext);
      }).rejects.toThrow();
    });

    it('throws if a transform is missing a handler', async () => {
      const transforms = [{ name: 'missingHandler' }];
      await expect(async () => {
        // @ts-expect-error
        await getTransformedContent(mockGasket, transforms, mockContentData, mockContext);
      }).rejects.toThrow();
    });

    it('throws if a transform handler is not a function', async () => {
      const transforms = [{ name: 'missingHandler', handler: 'not a function' }];
      await expect(async () => {
        // @ts-expect-error
        await getTransformedContent(mockGasket, transforms, mockContentData, mockContext);
      }).rejects.toThrow();
    });

    it('throws if two transforms have the same name', async () => {
      const transforms = [mockSingleTransform, mockSingleTransform];
      await expect(async () => {
        await getTransformedContent(mockGasket, transforms, mockContentData, mockContext);
      }).rejects.toThrow();
    });
  });

  describe('processing', () => {
    it('calls each transform handler with content nodes and context', async () => {
      const transforms = [mockSingleTransform];
      await getTransformedContent(mockGasket, transforms, mockContentData, mockContext);
      expect(mockSingleTransform.handler).toHaveBeenCalledWith(mockGasket, mockContentData.contentNodes, mockContext);
    });

    it('updates content nodes with the result of each transform', async () => {
      const transforms = mockMultipleTransforms(4);
      const result = await getTransformedContent(mockGasket, transforms, mockContentData, mockContext);
      expect(result.contentNodes).toEqual([
        [
          'h1',
          null,
          ['hello world', 'child-1', 'child-2', 'child-3', 'child-4']
        ]
      ]);
    });

    it('adds snapshots if context.enableSnapshots is true', async () => {
      const transforms = mockMultipleTransforms(3);
      mockContext.enableSnapshots = true;
      const result = await getTransformedContent(mockGasket, transforms, mockContentData, mockContext);
      expect(result.debug.snapshots).toHaveLength(4);
      expect(result.debug.snapshots?.[0].name).toEqual('initial');
      expect(result.debug.snapshots?.[1].name).toEqual('mockSingleLocaleTransform-0');
      expect(result.debug.snapshots?.[1].contentNodes).toEqual([
        ['h1', null, ['hello world', 'child-1']]
      ]);
      expect(result.debug.snapshots?.[2].contentNodes).toEqual([
        ['h1', null, ['hello world', 'child-1', 'child-2']]
      ]);
    });

    it('does not mutate the results of each snapshot from mutating transforms', async () => {
      const transforms = mockMultipleMutatingTransforms(2);
      mockContext.enableSnapshots = true;
      const contentData: ContentData = {
        contentNodes: [
          ['Component', { id: 1 }]
        ],
        debug: {}
      }
      const result = await getTransformedContent(mockGasket, transforms, contentData, mockContext);
      expect(result.debug.snapshots).toHaveLength(3);
      expect(result.debug.snapshots?.[0].name).toEqual('initial');
      expect(result.debug.snapshots?.[1].name).toEqual('mockMutatingTransform-0');
      expect(result.debug.snapshots?.[1].contentNodes).toEqual([
        ['Component', { id: 1, mutated: ['mutated'] }]
      ]);
      expect(result.debug.snapshots?.[2].name).toEqual('mockMutatingTransform-1');
      expect(result.debug.snapshots?.[2].contentNodes).toEqual([
        ['Component', { id: 1, mutated: ['mutated', 'mutated'] }]
      ]);
    });

    it('logs a trace message for each transform', async () => {
      const transforms = mockMultipleTransforms(3);
      await getTransformedContent(mockGasket, transforms, mockContentData, mockContext);
      expect(mockGasket.trace).toHaveBeenCalledTimes(3);
    });
  });
});
