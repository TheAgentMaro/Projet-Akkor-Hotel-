import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import AuthContext from '../../src/context/AuthContext';

// Composant de test
const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('affiche le contenu pour un utilisateur authentifié avec le bon rôle', () => {
    const user = { id: '1', email: 'admin@test.com', role: 'admin' };
    
    render(
      <AuthContext.Provider value={{ user }}>
        <MemoryRouter>
          <ProtectedRoute roles={['admin']}>
            <TestComponent />
          </ProtectedRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('affiche un message d\'accès refusé pour un utilisateur avec un rôle incorrect', () => {
    const user = { id: '1', email: 'user@test.com', role: 'user' };
    
    render(
      <AuthContext.Provider value={{ user }}>
        <MemoryRouter>
          <ProtectedRoute roles={['admin']}>
            <TestComponent />
          </ProtectedRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    expect(screen.getByText(/Accès refusé/i)).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('redirige vers la page de connexion pour un utilisateur non authentifié', () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <MemoryRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    expect(screen.getByText(/Connexion requise/i)).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('permet l\'accès aux routes anonymes même sans authentification', () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <MemoryRouter>
          <ProtectedRoute allowAnonymous={true}>
            <TestComponent />
          </ProtectedRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('permet l\'accès à un employé pour les routes employé', () => {
    const user = { id: '1', email: 'employee@test.com', role: 'employee' };
    
    render(
      <AuthContext.Provider value={{ user }}>
        <MemoryRouter>
          <ProtectedRoute roles={['employee']}>
            <TestComponent />
          </ProtectedRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('permet l\'accès à un admin pour toutes les routes', () => {
    const user = { id: '1', email: 'admin@test.com', role: 'admin' };
    
    render(
      <AuthContext.Provider value={{ user }}>
        <MemoryRouter>
          <ProtectedRoute roles={['employee']}>
            <TestComponent />
          </ProtectedRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});
