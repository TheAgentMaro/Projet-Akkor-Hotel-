import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Hotels from '../../src/pages/Hotels';
import AuthContext from '../../src/context/AuthContext';
import { hotelApi } from '../../src/services/api';

// Mock des API
vi.mock('../../src/services/api', () => ({
  hotelApi: {
    getAllHotels: vi.fn()
  }
}));

// Mock du hook useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Hotels Component', () => {
  const mockHotels = [
    {
      _id: '1',
      name: 'Grand Hôtel Paris',
      location: 'Paris, France',
      description: 'Un hôtel luxueux au cœur de Paris',
      price: 250,
      images: ['hotel1.jpg']
    },
    {
      _id: '2',
      name: 'Seaside Resort',
      location: 'Nice, France',
      description: 'Profitez de la vue sur la mer Méditerranée',
      price: 180,
      images: ['hotel2.jpg']
    }
  ];

  // Configuration de l'environnement Vite pour les tests
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock de l'environnement Vite
    if (!import.meta.env) {
      import.meta.env = {};
    }
    import.meta.env.VITE_API_URL = 'http://localhost:5000/api';
    
    // Configuration par défaut pour les tests
    hotelApi.getAllHotels.mockResolvedValue({
      success: true,
      data: mockHotels,
      total: 20
    });
  });

  it('affiche un indicateur de chargement puis la liste des hôtels', async () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <MemoryRouter>
          <Hotels />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Vérifier l'indicateur de chargement
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Attendre que les hôtels soient affichés
    await waitFor(() => {
      expect(screen.getByText('Nos Hôtels')).toBeInTheDocument();
      expect(screen.getByText('Grand Hôtel Paris')).toBeInTheDocument();
      expect(screen.getByText('Seaside Resort')).toBeInTheDocument();
    });

    // Vérifier que l'API a été appelée avec les bons paramètres
    expect(hotelApi.getAllHotels).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      sort: 'createdAt',
      order: 'desc'
    });
  });

  it('affiche un message d\'erreur en cas d\'échec de l\'API', async () => {
    // Simuler une erreur API
    hotelApi.getAllHotels.mockRejectedValueOnce(new Error('Erreur serveur'));

    render(
      <AuthContext.Provider value={{ user: null }}>
        <MemoryRouter>
          <Hotels />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Attendre que le message d'erreur s'affiche
    await waitFor(() => {
      expect(screen.getByText(/Erreur lors du chargement des hôtels/i)).toBeInTheDocument();
    });

    // Vérifier que le bouton "Réessayer" est présent
    const retryButton = screen.getByRole('button', { name: /Réessayer/i });
    expect(retryButton).toBeInTheDocument();

    // Simuler un clic sur le bouton "Réessayer"
    hotelApi.getAllHotels.mockResolvedValueOnce({
      success: true,
      data: mockHotels,
      total: 20
    });
    
    fireEvent.click(retryButton);

    // Vérifier que l'API a été appelée à nouveau
    expect(hotelApi.getAllHotels).toHaveBeenCalledTimes(2);
  });

  it('affiche le bouton de gestion des hôtels pour les administrateurs', async () => {
    render(
      <AuthContext.Provider value={{ user: { role: 'admin' } }}>
        <MemoryRouter>
          <Hotels />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      const adminButton = screen.getByRole('button', { name: /Gérer les hôtels/i });
      expect(adminButton).toBeInTheDocument();
    });
  });

  it('n\'affiche pas le bouton de gestion des hôtels pour les utilisateurs non-admin', async () => {
    render(
      <AuthContext.Provider value={{ user: { role: 'user' } }}>
        <MemoryRouter>
          <Hotels />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Gérer les hôtels/i })).not.toBeInTheDocument();
    });
  });

  it('redirige vers la page de connexion si un utilisateur non connecté tente de réserver', async () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <MemoryRouter>
          <Hotels />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Grand Hôtel Paris')).toBeInTheDocument();
    });

    // Cliquer sur le bouton "Réserver" du premier hôtel
    const bookButtons = screen.getAllByRole('button', { name: /Réserver/i });
    fireEvent.click(bookButtons[0]);

    // Vérifier que la navigation a été appelée avec le bon chemin
    expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { from: '/hotels/1' } });
  });

  it('redirige vers la page de création de réservation pour un utilisateur connecté', async () => {
    render(
      <AuthContext.Provider value={{ user: { _id: 'user1', role: 'user' } }}>
        <MemoryRouter>
          <Hotels />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Grand Hôtel Paris')).toBeInTheDocument();
    });

    // Cliquer sur le bouton "Réserver" du premier hôtel
    const bookButtons = screen.getAllByRole('button', { name: /Réserver/i });
    fireEvent.click(bookButtons[0]);

    // Vérifier que la navigation a été appelée avec le bon chemin
    expect(mockNavigate).toHaveBeenCalledWith('/bookings/create/1');
  });

  it('gère la pagination correctement', async () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <MemoryRouter>
          <Hotels />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Attendre que les hôtels soient chargés
    await waitFor(() => {
      expect(screen.getByText('Grand Hôtel Paris')).toBeInTheDocument();
    });

    // Vérifier que les boutons de pagination sont présents
    expect(screen.getByText(/Page 1 sur/i)).toBeInTheDocument();
    
    // Cliquer sur le bouton "Suivant"
    const nextButton = screen.getByRole('button', { name: /Suivant/i });
    fireEvent.click(nextButton);

    // Vérifier que l'API a été appelée avec la nouvelle page
    expect(hotelApi.getAllHotels).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      sort: 'createdAt',
      order: 'desc'
    });
  });
});
