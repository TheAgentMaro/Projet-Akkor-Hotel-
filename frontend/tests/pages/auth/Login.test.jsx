import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../../../src/pages/auth/Login';
import axios from 'axios';

vi.mock('axios');

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('connecte l’utilisateur avec des identifiants corrects', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          email: 'test@example.com',
          pseudo: 'userTest',
          role: 'user',
        },
        token: 'FAKE_TOKEN_123',
      },
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      const successMsg = screen.getByTestId('success-message');
      expect(successMsg).toHaveTextContent('Connexion réussie !');
    });

    expect(localStorage.getItem('token')).toBe('FAKE_TOKEN_123');
    // Modification ici : URL attendue ajustée pour correspondre à "/auth/login"
    expect(axios.post).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'test@example.com', password: 'password123' }
    );
  });

  it('affiche un message d’erreur avec des identifiants invalides', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          error: 'Email ou mot de passe incorrect',
        },
      },
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      const errorMsg = screen.getByTestId('error-message');
      expect(errorMsg).toHaveTextContent('Email ou mot de passe incorrect');
    });

    expect(localStorage.getItem('token')).toBeNull();
  });
});
