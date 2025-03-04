import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Register from '../../../src/pages/auth/Register';
import axios from 'axios';

// On mock axios
vi.mock('axios');

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('registers a new user successfully', async () => {
    // Simule la réponse de axios.post(/auth/register)
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          email: 'newuser@example.com',
          pseudo: 'newUser',
        },
        token: 'FAKE_REGISTER_TOKEN',
      },
    });

    render(<Register />);

    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'newuser@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Pseudo'), {
      target: { value: 'newUser' },
    });
    fireEvent.change(screen.getByLabelText('Mot de passe'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Créer un compte/i }));

    // Vérifier le message de succès
    const successMsg = await screen.findByText('Inscription réussie, bienvenue !');
    expect(successMsg).toBeInTheDocument();

    // Vérifier le token
    expect(localStorage.getItem('token')).toBe('FAKE_REGISTER_TOKEN');
  });

  it('shows an error if email is already used', async () => {
    // Simule un conflit (409)
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          error: 'Cet email est déjà utilisé',
        },
      },
    });

    render(<Register />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'existing@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Pseudo'), {
      target: { value: 'existingUser' },
    });
    fireEvent.change(screen.getByLabelText('Mot de passe'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Créer un compte/i }));

    const errorMsg = await screen.findByText('Cet email est déjà utilisé');
    expect(errorMsg).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
