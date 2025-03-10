// frontend/tests/pages/Hotels.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Hotels from '../../../src/pages/Hotels';
import { rest } from 'msw';
import { server } from '../../mocks/server';

describe('Hotels Page', () => {
  it('affiche l’état de chargement puis la liste des hôtels', async () => {
    render(<Hotels />);
    expect(screen.getByText(/Chargement.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Liste des Hôtels/i)).toBeInTheDocument();
    });
  });

  it("affiche un message d'erreur en cas d'échec de l'API", async () => {
    server.use(
      rest.get('http://localhost:3000/api/hotels', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    render(<Hotels />);
    await waitFor(() => {
      expect(screen.getByText(/Erreur lors du chargement des hôtels/i)).toBeInTheDocument();
    });
  });
});
