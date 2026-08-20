import type { ComponentType, ReactElement, ReactNode } from 'react';
import React, { PropsWithChildren } from 'react';
import { withErrorBoundary } from './error-boundary.js';
import type { ComponentMap } from './types.js';
import { ContentNode, PartType, reverseTraverse } from '@godaddy/gasket-content-nodes';
import { defaultComponents } from './components/defaults.js';
import { FallbackDiv, makeComponent } from './components/fallbacks.js';
import { isString } from './type-utils.js';
import { deepLookup } from './utils.js';

// eslint-disable-next-line no-console
const logError = (...args: any[]) => console.error(...args);

/*
 * Lookup component from node name
 */
export function getComponent(name: string, components: ComponentMap): ComponentType<PropsWithChildren<any>> {
  try {
    let component = deepLookup<ComponentType<any>>(name, components);

    // check if the component is one of the defaults
    if (!component) {
      component = defaultComponents[name];
    }

    // fallback to html or custom elements
    if (!component && /^[a-z\-0-9]+$/.test(name)) {
      return makeComponent(name);
    }

    // otherwise we must error out
    if (!component) {
      throw new Error(`Component ${name} undefined.`);
    }
    return component;
  } catch (error) {
    logError(`Error resolving from component map (${name})`);
    return FallbackDiv;
  }
}

function makeElement(node: ContentNode, componentMap: ComponentMap, hoc?: Function): ReactNode {
  const [name, props, childNodes] = node;
  const boundaryKey = ['component-error', name].join('-');

  const Component = getComponent(name, componentMap);

  let WrappedComponent = withErrorBoundary<any>({ key: boundaryKey })(Component);
  WrappedComponent = hoc ? hoc(WrappedComponent, node) : WrappedComponent;

  return (
    <WrappedComponent {...props}>
      {childNodes}
    </WrappedComponent >
  );
}

function makeDelegate(componentMap: ComponentMap, hoc?: Function) {
  return function delegate(part: any, partType: PartType) {
    if (partType === PartType.children) {
      return part.map((child: ReactElement<PropsWithChildren>, idx: number) => {
        if (isString(child)) return child;
        return React.cloneElement(child, { key: idx }, child.props?.children);
      });
    }
    if (partType === PartType.node) {
      return makeElement(part, componentMap, hoc);
    }
    return part;
  };
}

export function toReactNode(contentNode: ContentNode | string, componentMap: ComponentMap, hoc?: Function): ReactNode {
  if (typeof contentNode === 'string') return contentNode;
  const delegate = makeDelegate(componentMap, hoc);
  return reverseTraverse(contentNode, delegate);
}
