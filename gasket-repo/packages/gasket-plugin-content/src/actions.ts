import type { Gasket } from '@gasket/core';
import type { ContentNode } from '@godaddy/gasket-content-nodes';
import type { ContentData, ContentContext, ContentTransform } from './types.js';


function validateTransforms(transforms: ContentTransform[]) {
  transforms.forEach((transform, index) => {
    if (!transform.name) {
      throw new Error(`Transform at index ${index} is missing a name`);
    }
    if (!transform.handler) {
      throw new Error(`Transform ${transform.name} is missing a handler`);
    }
    if (typeof transform.handler !== 'function') {
      throw new Error(`Transform ${transform.name} handler must be a function`);
    }
  });

  const names = transforms.map(transform => transform.name);
  const nameCounts = names.reduce((acc, name) => {
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const duplicateNames = Object.keys(nameCounts).filter(name => nameCounts[name] > 1);
  if (duplicateNames.length > 0) {
    throw new Error(`Transform names must be unique. Duplicates: ${duplicateNames.join(', ')}`);
  }
}

function makeProcessors(gasket: Gasket, transforms: ContentTransform[]) {
  validateTransforms(transforms);
  return transforms.map(transform => {
    const { name, handler } = transform;
    return async (contentNodes: ContentNode[] | null, context: ContentContext) => {
      gasket.trace(`  ⧉ ${name}`);
      const result = await handler(gasket, contentNodes, context);
      return { name, result };
    };
  });
}

export async function getTransformedContent(
  gasket: Gasket,
  transforms: ContentTransform[] = [],
  contentData: ContentData,
  context: ContentContext
) {

  const transformed = structuredClone(contentData);

  if (!transforms.length) {
    gasket.logger.warn('plugin-content: No transforms or content nodes to process');
    return transformed;
  } else if (!transformed.contentNodes?.[0]) {
    gasket.logger.warn('plugin-content: No content nodes to process');
    return transformed;
  }

  const processors = makeProcessors(gasket, transforms);
  const initialTransformedAt = new Date().toISOString();

  for (const processor of processors) {
    const { name, result } = await processor(transformed.contentNodes, context);

    transformed.contentNodes = result;

    if (context.enableSnapshots) {
      transformed.debug.snapshots ??= [
        {
          name: 'initial',
          transformedAt: initialTransformedAt,
          contentNodes: contentData.contentNodes
        }
      ];
      transformed.debug.snapshots.push({
        name,
        transformedAt: new Date().toISOString(),
        contentNodes: structuredClone(result)
      });
    }
  }

  transformed.debug.transformedAt = new Date().toISOString();
  return transformed;
}
