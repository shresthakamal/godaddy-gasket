/// <reference types="@testing-library/jest-dom" />

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render } from './helpers';
import { toReactNode, getComponent } from '../src/to-react-node';
import type { ComponentMap } from '../src/types';
import type { ContentNode } from '@godaddy/gasket-content-nodes';

const MockComponent = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid='mock-component'>{children}</div>
);

describe('getComponent', function () {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(function () {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(function () {
    consoleErrorSpy.mockRestore();
  });

  it('looks up components from map, defaults, or creates HTML fallbacks', function () {
    const map: ComponentMap = {
      MockComponent,
      nested: { comp: MockComponent }
    };

    expect(getComponent('MockComponent', map)).toBe(MockComponent);
    expect(getComponent('nested.comp', map)).toBe(MockComponent);
    expect(getComponent('Fragment', {})).toBeDefined();
    expect(getComponent('div', {})).toBeDefined();
  });

  it('returns FallbackDiv and logs error for invalid component names', function () {
    expect(getComponent('Invalid.Name', {})).toBeDefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error resolving from component map (Invalid.Name)'
    );
  });
});

describe('toReactNode', function () {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(function () {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(function () {
    consoleErrorSpy.mockRestore();
  });

  it('returns strings as-is', function () {
    expect(toReactNode('text', {})).toBe('text');
  });

  it('converts content nodes with props and nested children', function () {
    const node: ContentNode = [
      'div',
      { className: 'test' },
      ['Text ', ['MockComponent', {}, [['strong', {}, ['nested']]]], ' end']
    ];
    const wrapper = render(
      toReactNode(node, { MockComponent }) as React.ReactElement
    );

    expect(wrapper.container.querySelector('.test')).toHaveTextContent(
      'Text nested end'
    );
    expect(wrapper.getByTestId('mock-component')).toBeInTheDocument();
    expect(wrapper.getAllByTestId('mock-component')).toHaveLength(1);
  });

  it('wraps components with error boundaries', function () {
    const ThrowError = () => {
      throw new Error('test');
    };
    const node: ContentNode = ['ThrowError', {}, []];
    const wrapper = render(
      toReactNode(node, { ThrowError }) as React.ReactElement
    );

    expect(wrapper.container).toBeEmptyDOMElement();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('applies HOC when provided', function () {
    const hoc =
      (C: React.ComponentType) => (props: Record<string, unknown>) => (
        <div data-testid='hoc'>
          <C {...props} />
        </div>
      );
    const node: ContentNode = ['MockComponent', {}, []];
    const wrapper = render(
      toReactNode(node, { MockComponent }, hoc) as React.ReactElement
    );

    expect(wrapper.getByTestId('hoc')).toBeInTheDocument();
    expect(wrapper.getByTestId('mock-component')).toBeInTheDocument();
  });

  it('handles event handlers in props', function () {
    const onClick = vi.fn();
    const Button = ({ onClick: click }: { onClick: () => void }) => (
      <button onClick={click} data-testid='btn'>
        Click
      </button>
    );
    const node: ContentNode = ['Button', { onClick }, []];
    const wrapper = render(toReactNode(node, { Button }) as React.ReactElement);

    wrapper.getByTestId('btn').click();
    expect(onClick).toHaveBeenCalled();
  });
});
