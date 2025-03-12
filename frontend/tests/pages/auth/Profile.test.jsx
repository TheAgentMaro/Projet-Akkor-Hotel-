import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Profile from '../../../src/pages/auth/Profile';
import AuthContext from '../../../src/context/AuthContext';
import userEvent from '@testing-library/user-event';

// On simule correctement le module userApi
vi.mock('../../../src/services/api', () => ({
  userApi: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    deleteAccount: vi.fn(),
  },
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

import { userApi } from '../../../src/services/api';

describe('Profile Page', () => {
  it('charge et affiche le profil de l’utilisateur', async () => {
    userApi.getProfile.mockResolvedValueOnce({
      success: true,
      data: { id: 'USER_ID_123', email: 'old@test.com', pseudo: 'OldPseudo' },
    });

    const mockLogout = vi.fn();
    
    render(
      <AuthContext.Provider value={{ 
        user: { id: 'USER_ID_123', email: 'old@test.com', pseudo: 'OldPseudo', role: 'user' },
        logout: mockLogout
      }}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(await screen.findByDisplayValue(/old@test.com/i)).toBeInTheDocument();
    expect(await screen.findByDisplayValue(/OldPseudo/i)).toBeInTheDocument();
  });

  it('met à jour le profil de l\'utilisateur', async () => {
    // Simule la récupération du profil initial
    userApi.getProfile.mockResolvedValueOnce({
      success: true,
      data: { id: 'USER_ID_123', email: 'old@test.com', pseudo: 'OldPseudo' },
    });
    
    // Simule la réponse de la mise à jour
    userApi.updateProfile.mockResolvedValueOnce({
      success: true,
      data: { id: 'USER_ID_123', email: 'updated@test.com', pseudo: 'UpdatedPseudo' },
    });

    // Création d'un mock pour le contexte d'authentification
    const mockUser = { id: 'USER_ID_123', email: 'old@test.com', pseudo: 'OldPseudo', role: 'user' };
    const mockLogout = vi.fn();
    
    render(
      <AuthContext.Provider value={{ 
        user: mockUser,
        logout: mockLogout
      }}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Attendre que le profil initial soit chargé
    await waitFor(() => {
      expect(screen.getByDisplayValue('old@test.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('OldPseudo')).toBeInTheDocument();
    });

    // Modifier les valeurs
    const emailInput = screen.getByLabelText(/Email/i);
    const pseudoInput = screen.getByLabelText(/Pseudo/i);
    const passwordInput = screen.getByLabelText(/Mot de passe actuel/i);

    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'updated@test.com');
    
    await userEvent.clear(pseudoInput);
    await userEvent.type(pseudoInput, 'UpdatedPseudo');
    
    await userEvent.type(passwordInput, 'password123');

    // Soumettre le formulaire via le clic sur le bouton
    await userEvent.click(screen.getByRole('button', { name: /Mettre à jour/i }));

    // Vérifier que updateProfile est appelé avec les bonnes données
    await waitFor(() => {
      expect(userApi.updateProfile).toHaveBeenCalledWith({
        email: 'updated@test.com',
        pseudo: 'UpdatedPseudo',
        currentPassword: 'password123',
        newPassword: undefined
      });
    });
    
    // Vérifier que le message de succès s'affiche
    await waitFor(() => {
      expect(screen.getByText('Profil mis à jour avec succès !')).toBeInTheDocument();
    });
  });

  it('supprime le compte utilisateur', async () => {
    userApi.getProfile.mockResolvedValueOnce({
      success: true,
      data: { id: 'USER_ID_123', email: 'user@test.com', pseudo: 'UserPseudo' },
    });
    userApi.deleteAccount.mockResolvedValueOnce({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });

    const mockLogout = vi.fn();
    
    render(
      <AuthContext.Provider value={{ 
        user: { id: 'USER_ID_123', email: 'old@test.com', pseudo: 'OldPseudo', role: 'user' },
        logout: mockLogout
      }}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Cliquer sur le bouton de suppression pour passer en mode confirmation
    const deleteButton = await screen.findByRole('button', { name: /Supprimer mon compte/i });
    fireEvent.click(deleteButton);

    // Maintenant cliquer sur le bouton de confirmation
    const confirmButton = screen.getByRole('button', { name: /Confirmer la suppression/i });
    fireEvent.click(confirmButton);

    // Vérifier que la fonction de suppression a été appelée
    await waitFor(() => {
      expect(userApi.deleteAccount).toHaveBeenCalled();
    });

    // Vérifier que la fonction de déconnexion a été appelée
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });

    // Vérifier la redirection
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
