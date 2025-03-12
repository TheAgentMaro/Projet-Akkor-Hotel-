import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminUsers from '../../src/pages/AdminUsers';
import AuthContext from '../../src/context/AuthContext';
import { userApi, bookingApi } from '../../src/services/api';

// Mock des API
vi.mock('../../src/services/api', () => ({
  userApi: {
    getAllUsers: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn()
  },
  bookingApi: {
    getUserBookings: vi.fn(),
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

describe('AdminUsers Component', () => {
  const mockUsers = [
    { id: '1', email: 'admin@test.com', pseudo: 'AdminUser', role: 'admin' },
    { id: '2', email: 'employee@test.com', pseudo: 'EmployeeUser', role: 'employee' },
    { id: '3', email: 'user@test.com', pseudo: 'RegularUser', role: 'user' }
  ];

  const mockBookings = [
    { 
      id: '1', 
      hotelId: '1', 
      userId: '3', 
      status: 'confirmed', 
      checkIn: '2025-04-01', 
      checkOut: '2025-04-05',
      hotel: { name: 'Hôtel Test' }
    }
  ];

  const mockAuthContext = {
    user: { id: 'admin1', email: 'admin@test.com', role: 'admin' },
    hasRole: (role) => role === 'admin',
    roleBadgeColor: 'bg-red-100 text-red-800',
    roleLabel: 'Administrateur'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    userApi.getAllUsers.mockResolvedValue({ success: true, data: mockUsers });
    bookingApi.getUserBookings.mockResolvedValue({ success: true, data: mockBookings });
    bookingApi.getBookingDetails.mockResolvedValue({ success: true, data: { hotel: { name: 'Test Hotel' } } });
  });

  it('redirige si l\'utilisateur n\'est pas admin', async () => {
    const nonAdminContext = {
      ...mockAuthContext,
      hasRole: () => false
    };

    render(
      <AuthContext.Provider value={nonAdminContext}>
        <MemoryRouter>
          <AdminUsers />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('affiche la liste des utilisateurs', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <AdminUsers />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(userApi.getAllUsers).toHaveBeenCalled();
    });

    expect(screen.getByText('AdminUser')).toBeInTheDocument();
    expect(screen.getByText('EmployeeUser')).toBeInTheDocument();
    expect(screen.getByText('RegularUser')).toBeInTheDocument();
  });

  it('affiche les détails d\'un utilisateur lors de la sélection', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <AdminUsers />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('RegularUser')).toBeInTheDocument();
    });

    // Cliquer sur un utilisateur pour voir ses détails
    fireEvent.click(screen.getByText('RegularUser'));

    await waitFor(() => {
      expect(bookingApi.getUserBookings).toHaveBeenCalledWith('3');
    });

    // Vérifier que les détails de l'utilisateur sont affichés
    expect(screen.getByText('user@test.com')).toBeInTheDocument();
    expect(screen.getByText('Utilisateur')).toBeInTheDocument();
  });

  it('permet de modifier un utilisateur', async () => {
    userApi.updateUser.mockResolvedValue({ success: true });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <AdminUsers />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('RegularUser')).toBeInTheDocument();
    });

    // Sélectionner un utilisateur
    fireEvent.click(screen.getByText('RegularUser'));

    await waitFor(() => {
      expect(bookingApi.getUserBookings).toHaveBeenCalled();
    });

    // Cliquer sur le bouton d'édition
    const editButtons = screen.getAllByText(/Modifier/i);
    fireEvent.click(editButtons[0]);

    // Attendre que le formulaire d'édition soit affiché
    await waitFor(() => {
      expect(screen.getByText(/Nouveau mot de passe/i)).toBeInTheDocument();
    });

    // Modifier le rôle en utilisant le sélecteur
    const roleSelect = screen.getByRole('combobox', { name: /Rôle/i });
    fireEvent.change(roleSelect, { target: { value: 'employee' } });

    // Enregistrer les modifications
    const saveButton = screen.getByText(/Enregistrer/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(userApi.updateUser).toHaveBeenCalledWith('3', expect.objectContaining({
        role: 'employee'
      }));
    });
  });

  it('permet de supprimer un utilisateur après confirmation', async () => {
    userApi.deleteUser.mockResolvedValue({ success: true });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <AdminUsers />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('RegularUser')).toBeInTheDocument();
    });

    // Sélectionner un utilisateur
    fireEvent.click(screen.getByText('RegularUser'));

    await waitFor(() => {
      expect(bookingApi.getUserBookings).toHaveBeenCalled();
    });

    // Cliquer sur le bouton de suppression
    const deleteButton = screen.getByText(/Supprimer/i);
    fireEvent.click(deleteButton);

    // Confirmer la suppression dans la boîte de dialogue
    const confirmDeleteButton = screen.getByText('Supprimer', { selector: 'button.bg-red-500' });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(userApi.deleteUser).toHaveBeenCalledWith('3');
    });
  });
});
