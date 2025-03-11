import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Hotels from '../../src/pages/Hotels';

vi.mock('axios');

describe('Hotels Page', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('affiche l’état de chargement puis la liste des hôtels', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [
          {
            id: '1',
            name: 'Hotel A',
            location: 'Paris',
            description: 'Un super hôtel'
          }
        ]
      }
    });

    render(<Hotels />);

    // Vérifier le message de chargement
    expect(screen.getByText(/Chargement.../i)).toBeInTheDocument();

    // Attendre que les hôtels soient affichés
    await waitFor(() => {
      expect(screen.getByText(/Liste des Hôtels/i)).toBeInTheDocument();
      expect(screen.getByText(/Hotel A/i)).toBeInTheDocument();
      expect(screen.getByText(/Paris/i)).toBeInTheDocument();
    });
  });

  it("affiche un message d'erreur en cas d'échec de l'API", async () => {
    axios.get.mockRejectedValueOnce(new Error('Server error'));

    render(<Hotels />);

    await waitFor(() => {
      expect(screen.getByText(/Erreur lors du chargement des hôtels/i)).toBeInTheDocument();
    });
  });
});
