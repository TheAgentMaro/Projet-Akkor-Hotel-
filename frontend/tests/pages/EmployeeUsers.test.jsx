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
    searchUsers: vi.fn(),
    getUserBookings: vi.fn()
  },
  bookingApi: {
    getBookingDetails: vi.fn()
  }
}));

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('EmployeeUsers Component', () => {
  const mockUsers = [
    { id: '1', email: 'user1@test.com', pseudo: 'User1', role: 'user' },
    { id: '2', email: 'user2@test.com', pseudo: 'User2', role: 'user' }
  ];

  const mockBookings = [
    { id: '1', hotelId: '1', userId: '1', status: 'confirmed', startDate: '2025-04-01', endDate: '2025-04-05' }
  ];

  const mockAuthContext = {
    user: { id: 'emp1', email: 'employee@test.com', role: 'employee' },
    hasRole: (role) => role === 'employee',
    roleBadgeColor: 'bg-blue-100 text-blue-800',
    roleLabel: 'Employé'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    userApi.searchUsers.mockResolvedValue({ success: true, data: mockUsers });
    userApi.getUserBookings.mockResolvedValue({ success: true, data: mockBookings });
    bookingApi.getBookingDetails.mockResolvedValue({ success: true, data: { hotel: { name: 'Test Hotel' } } });
  });

  it('affiche le formulaire de recherche', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <EmployeeUsers />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByPlaceholderText(/Rechercher par email, pseudo ou id/i)).toBeInTheDocument();
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
    fireEvent.change(screen.getByPlaceholderText(/Rechercher par email, pseudo ou id/i), {
      target: { value: 'user' }
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /Rechercher/i }));

    await waitFor(() => {
      expect(userApi.searchUsers).toHaveBeenCalledWith('user');
    });

    // Vérifier que les résultats sont affichés
    expect(screen.getByText('User1')).toBeInTheDocument();
    expect(screen.getByText('User2')).toBeInTheDocument();
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
    fireEvent.change(screen.getByPlaceholderText(/Rechercher par email, pseudo ou id/i), {
      target: { value: 'nonexistent' }
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /Rechercher/i }));

    await waitFor(() => {
      expect(userApi.searchUsers).toHaveBeenCalledWith('nonexistent');
    });

    // Vérifier que le message d'erreur est affiché
    expect(screen.getByText(/Aucun utilisateur trouvé pour "nonexistent"/i)).toBeInTheDocument();
  });

  it('affiche les détails d\'un utilisateur et ses réservations lors de la sélection', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <EmployeeUsers />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Remplir le champ de recherche et soumettre
    fireEvent.change(screen.getByPlaceholderText(/Rechercher par email, pseudo ou id/i), {
      target: { value: 'user' }
    });
    fireEvent.click(screen.getByRole('button', { name: /Rechercher/i }));

    await waitFor(() => {
      expect(screen.getByText('User1')).toBeInTheDocument();
    });

    // Cliquer sur un utilisateur pour voir ses détails
    fireEvent.click(screen.getByText('User1'));

    await waitFor(() => {
      expect(userApi.getUserBookings).toHaveBeenCalledWith('1');
    });

    // Vérifier que les détails de l'utilisateur et ses réservations sont affichés
    expect(screen.getByText('user1@test.com')).toBeInTheDocument();
    expect(screen.getByText(/Réservations de l'utilisateur/i)).toBeInTheDocument();
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
    fireEvent.change(screen.getByPlaceholderText(/Rechercher par email, pseudo ou id/i), {
      target: { value: 'user' }
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /Rechercher/i }));

    await waitFor(() => {
      expect(screen.getByText(/Erreur lors de la recherche des utilisateurs/i)).toBeInTheDocument();
    });
  });
});
