import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../../../src/pages/auth/Register';
import axios from 'axios';

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
      expect(screen.getByText(/Inscription réussie, bienvenue !/i)).toBeInTheDocument();
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
});
