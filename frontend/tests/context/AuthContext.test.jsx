import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../../src/context/AuthContext';
import AuthContext from '../../src/context/AuthContext';
import { userApi } from '../../src/services/api';

// Mock de l'API utilisateur
vi.mock('../../src/services/api', () => ({
  userApi: {
    getProfile: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    updateProfile: vi.fn()
  }
}));

// Mock de window.location
const mockLocation = {
  href: ''
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// Composant de test pour accéder au contexte
const TestConsumer = () => {
  const auth = React.useContext(AuthContext);
  return (
    <div>
      <div data-testid="auth-status">{auth.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-role">{auth.user?.role || 'No Role'}</div>
      <button data-testid="logout-button" onClick={() => auth.logout()}>Logout</button>
      <button 
        data-testid="login-button" 
        onClick={() => auth.login({ id: '1', email: 'test@example.com', role: 'user' }, 'fake-token')}
      >
        Login
      </button>
      <div data-testid="has-admin-role">{auth.hasRole('admin') ? 'Has Admin' : 'Not Admin'}</div>
      <div data-testid="has-employee-role">{auth.hasRole('employee') ? 'Has Employee' : 'Not Employee'}</div>
      <div data-testid="can-access">{auth.canAccess('1') ? 'Can Access' : 'Cannot Access'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    window.location.href = '';
  });

  it('initialise avec un utilisateur non authentifié', async () => {
    userApi.getProfile.mockRejectedValueOnce(new Error('Not authenticated'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Attendre que le chargement initial soit terminé
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });
    
    expect(screen.getByTestId('user-role')).toHaveTextContent('No Role');
    expect(screen.getByTestId('has-admin-role')).toHaveTextContent('Not Admin');
    expect(screen.getByTestId('has-employee-role')).toHaveTextContent('Not Employee');
    expect(screen.getByTestId('can-access')).toHaveTextContent('Cannot Access');
  });

 
  it('permet à l\'utilisateur de se connecter', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Attendre que le chargement initial soit terminé
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toBeInTheDocument();
    });

    // Simuler une connexion
    await act(async () => {
      screen.getByTestId('login-button').click();
    });

    // Vérifier que le token et l'utilisateur ont été enregistrés dans localStorage
    expect(localStorage.getItem('token')).toBe('Bearer fake-token');
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({ 
      id: '1', 
      email: 'test@example.com', 
      role: 'user' 
    });
  });

  it('permet à l\'utilisateur de se déconnecter', async () => {
    // Simuler un utilisateur connecté
    localStorage.setItem('token', 'Bearer fake-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@example.com', role: 'user' }));
    
    userApi.getProfile.mockResolvedValueOnce({
      success: true,
      data: { id: '1', email: 'test@example.com', role: 'user' }
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Attendre que le chargement initial soit terminé
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    // Simuler une déconnexion
    await act(async () => {
      screen.getByTestId('logout-button').click();
    });

    // Vérifier que le localStorage a été nettoyé
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    
    // Vérifier que l'utilisateur est redirigé vers la page de connexion
    expect(window.location.href).toBe('/login');
  });
});
