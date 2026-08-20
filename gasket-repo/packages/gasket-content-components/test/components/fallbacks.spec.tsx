import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '../helpers';
import { makeComponent, FallbackDiv } from '../../src/components/fallbacks';

describe('makeComponent', function () {
  it('creates and caches HTML elements', function () {
    const H1 = makeComponent('h1');
    const wrapper = render(<H1>hello</H1>);

    expect(wrapper.getByRole('heading')).toHaveTextContent('hello');

    const Div1 = makeComponent('div');
    const Div2 = makeComponent('div');

    expect(Div1).toBe(Div2);
  });
});

describe('FallbackDiv', function () {
  it('renders', function () {
    const wrapper = render(<FallbackDiv>example</FallbackDiv>);

    expect(wrapper.getByText('example')).toBeTruthy();
  });
});
