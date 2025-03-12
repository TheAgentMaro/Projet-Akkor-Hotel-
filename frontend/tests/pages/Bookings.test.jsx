import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Bookings from '../../src/pages/Bookings';
import { bookingApi } from '../../src/services/api';
import AuthContext from '../../src/context/AuthContext';

// Mock des services API
vi.mock('../../src/services/api', () => ({
  bookingApi: {
    getUserBookings: vi.fn(),
    deleteBooking: vi.fn()
  }
}));

// Mock de useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

describe('Bookings Page', () => {
  // Données de test pour les réservations
  const mockBookings = [
    {
      _id: '1',
      hotel: { name: 'Hotel Test' },
      checkIn: new Date().toISOString(),
      checkOut: new Date().toISOString(),
      status: 'confirmed',
      totalPrice: 150
    },
    {
      _id: '2',
      hotel: { name: 'Hotel Luxe' },
      checkIn: new Date().toISOString(),
      checkOut: new Date().toISOString(),
      status: 'pending',
      totalPrice: 250
    }
  ];

  // Contextes d'authentification pour différents rôles
  const mockUserContext = {
    user: { _id: 'user123', role: 'user', pseudo: 'TestUser' }
  };

  const mockAdminContext = {
    user: { _id: 'admin123', role: 'admin', pseudo: 'AdminUser' }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Configuration par défaut des mocks pour les tests
    bookingApi.getUserBookings.mockResolvedValue({
      success: true,
      data: mockBookings
    });

    bookingApi.deleteBooking.mockResolvedValue({
      success: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('affiche un indicateur de chargement puis la liste des réservations', async () => {
    render(
      <AuthContext.Provider value={mockUserContext}>
        <MemoryRouter>
          <Bookings />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Vérifier que l'indicateur de chargement est affiché
    const loadingSpinner = screen.getByTestId('loading-spinner');
    expect(loadingSpinner).toBeInTheDocument();

    // Attendre que les réservations soient affichées
    await waitFor(() => {
      expect(screen.getByText('Mes Réservations')).toBeInTheDocument();
    });

    // Vérifier que l'API a été appelée
    expect(bookingApi.getUserBookings).toHaveBeenCalled();

    // Vérifier que les réservations sont affichées
    expect(screen.getByText('Hotel Test')).toBeInTheDocument();
    expect(screen.getByText('Hotel Luxe')).toBeInTheDocument();
  });

  it('affiche un titre différent pour un administrateur', async () => {
    render(
      <AuthContext.Provider value={mockAdminContext}>
        <MemoryRouter>
          <Bookings />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Attendre que les réservations soient chargées
    await waitFor(() => {
      expect(bookingApi.getUserBookings).toHaveBeenCalled();
      expect(screen.getByText('Toutes les Réservations')).toBeInTheDocument();
    });
  });

  it('affiche un message lorsque aucune réservation n\'est trouvée', async () => {
    // Simuler une réponse vide
    bookingApi.getUserBookings.mockResolvedValueOnce({
      success: true,
      data: []
    });

    render(
      <AuthContext.Provider value={mockUserContext}>
        <MemoryRouter>
          <Bookings />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Attendre que le message soit affiché
    await waitFor(() => {
      expect(screen.getByText(/Aucune réservation trouvée/i)).toBeInTheDocument();
    });

    // Vérifier que le lien pour réserver est présent
    expect(screen.getByText(/Réserver maintenant/i)).toBeInTheDocument();
  });

  it('affiche un message d\'erreur en cas d\'échec de l\'API', async () => {
    // Simuler une erreur API avec un message personnalisé
    const errorMessage = 'Erreur lors du chargement des réservations';
    bookingApi.getUserBookings.mockRejectedValueOnce({
      response: { data: { message: errorMessage } }
    });

    render(
      <AuthContext.Provider value={mockUserContext}>
        <MemoryRouter>
          <Bookings />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Attendre que le spinner de chargement disparaisse et que l'erreur apparaisse
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Vérifier que le message d'erreur est affiché (texte exact)
    const errorElements = screen.getAllByText(errorMessage);
    expect(errorElements.length).toBeGreaterThan(0);

    // Vérifier que le bouton pour réessayer est présent
    const retryButton = screen.getByRole('button');
    expect(retryButton).toBeInTheDocument();
  });

  it('permet d\'annuler une réservation avec double confirmation', async () => {
    render(
      <AuthContext.Provider value={mockUserContext}>
        <MemoryRouter>
          <Bookings />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Attendre que les réservations soient chargées
    await waitFor(() => {
      expect(screen.getByText('Hotel Test')).toBeInTheDocument();
    });

    // Simuler isDeleting à false initialement
    const cancelButtons = screen.getAllByText('Annuler');
    expect(cancelButtons.length).toBeGreaterThan(0);
    fireEvent.click(cancelButtons[0]);

    // Attendre que le bouton change de texte pour confirmer l'annulation
    await waitFor(() => {
      const confirmButtons = screen.getAllByText(/Confirmer l'annulation/i);
      expect(confirmButtons.length).toBeGreaterThan(0);
      // Cliquer sur le premier bouton de confirmation
      fireEvent.click(confirmButtons[0]);
    });

    // Vérifier que l'API a été appelée avec l'ID correct
    expect(bookingApi.deleteBooking).toHaveBeenCalledWith('1');
  });

  it('affiche correctement les statuts des réservations avec les bonnes couleurs', async () => {
    render(
      <AuthContext.Provider value={mockUserContext}>
        <MemoryRouter>
          <Bookings />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Attendre que les réservations soient chargées
    await waitFor(() => {
      expect(screen.getByText('Hotel Test')).toBeInTheDocument();
    });

    // Vérifier que les statuts sont affichés avec les bonnes classes
    await waitFor(() => {
      const statusElements = screen.getAllByText(/(confirmed|pending)/i);
      expect(statusElements.length).toBeGreaterThan(0);
      
      // Vérifier au moins un statut avec la classe appropriée
      const confirmedElement = statusElements.find(el => el.textContent.includes('confirmed'));
      const pendingElement = statusElements.find(el => el.textContent.includes('pending'));
      
      if (confirmedElement) {
        expect(confirmedElement.className).toContain('text-green-600');
      }
      
      if (pendingElement) {
        expect(pendingElement.className).toContain('text-yellow-600');
      }
    });
  });

  it('n\'affiche pas le bouton d\'annulation pour les réservations déjà annulées', async () => {
    // Modifier une réservation pour qu'elle soit annulée
    const cancelledBookings = [
      {
        _id: '3',
        hotel: { name: 'Hotel Cancelled' },
        checkIn: new Date().toISOString(),
        checkOut: new Date().toISOString(),
        status: 'cancelled',
        totalPrice: 100
      }
    ];

    bookingApi.getUserBookings.mockResolvedValueOnce({
      success: true,
      data: cancelledBookings
    });

    render(
      <AuthContext.Provider value={mockUserContext}>
        <MemoryRouter>
          <Bookings />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Attendre que les réservations soient chargées
    await waitFor(() => {
      expect(screen.getByText('Hotel Cancelled')).toBeInTheDocument();
    });

    // Vérifier que le bouton d'annulation n'est pas présent
    expect(screen.queryByText(/Annuler/i)).not.toBeInTheDocument();
  });
});