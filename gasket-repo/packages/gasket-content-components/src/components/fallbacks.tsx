import React from 'react';
import type { ComponentType, PropsWithChildren } from 'react';

const componentMap: Record<string, ComponentType<PropsWithChildren<any>>> = {};

/*
 * Make a basic component for a html or custom element tag
 */
export function makeComponent(tag: string): ComponentType<PropsWithChildren<any>> {
  let component = componentMap[tag];
  if (!component) {
    component = function Component(props) {
      return React.createElement(tag, props);
    };
    componentMap[tag] = component;
  }
  return component;
}

export const FallbackDiv = makeComponent('div');
