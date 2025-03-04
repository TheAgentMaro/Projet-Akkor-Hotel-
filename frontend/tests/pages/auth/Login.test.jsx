import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../../../src/pages/auth/Login';
import axios from 'axios';

// On mock axios
vi.mock('axios');

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('successfully logs in with correct credentials', async () => {
    // Simule la réponse de axios.post(/auth/login) en cas de réussite
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          email: 'test@example.com',
          pseudo: 'userTest',
        },
        token: 'FAKE_TOKEN_123',
      },
    });

    render(<Login />);

    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Mot de passe'), {
      target: { value: 'password123' },
    });

    // Soumettre
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    // Attendre le message de succès
    const successMsg = await screen.findByText('Connexion réussie !');
    expect(successMsg).toBeInTheDocument();

    // Vérifier que le token est stocké
    expect(localStorage.getItem('token')).toBe('FAKE_TOKEN_123');

    // Vérifier qu'on a bien appelé axios.post avec les bons paramètres
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/login',
      { email: 'test@example.com', password: 'password123' }
    );
  });

  it('shows an error message with invalid credentials', async () => {
    // Simule un échec (401)
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          error: 'Email ou mot de passe incorrect',
        },
      },
    });

    render(<Login />);

    // Remplir le formulaire (mauvais MDP)
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Mot de passe'), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    // Attendre le message d'erreur
    const errorMsg = await screen.findByText('Email ou mot de passe incorrect');
    expect(errorMsg).toBeInTheDocument();

    // Vérifier que le token n’est pas stocké
    expect(localStorage.getItem('token')).toBeNull();
  });
});
