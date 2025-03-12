import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import EmployeeUsers from '../../src/pages/EmployeeUsers';
import AuthContext from '../../src/context/AuthContext';
import { userApi, bookingApi } from '../../src/services/api';

// Mock des API
vi.mock('../../src/services/api', () => ({
  userApi: {
    searchUsers: vi.fn()
  },
  bookingApi: {
    getUserBookings: vi.fn()
  }
}));

describe('EmployeeUsers Component', () => {
  const mockUsers = [
    { _id: '1', email: 'user1@test.com', pseudo: 'User1', role: 'user', createdAt: '2023-01-01T00:00:00.000Z' },
    { _id: '2', email: 'user2@test.com', pseudo: 'User2', role: 'user', createdAt: '2023-01-02T00:00:00.000Z' }
  ];

  const mockBookings = [
    { 
      _id: 'booking1', 
      hotelId: 'hotel1', 
      userId: '1', 
      status: 'confirmed', 
      checkIn: '2025-04-01T00:00:00.000Z', 
      checkOut: '2025-04-05T00:00:00.000Z', 
      totalPrice: 500,
      hotel: { name: 'Test Hotel', location: 'Paris' } 
    }
  ];

  const mockAuthContext = {
    user: { _id: 'emp1', email: 'employee@test.com', role: 'employee' },
    isAuthenticated: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    userApi.searchUsers.mockResolvedValue({ success: true, data: mockUsers });
    bookingApi.getUserBookings.mockResolvedValue({ success: true, data: mockBookings });
  });

  it('affiche le formulaire de recherche', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <EmployeeUsers />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByPlaceholderText(/Rechercher par nom d'utilisateur \(pseudo\) ou email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rechercher/i })).toBeInTheDocument();
  });

  it('affiche un message d\'erreur si la recherche est vide', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <EmployeeUsers />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Soumettre le formulaire avec une recherche vide
    fireEvent.click(screen.getByRole('button', { name: /Rechercher/i }));

    // Vérifier que le message d'erreur est affiché
    expect(screen.getByText(/Veuillez saisir un terme de recherche/i)).toBeInTheDocument();
    expect(userApi.searchUsers).not.toHaveBeenCalled();
  });

  it('effectue une recherche et affiche les résultats', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <EmployeeUsers />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Remplir le champ de recherche
    fireEvent.change(screen.getByPlaceholderText(/Rechercher par nom d'utilisateur \(pseudo\) ou email/i), {
      target: { value: 'user' }
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /Rechercher/i }));

    await waitFor(() => {
      expect(userApi.searchUsers).toHaveBeenCalledWith('user');
    });

    // Vérifier que les résultats sont affichés
    await waitFor(() => {
      expect(screen.getByText('User1')).toBeInTheDocument();
      expect(screen.getByText('User2')).toBeInTheDocument();
    });
  });

  it('affiche un message si aucun résultat n\'est trouvé', async () => {
    userApi.searchUsers.mockResolvedValueOnce({ success: true, data: [] });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <EmployeeUsers />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Remplir le champ de recherche
    fireEvent.change(screen.getByPlaceholderText(/Rechercher par nom d'utilisateur \(pseudo\) ou email/i), {
      target: { value: 'nonexistent' }
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /Rechercher/i }));

    await waitFor(() => {
      expect(userApi.searchUsers).toHaveBeenCalledWith('nonexistent');
    });

    // Vérifier que le message d'erreur est affiché
    await waitFor(() => {
      expect(screen.getByText(/Aucun utilisateur trouvé pour "nonexistent"/i)).toBeInTheDocument();
    });
  });

  it('gère les erreurs lors de la recherche', async () => {
    userApi.searchUsers.mockRejectedValueOnce(new Error('Erreur API'));

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <EmployeeUsers />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Remplir le champ de recherche
    fireEvent.change(screen.getByPlaceholderText(/Rechercher par nom d'utilisateur \(pseudo\) ou email/i), {
      target: { value: 'user' }
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /Rechercher/i }));

    await waitFor(() => {
      expect(screen.getByText(/Erreur lors de la recherche des utilisateurs/i)).toBeInTheDocument();
    });
  });

  it('affiche un message si aucune réservation n\'est trouvée pour l\'utilisateur sélectionné', async () => {
    // Configurer le mock pour retourner un tableau vide de réservations
    bookingApi.getUserBookings.mockResolvedValueOnce({ success: true, data: [] });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <EmployeeUsers />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Remplir le champ de recherche et soumettre
    fireEvent.change(screen.getByPlaceholderText(/Rechercher par nom d'utilisateur \(pseudo\) ou email/i), {
      target: { value: 'user' }
    });
    fireEvent.click(screen.getByRole('button', { name: /Rechercher/i }));

    // Attendre que les résultats de recherche s'affichent
    await waitFor(() => {
      expect(screen.getByText('User1')).toBeInTheDocument();
    });

    // Cliquer sur un utilisateur pour voir ses détails
    fireEvent.click(screen.getByText('User1'));

    // Vérifier que l'API a été appelée avec l'ID correct
    await waitFor(() => {
      expect(bookingApi.getUserBookings).toHaveBeenCalledWith('1');
    });

    // Vérifier que le message d'absence de réservations est affiché
    await waitFor(() => {
      expect(screen.getByText(/Aucune réservation trouvée pour User1/i)).toBeInTheDocument();
    });
  });

  it('gère les erreurs lors du chargement des réservations', async () => {
    // Configurer le mock pour simuler une erreur lors du chargement des réservations
    bookingApi.getUserBookings.mockRejectedValueOnce(new Error('Erreur API'));

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <EmployeeUsers />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Remplir le champ de recherche et soumettre
    fireEvent.change(screen.getByPlaceholderText(/Rechercher par nom d'utilisateur \(pseudo\) ou email/i), {
      target: { value: 'user' }
    });
    fireEvent.click(screen.getByRole('button', { name: /Rechercher/i }));

    // Attendre que les résultats de recherche s'affichent
    await waitFor(() => {
      expect(screen.getByText('User1')).toBeInTheDocument();
    });

    // Cliquer sur un utilisateur pour voir ses détails
    fireEvent.click(screen.getByText('User1'));

    // Vérifier que l'API a été appelée avec l'ID correct
    await waitFor(() => {
      expect(bookingApi.getUserBookings).toHaveBeenCalledWith('1');
    });

    // Vérifier que le message d'erreur est affiché
    await waitFor(() => {
      expect(screen.getByText(/Erreur lors du chargement des réservations/i)).toBeInTheDocument();
    });
  });
});
