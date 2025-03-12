import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('affiche un message lorsque aucune réservation n\'est trouvée', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: []
      }
    });

    render(
      <MemoryRouter>
        <Bookings />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Aucune réservation trouvée/i)).toBeInTheDocument();
    });
  });

  it('annule une réservation avec succès', async () => {
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

    axios.delete.mockResolvedValueOnce({
      data: {
        success: true
      }
    });

    render(
      <MemoryRouter>
        <Bookings />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Hotel Test/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Annuler/i));

    await waitFor(() => {
      expect(screen.getByText(/Confirmer l'annulation/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Confirmer l'annulation/i));

    await waitFor(() => {
      expect(screen.queryByText(/Hotel Test/i)).not.toBeInTheDocument();
    });
  });

  it('affiche un message d\'erreur lors de l\'annulation d\'une réservation', async () => {
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

    axios.delete.mockRejectedValueOnce(new Error('Server error'));

    render(
      <MemoryRouter>
        <Bookings />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Hotel Test/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Annuler/i));

    await waitFor(() => {
      expect(screen.getByText(/Confirmer l'annulation/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Confirmer l'annulation/i));

    await waitFor(() => {
      expect(screen.getByText(/Erreur lors de l'annulation/i)).toBeInTheDocument();
    });
  });
});