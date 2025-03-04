import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from '../../../src/pages/auth/Profile';
import { MemoryRouter, useNavigate } from 'react-router-dom';

// On va simuler navigate() pour vérifier la redirection
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('Profile Page', () => {
  const mockNavigate = vi.fn();
  beforeEach(() => {
    // Réinitialiser navigate
    mockNavigate.mockClear();
    useNavigate.mockReturnValue(mockNavigate);

    // Nettoyage localStorage avant chaque test
    localStorage.clear();
  });

  it('renders the profile form fields', async () => {
    // On mock la route GET /users/profile => un user existant
    // On va juste stubber globalement via MSW habituellement, 
    // mais ici on se contente d'un test basique.
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Vérifier la présence des champs
    expect(await screen.findByText('Mon Profil')).toBeInTheDocument();
    expect(await screen.findByLabelText('Email')).toBeInTheDocument();
    expect(await screen.findByLabelText('Pseudo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mettre à jour/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Supprimer mon compte/i })).toBeInTheDocument();
  });

  it('handles delete account flow', async () => {
    // On simule la confirmation
    vi.spyOn(window, 'confirm').mockReturnValueOnce(true);

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Cliquer le bouton "Supprimer mon compte"
    const deleteBtn = screen.getByRole('button', { name: /Supprimer mon compte/i });
    fireEvent.click(deleteBtn);

    // Normalement, on devrait avoir un appel d'API (DELETE),
    // puis vider le localStorage, puis navigate('/login').
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
