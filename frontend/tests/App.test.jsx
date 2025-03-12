import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom'; // Pour simuler le routage
import App from '../src/App';
import { AuthProvider, AuthContext } from '../src/context/AuthContext'; // Importer le contexte d'authentification
import Home from '../src/pages/Home'; // Importer les pages pour mock
import Login from '../src/pages/auth/Login';
import Profile from '../src/pages/auth/Profile';
import AdminUsers from '../src/pages/AdminUsers';

// Mock des composants/pages pour simplifier les tests
vi.mock('../src/pages/Home', () => ({
  default: () => <div>Home Page</div>,
}));
vi.mock('../src/pages/auth/Login', () => ({
  default: () => <div>Login Page</div>,
}));
vi.mock('../src/pages/auth/Profile', () => ({
  default: () => <div>Profile Page</div>,
}));
vi.mock('../src/pages/AdminUsers', () => ({
  default: () => <div>Admin Users Page</div>,
}));
vi.mock('../src/components/Layout', () => ({
  default: ({ children }) => (
    <div>
      <header>Akkor Hotel</header>
      {children}
    </div>
  ),
}));

// Mock du contexte d'authentification
const mockAuthContext = (user = null) => {
  return {
    user,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  };
};

// Fonction utilitaire pour rendre l'application avec un contexte et un routage spécifiques
const renderWithRouterAndAuth = (initialEntries = ['/'], authValue = mockAuthContext()) => {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('App Component', () => {
  // Test 1 : Rendu initial et éléments de base
  it('renders without crashing and displays main layout elements', () => {
    renderWithRouterAndAuth(['/']);
    const akkors = screen.getAllByText(/Akkor Hotel/i);
    expect(akkors.length).toBeGreaterThan(0);
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  // Test 2 : Route publique /login
  it('renders Login page on /login route', () => {
    renderWithRouterAndAuth(['/login']);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.getByText(/Akkor Hotel/i)).toBeInTheDocument();
  });

  // Test 3 : Route protégée /profile sans authentification
  it('redirects to login when accessing /profile without authentication', () => {
    renderWithRouterAndAuth(['/profile']);
    // Supposons que ProtectedRoute redirige vers /login si non authentifié
    expect(screen.queryByText('Profile Page')).not.toBeInTheDocument();
    // Vérifiez la redirection ou un message d'erreur selon votre implémentation
  });

  // Test 4 : Route protégée /profile avec utilisateur normal
  it('renders Profile page for authenticated user', () => {
    const authValue = mockAuthContext({ id: '1', role: 'user' });
    renderWithRouterAndAuth(['/profile'], authValue);
    expect(screen.getByText('Profile Page')).toBeInTheDocument();
    expect(screen.getByText(/Akkor Hotel/i)).toBeInTheDocument();
  });

  // Test 5 : Route admin /admin/users avec utilisateur normal (non autorisé)
  it('blocks access to /admin/users for non-admin user', () => {
    const authValue = mockAuthContext({ id: '1', role: 'user' });
    renderWithRouterAndAuth(['/admin/users'], authValue);
    expect(screen.queryByText('Admin Users Page')).not.toBeInTheDocument();
    // Vérifiez la redirection ou le message d'erreur selon ProtectedRoute
  });

  // Test 6 : Route admin /admin/users avec admin
  it('renders AdminUsers page for admin user', () => {
    const authValue = mockAuthContext({ id: '2', role: 'admin' });
    renderWithRouterAndAuth(['/admin/users'], authValue);
    expect(screen.getByText('Admin Users Page')).toBeInTheDocument();
    expect(screen.getByText(/Akkor Hotel/i)).toBeInTheDocument();
  });

  // Test 7 : Route 404 pour une URL inconnue
  it('renders 404 page for unknown route', () => {
    renderWithRouterAndAuth(['/unknown-route']);
    expect(screen.getByText('Page non trouvée')).toBeInTheDocument();
    expect(screen.getByText('La page que vous recherchez n\'existe pas.')).toBeInTheDocument();
  });
});