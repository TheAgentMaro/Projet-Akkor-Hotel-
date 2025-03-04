import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Profile from '../../../src/pages/auth/Profile';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';

// On mock axios
vi.mock('axios');

describe('Profile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('loads the user profile on mount', async () => {
    // Simule GET /users/profile
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          _id: 'USER_ID_123',
          email: 'mockuser@test.com',
          pseudo: 'MockUser',
        },
      },
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // "Mon Profil" doit apparaître
    expect(await screen.findByText('Mon Profil')).toBeInTheDocument();

    // Le champ email doit être prérempli
    const emailInput = screen.getByLabelText('Email');
    expect(emailInput.value).toBe('mockuser@test.com');
  });

  it('updates the user profile', async () => {
    // 1) GET /users/profile
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          _id: 'USER_ID_123',
          email: 'old@test.com',
          pseudo: 'OldPseudo',
        },
      },
    });

    // 2) PUT /users/USER_ID_123
    axios.put.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          _id: 'USER_ID_123',
          email: 'updated@test.com',
          pseudo: 'UpdatedPseudo',
        },
      },
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Modifier le pseudo
    const pseudoInput = await screen.findByLabelText('Pseudo');
    fireEvent.change(pseudoInput, { target: { value: 'UpdatedPseudo' } });

    // Soumettre
    const updateBtn = screen.getByRole('button', { name: /Mettre à jour/i });
    fireEvent.click(updateBtn);

    // On attend le message de succès
    const successMsg = await screen.findByText('Profil mis à jour avec succès !');
    expect(successMsg).toBeInTheDocument();
  });

  it('deletes the user account', async () => {
    // 1) GET /users/profile
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          _id: 'USER_ID_123',
          email: 'user@test.com',
          pseudo: 'UserPseudo',
        },
      },
    });

    // 2) DELETE /users/USER_ID_123
    axios.delete.mockResolvedValueOnce({
      data: { success: true, message: 'Utilisateur supprimé avec succès' },
    });

    // On simule confirm
    window.confirm = vi.fn(() => true);

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Cliquer sur "Supprimer mon compte"
    const deleteButton = await screen.findByRole('button', { name: /supprimer mon compte/i });
    fireEvent.click(deleteButton);

    // Vérifier que l'appel a eu lieu
    expect(axios.delete).toHaveBeenCalledWith(
      'http://localhost:3000/api/users/USER_ID_123'
    );
    // Vérifier que localStorage est vidé (ou autre, selon votre code)
    expect(localStorage.getItem('token')).toBeNull();
  });
});
