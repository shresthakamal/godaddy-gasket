import { PartType } from '@godaddy/gasket-content-nodes';

export function trackingToUnderscore(node) {
  const [name, props, children] = node;
  if (props && 'trackingName' in props) {
    const { trackingName, ...rest } = props;
    const propsWithName = { _name: trackingName, ...rest };
    return children ? [name, propsWithName, children] : [name, propsWithName];
  }
  return node;
}

export default function delegate(aPart: any, aPartType: PartType): any {
  if (aPartType !== 'node') return aPart;
  return trackingToUnderscore(aPart);
}
