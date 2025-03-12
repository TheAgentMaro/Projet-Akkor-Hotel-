import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Bookings from '../../src/pages/Bookings';

vi.mock('axios');

describe('Bookings Page', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'FAKE_TOKEN_123');
    vi.resetAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('affiche l’état de chargement puis la liste des réservations', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
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
      }
    });

    render(
      <MemoryRouter>
        <Bookings />
      </MemoryRouter>
    );

    // Vérifier que le message de chargement apparaît
    expect(screen.getByText(/Chargement.../i)).toBeInTheDocument();

    // Attendre que les réservations soient affichées
    await waitFor(() => {
      expect(screen.getByText(/Mes Réservations/i)).toBeInTheDocument();
      expect(screen.getByText(/Hotel Test/i)).toBeInTheDocument();
    });
  });

  it("affiche un message d'erreur en cas d'échec de l'API", async () => {
    axios.get.mockRejectedValueOnce(new Error('Server error'));

    render(
      <MemoryRouter>
        <Bookings />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Erreur lors du chargement des réservations/i)).toBeInTheDocument();
    });
  });
});
