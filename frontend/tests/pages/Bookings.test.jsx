// frontend/tests/pages/Bookings.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Bookings from '../../../src/pages/Bookings';
import { rest } from 'msw';
import { server } from '../../mocks/server';

describe('Bookings Page', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'FAKE_TOKEN_123');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('affiche l’état de chargement puis la liste des réservations', async () => {
    // Redéfinition de la réponse du serveur pour /bookings/me
    server.use(
      rest.get('http://localhost:3000/api/bookings/me', (req, res, ctx) => {
        return res(
          ctx.json({
            success: true,
            data: [
              {
                id: '1',
                hotel: { name: 'Hotel Test' },
                checkIn: new Date().toISOString(),
                checkOut: new Date().toISOString(),
                status: 'confirmed'
              }
            ]
          })
        );
      })
    );
    render(<Bookings />);
    expect(screen.getByText(/Chargement.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Mes Réservations/i)).toBeInTheDocument();
      expect(screen.getByText(/Hotel Test/i)).toBeInTheDocument();
    });
  });

  it("affiche un message d'erreur en cas d'échec de l'API", async () => {
    server.use(
      rest.get('http://localhost:3000/api/bookings/me', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    render(<Bookings />);
    await waitFor(() => {
      expect(screen.getByText(/Erreur lors du chargement des réservations/i)).toBeInTheDocument();
    });
  });
});
