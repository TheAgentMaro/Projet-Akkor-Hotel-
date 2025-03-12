import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../../../src/pages/auth/Register';
import AuthContext from '../../../src/context/AuthContext';
import axios from 'axios';

vi.mock('axios');

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Import de l'API avant le mock
import { authApi } from '../../../src/services/api';

// Mock de l'API d'authentification
vi.mock('../../../src/services/api', () => ({
  authApi: {
    register: vi.fn(),
    login: vi.fn()
  }
}));

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('inscrit un nouvel utilisateur avec succès', async () => {
    // Mock des réponses de l'API
    authApi.register.mockResolvedValueOnce({
      success: true,
      data: {
        email: 'newuser@example.com',
        pseudo: 'newUser',
        role: 'user'
      },
      token: 'FAKE_REGISTER_TOKEN',
    });
    
    authApi.login.mockResolvedValueOnce({
      success: true,
      data: {
        email: 'newuser@example.com',
        pseudo: 'newUser',
        role: 'user'
      },
      token: 'FAKE_REGISTER_TOKEN',
    });

    // Mock du contexte d'authentification
    const mockAuthContext = {
      user: null,
      login: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn(),
      isAuthenticated: false
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </AuthContext.Provider>
    );

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
    
    expect(authApi.register).toHaveBeenCalledWith('newuser@example.com', 'newUser', 'password123');
    expect(authApi.login).toHaveBeenCalledWith('newuser@example.com', 'password123');
    expect(mockAuthContext.login).toHaveBeenCalled();
  });

  it('affiche une erreur si l\'email est déjà utilisé', async () => {
    // Mock de l'erreur d'API
    const errorMessage = 'Cet email est déjà utilisé';
    authApi.register.mockRejectedValueOnce({
      response: {
        data: {
          error: errorMessage
        }
      }
    });

    // Mock du contexte d'authentification
    const mockAuthContext = {
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </AuthContext.Provider>
    );

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
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    
    expect(authApi.register).toHaveBeenCalledWith('existing@test.com', 'existingUser', 'password123');
    expect(authApi.login).not.toHaveBeenCalled();
    expect(mockAuthContext.login).not.toHaveBeenCalled();
  });

  it('affiche des messages d\'erreur de validation pour les champs requis', async () => {
    // Mock du contexte d'authentification
    const mockAuthContext = {
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Créer un compte/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email requis/i)).toBeInTheDocument();
      expect(screen.getByText(/Pseudo requis/i)).toBeInTheDocument();
      expect(screen.getByText(/Mot de passe requis/i)).toBeInTheDocument();
    });
  });

  it('affiche un message d\'erreur pour un format d\'email invalide', async () => {
    // Mock du contexte d'authentification
    const mockAuthContext = {
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </AuthContext.Provider>
    );

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
    // Mock du contexte d'authentification
    const mockAuthContext = {
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </AuthContext.Provider>
    );

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