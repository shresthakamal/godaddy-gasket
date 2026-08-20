import { ContentNode, isContentNode, PartType } from '../../src';
import { trackingToUnderscore } from './simple-delegate';

function flattenAltText(node: ContentNode) {
  const [name, props, children] = node;
  if (props && props.altText) {
    const { altText, ...rest } = props;
    if (isContentNode(altText)) {
      const [, altTextProps] = altText;
      const transformedProps = { ...rest, altText: altTextProps };
      return children ? [name, transformedProps, children] : [name, transformedProps];
    }
  }
  return node;
}

function moveTokenPropsToChildren(node) {
  const [name, props] = node;
  if (name === 'Token') {
    const { title, ...rest } = props;
    const children = [['TokenChild', rest, [title]]];
    return [name, {}, children];
  }
  return node;
}

function transformBynderImage(node) {
  const [name, props] = node;
  if (name === 'BynderImage') {
    if (props.image[0].thumbnails) {
      const thumbnails = props.image[0].thumbnails;
      const children: any[] = [];
      Object.keys(thumbnails).forEach((key) => {
        if (thumbnails[key].includes('.png')) {
          children.push(['BynderImageChild', {}, [thumbnails[key]]]);
        }
      });
      return [name, props, children];
    }
  }
  return node;
}

export function process(node: ContentNode) {
  let result = flattenAltText(node);
  result = moveTokenPropsToChildren(result);
  result = trackingToUnderscore(result);
  return transformBynderImage(result);
}

export default function delegate(part: any, partType: PartType) {
  if (partType === PartType.node) {
    return process(part);
  }
  return part;
}
