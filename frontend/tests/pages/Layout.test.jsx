import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../../src/components/Layout';

describe('Layout Component', () => {
  test('renders header and footer', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );
    expect(screen.getByText(/Akkor Hotel/)).toBeInTheDocument();
    expect(screen.getByText(/Tous droits réservés/)).toBeInTheDocument();
  });
});
