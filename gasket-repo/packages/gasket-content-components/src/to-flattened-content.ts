import type { ContentNode, ContentNodeChildren, ComponentProps } from '@godaddy/gasket-content-nodes';
import { traverse, PartType, type TraversalDelegate } from '@godaddy/gasket-content-nodes';

/**
 * Union type representing all possible values that can appear in a ContentNode structure
 */
type ContentNodeValue =
  | ContentNode
  | ContentNode[]
  | ContentNodeChildren
  | ComponentProps
  | string
  | number
  | boolean
  | null
  | undefined;

/**
 * Recursively transform ContentNode tuples to plain objects
 * Flattens both 2-element and 3-element tuples to plain objects
 * @param {ContentNodeValue} data - ContentNode structure or nested values to transform
 * @returns {Record<string, unknown>[] | Record<string, unknown> | string | number | boolean | null}
 *   Flattened plain objects - ContentNode tuples become Record<string, unknown>
 * @example
 * ```ts
 * import { toFlattenedContent } from '@godaddy/gasket-content-components';
 *
 * const contentData = await gasket.actions.getContentfulEntries(props, context);
 * const contentObjects = toFlattenedContent(contentData.contentNodes);
 * ```
 */
export function toFlattenedContent(
  data: ContentNodeValue
): Record<string, unknown>[] | Record<string, unknown> | string | number | boolean | null {
  const delegate: TraversalDelegate = (part, partType) => {
    if (partType === PartType.node) {
      const node = part as ContentNode;
      // Check if it's a ContentNode tuple [string, object, ...] - flatten to props object
      const isContentNodeTuple =
        Array.isArray(node) &&
        node.length >= 2 &&
        typeof node[0] === 'string' &&
        (typeof node[1] === 'object' || node[1] == null);

      if (isContentNodeTuple) {
        const props = node[1];
        const children = node.length >= 3 ? node[2] : null;

        const flattened = props == null ? {} : { ...props };

        if (children != null) {
          flattened.children = children;
        }

        return flattened;
      }
      return part; // For non-ContentNode structures, return as-is - traverse will recursively process
    }
    return part; // For all other types, return as-is and let traverse handle recursion
  };

  return traverse(data, delegate, PartType.unknownValue);
}

