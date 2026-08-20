/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect } from 'vitest';
import { render } from '../helpers';
import { HtmlWrapper, defaultComponents } from '../../src/components/defaults';
import React from 'react';

describe('HtmlWrapper', function () {
  it('renders HTML via dangerouslySetInnerHTML', function () {
    const wrapper = render(<HtmlWrapper html='<h4>Title</h4>' />);

    expect(wrapper.getByRole('heading')).toHaveTextContent('Title');
    expect(wrapper.container.querySelector('span')).toBeInTheDocument();
  });
});

describe('defaultComponents', function () {
  it('exports HtmlWrapper and Fragment', function () {
    expect(Object.keys(defaultComponents)).toEqual(['HtmlWrapper', 'Fragment']);
  });
});
