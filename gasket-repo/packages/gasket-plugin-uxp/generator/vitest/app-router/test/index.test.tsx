import React from 'react';
import { render, screen } from '@testing-library/react';
import IndexPage from '../app/[plid]/[market]/[currency]/page.tsx';
import { describe, it, expect } from 'vitest';

describe('IndexPage', () => {
  it('renders page', () => {
    render(<IndexPage />);

    expect(screen.getByRole('heading').textContent).toBe('Welcome to Gasket!');
  });
});
