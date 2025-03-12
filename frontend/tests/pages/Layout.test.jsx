import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import Layout from '../../src/components/Layout';

describe('Layout Component', () => {
  test('renders header with navigation and footer correctly', () => {
    const { container } = render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    const titleElements = screen.getAllByText(/Akkor Hotel/i);
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header).toContainElement(titleElements[0]);

    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent(/Tous droits réservés/i);
  });
});
