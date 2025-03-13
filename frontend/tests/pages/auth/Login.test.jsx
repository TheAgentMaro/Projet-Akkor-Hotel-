import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, useNavigate, useLocation } from 'react-router-dom';
import Login from '../../../src/pages/auth/Login';
import { authApi } from '../../../src/services/api';
import AuthContext from '../../../src/context/AuthContext';

// Mock des dépendances
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn()
  };
});

vi.mock('../../../src/services/api', () => ({
  authApi: {
    login: vi.fn()
  }
}));

describe('Login Page', () => {
  const mockNavigate = vi.fn();
  const mockLogin = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue({ state: { from: { pathname: '/previous-page' } } });
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  const renderLoginWithContext = () => {
    return render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it('connecte l\'utilisateur avec des identifiants corrects', async () => {
    const userData = {
      email: 'test@example.com',
      pseudo: 'userTest',
      role: 'user',
    };
    
    authApi.login.mockResolvedValueOnce({
      data: userData,
      token: 'FAKE_TOKEN_123'
    });

    renderLoginWithContext();

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getAllByRole('button', { name: /Se connecter/i })[0]);

    await waitFor(() => {
      // Vérifier que le message de succès est affiché
      expect(screen.getByText('Connexion réussie !')).toBeInTheDocument();
    });

    // Vérifier que la fonction login du contexte a été appelée
    expect(mockLogin).toHaveBeenCalledWith(userData, 'FAKE_TOKEN_123');
    
    // Vérifier que la fonction de l'API a été appelée avec les bons paramètres
    expect(authApi.login).toHaveBeenCalledWith('test@example.com', 'password123');
    
    // Vérifier la redirection
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('affiche un message d\'erreur avec des identifiants invalides', async () => {
    const errorMessage = 'Email ou mot de passe incorrect';
    
    authApi.login.mockRejectedValueOnce({
      error: errorMessage
    });

    renderLoginWithContext();

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getAllByRole('button', { name: /Se connecter/i })[0]);

    await waitFor(() => {
      // Vérifier que le message d'erreur est affiché
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Vérifier que la fonction login du contexte n'a pas été appelée
    expect(mockLogin).not.toHaveBeenCalled();
  });
  
  it('redirige vers la page appropriée selon le rôle de l\'utilisateur', async () => {
    // Test pour un administrateur
    authApi.login.mockResolvedValueOnce({
      data: { email: 'admin@example.com', role: 'admin' },
      token: 'ADMIN_TOKEN'
    });

    renderLoginWithContext();
    
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'admin@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'adminpass' },
    });

    fireEvent.click(screen.getAllByRole('button', { name: /Se connecter/i })[0]);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/users', { replace: true });
    });
    
    // Réinitialiser les mocks pour le prochain test
    vi.clearAllMocks();
    
    // Test pour un employé
    authApi.login.mockResolvedValueOnce({
      data: { email: 'employee@example.com', role: 'employee' },
      token: 'EMPLOYEE_TOKEN'
    });

    renderLoginWithContext();
    
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'employee@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'employeepass' },
    });

    fireEvent.click(screen.getAllByRole('button', { name: /Se connecter/i })[0]);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/employee/users', { replace: true });
    });
  });
  
  it('affiche les champs du formulaire avec validation', async () => {
    renderLoginWithContext();
    
    // Vérifier que les champs du formulaire sont présents
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
    
    // Soumettre le formulaire sans remplir les champs
    fireEvent.click(screen.getAllByRole('button', { name: /Se connecter/i })[0]);
    
    // Vérifier que les messages d'erreur de validation sont affichés
    await waitFor(() => {
      expect(screen.getByText(/Email requis/i)).toBeInTheDocument();
      expect(screen.getByText(/Mot de passe requis/i)).toBeInTheDocument();
    });
    
    // Remplir l'email avec un format invalide
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'invalid-email' },
    });
    
    // Remplir le mot de passe avec une valeur trop courte
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: '12345' },
    });
    
    // Soumettre à nouveau
    fireEvent.click(screen.getAllByRole('button', { name: /Se connecter/i })[0]);
    
    // Vérifier les messages d'erreur spécifiques
    await waitFor(() => {
      expect(screen.getByText(/Format email invalide/i)).toBeInTheDocument();
      expect(screen.getByText(/Minimum 6 caractères/i)).toBeInTheDocument();
    });
  });
  
  it('affiche un indicateur de chargement pendant la connexion', async () => {
    // Simuler une réponse lente de l'API
    let resolvePromise;
    const loginPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    authApi.login.mockImplementationOnce(() => loginPromise);
    
    renderLoginWithContext();
    
    // Remplir et soumettre le formulaire
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'test@example.com' },
      });
      
      fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
        target: { value: 'password123' },
      });
      
      fireEvent.click(screen.getAllByRole('button', { name: /Se connecter/i })[0]);
    });
    
    // Vérifier que l'indicateur de chargement est affiché
    // Vérifier le texte du bouton de connexion
    expect(screen.getByText('Connexion en cours...')).toBeInTheDocument();
    
    // Vérifier que le SVG du spinner est présent
    const spinnerSvg = document.querySelector('svg.animate-spin');
    expect(spinnerSvg).toBeInTheDocument();
    
    // Résoudre la promesse pour terminer le test
    await act(async () => {
      resolvePromise({
        success: true,
        data: { email: 'test@example.com', role: 'user' },
        token: 'TOKEN'
      });
    });
    
    // Vérifier que l'indicateur de chargement disparaît
    await waitFor(() => {
      expect(screen.queryByText('Connexion en cours...')).not.toBeInTheDocument();
    });
  });
});