import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../../../src/pages/auth/Register';
import axios from 'axios';

vi.mock('axios');
vi.mock('axios');

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('inscrit un nouvel utilisateur avec succès', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          email: 'newuser@example.com',
          pseudo: 'newUser',
          role: 'user'
        },
        token: 'FAKE_REGISTER_TOKEN',
      },
    });

    render(<Register />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'newuser@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Pseudo/i), {
      target: { value: 'newUser' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Créer un compte/i }));

    await waitFor(() => {
      expect(screen.getByText(/Inscription réussie ! Connexion en cours.../i)).toBeInTheDocument();
    });

    expect(localStorage.getItem('token')).toBe('FAKE_REGISTER_TOKEN');
  });

  it('affiche une erreur si l\'email est déjà utilisé', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          error: 'Cet email est déjà utilisé',
        },
      },
    });

    render(<Register />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'existing@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/Pseudo/i), {
      target: { value: 'existingUser' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Créer un compte/i }));

    await waitFor(() => {
      expect(screen.getByText(/Cet email est déjà utilisé/i)).toBeInTheDocument();
    });

    expect(localStorage.getItem('token')).toBeNull();
  });

  it('affiche des messages d\'erreur de validation pour les champs requis', async () => {
    render(<Register />);

    fireEvent.click(screen.getByRole('button', { name: /Créer un compte/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email requis/i)).toBeInTheDocument();
      expect(screen.getByText(/Pseudo requis/i)).toBeInTheDocument();
      expect(screen.getByText(/Mot de passe requis/i)).toBeInTheDocument();
    });
  });

  it('affiche un message d\'erreur pour un format d\'email invalide', async () => {
    render(<Register />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByLabelText(/Pseudo/i), {
      target: { value: 'newUser' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Créer un compte/i }));

    await waitFor(() => {
      expect(screen.getByText(/Format email invalide/i)).toBeInTheDocument();
    });
  });

  it('affiche un message d\'erreur pour un mot de passe trop court', async () => {
    render(<Register />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'newuser@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Pseudo/i), {
      target: { value: 'newUser' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: '12345' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Créer un compte/i }));

    await waitFor(() => {
      expect(screen.getByText(/Minimum 6 caractères/i)).toBeInTheDocument();
    });
  });
});