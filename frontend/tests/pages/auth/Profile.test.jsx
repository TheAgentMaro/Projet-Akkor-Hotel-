import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Profile from '../../../src/pages/auth/Profile';

// On simule correctement le module userApi
vi.mock('../../../src/services/api', () => ({
  userApi: {
    getProfile: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

import { userApi } from '../../../src/services/api';

describe('Profile Page', () => {
  it('charge et affiche le profil de l’utilisateur', async () => {
    userApi.getProfile.mockResolvedValueOnce({
      success: true,
      data: { id: 'USER_ID_123', email: 'old@test.com', pseudo: 'OldPseudo' },
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(await screen.findByDisplayValue(/old@test.com/i)).toBeInTheDocument();
    expect(await screen.findByDisplayValue(/OldPseudo/i)).toBeInTheDocument();
  });

  it('met à jour le profil de l’utilisateur', async () => {
    // Simule la récupération du profil initial
    userApi.getProfile.mockResolvedValueOnce({
      success: true,
      data: { id: 'USER_ID_123', email: 'old@test.com', pseudo: 'OldPseudo' },
    });
    // Simule la réponse de la mise à jour
    userApi.updateUser.mockResolvedValueOnce({
      success: true,
      data: { id: 'USER_ID_123', email: 'updated@test.com', pseudo: 'UpdatedPseudo' },
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Attendre que le profil initial soit chargé
    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i).value).toBe('old@test.com');
    });

    // Modifier les valeurs
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'updated@test.com' } });
    fireEvent.change(screen.getByLabelText(/Pseudo/i), { target: { value: 'UpdatedPseudo' } });

    // Soumettre le formulaire via le clic sur le bouton
    fireEvent.click(screen.getByRole('button', { name: /Mettre à jour/i }));

    // Vérifier que updateUser est appelé avec le bon id et payload
    await waitFor(() => {
      expect(userApi.updateUser).toHaveBeenCalledWith('USER_ID_123', {
        email: 'updated@test.com',
        pseudo: 'UpdatedPseudo',
      });
    });
  });

  it('supprime le compte utilisateur', async () => {
    userApi.getProfile.mockResolvedValueOnce({
      success: true,
      data: { id: 'USER_ID_123', email: 'user@test.com', pseudo: 'UserPseudo' },
    });
    userApi.deleteUser.mockResolvedValueOnce({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });

    // Simule la confirmation de suppression
    window.confirm = vi.fn(() => true);

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    const deleteButton = await screen.findByRole('button', { name: /Supprimer mon compte/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(userApi.deleteUser).toHaveBeenCalledWith('USER_ID_123');
    });
  });
});
