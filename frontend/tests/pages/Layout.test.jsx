import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Layout from '../../src/components/Layout';
import AuthContext from '../../src/context/AuthContext';

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('affiche correctement la navigation pour les utilisateurs anonymes', () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <MemoryRouter>
          <Layout>
            <div data-testid="content">Contenu de test</div>
          </Layout>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Vérifier le titre dans la barre de navigation
    expect(screen.getByText('Akkor Hotel', { selector: 'nav span.font-bold.text-xl' })).toBeInTheDocument();

    // Vérifier les liens publics dans la barre de navigation
    expect(screen.getByText('Accueil', { selector: 'nav a' })).toBeInTheDocument();
    expect(screen.getByText('Hôtels', { selector: 'nav a' })).toBeInTheDocument();
    
    // Vérifier que les liens privés ne sont pas affichés
    expect(screen.queryByText('Mes Réservations')).not.toBeInTheDocument();
    expect(screen.queryByText('Mon Profil')).not.toBeInTheDocument();
    
    // Vérifier les boutons d'authentification
    expect(screen.getByText('Connexion', { selector: 'nav a' })).toBeInTheDocument();
    expect(screen.getByText('Inscription', { selector: 'nav a' })).toBeInTheDocument();

    // Vérifier le contenu principal
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  test('affiche correctement la navigation pour les utilisateurs standards', () => {
    render(
      <AuthContext.Provider value={{ 
        user: { _id: '1', pseudo: 'testuser', email: 'user@test.com', role: 'user' },
        logout: vi.fn()
      }}>
        <MemoryRouter>
          <Layout>
            <div data-testid="content">Contenu de test</div>
          </Layout>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Vérifier les liens publics et privés
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Hôtels')).toBeInTheDocument();
    expect(screen.getByText('Mes Réservations')).toBeInTheDocument();
    expect(screen.getByText('Mon Profil')).toBeInTheDocument();
    
    // Vérifier que les liens admin/employee ne sont pas affichés
    expect(screen.queryByText('Gestion Hôtels')).not.toBeInTheDocument();
    expect(screen.queryByText('Gestion Utilisateurs')).not.toBeInTheDocument();
    
    // Vérifier le pseudo de l'utilisateur
    expect(screen.getByText('testuser')).toBeInTheDocument();
    
    // Vérifier le bouton de déconnexion
    expect(screen.getByText('Déconnexion')).toBeInTheDocument();
  });

  test('affiche correctement la navigation pour les employés', () => {
    render(
      <AuthContext.Provider value={{ 
        user: { _id: '1', pseudo: 'employee', email: 'employee@test.com', role: 'employee' },
        logout: vi.fn()
      }}>
        <MemoryRouter>
          <Layout>
            <div data-testid="content">Contenu de test</div>
          </Layout>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Vérifier les liens publics et privés
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Hôtels')).toBeInTheDocument();
    expect(screen.getByText('Mes Réservations')).toBeInTheDocument();
    expect(screen.getByText('Mon Profil')).toBeInTheDocument();
    
    // Vérifier les liens spécifiques aux employés
    expect(screen.getByText('Gestion Réservations')).toBeInTheDocument();
    expect(screen.getByText('Recherche Utilisateurs')).toBeInTheDocument();
    
    // Vérifier que les liens admin ne sont pas affichés
    expect(screen.queryByText('Gestion Hôtels')).not.toBeInTheDocument();
    expect(screen.queryByText('Gestion Utilisateurs')).not.toBeInTheDocument();
  });

  test('affiche correctement la navigation pour les administrateurs', () => {
    render(
      <AuthContext.Provider value={{ 
        user: { _id: '1', pseudo: 'admin', email: 'admin@test.com', role: 'admin' },
        logout: vi.fn()
      }}>
        <MemoryRouter>
          <Layout>
            <div data-testid="content">Contenu de test</div>
          </Layout>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Vérifier tous les liens d'administration
    expect(screen.getByText('Gestion Hôtels')).toBeInTheDocument();
    expect(screen.getByText('Gestion Utilisateurs')).toBeInTheDocument();
    expect(screen.getByText('Gestion Réservations')).toBeInTheDocument();
    expect(screen.getByText('Recherche Utilisateurs')).toBeInTheDocument();
  });

  test('gère correctement la déconnexion avec confirmation', () => {
    const mockLogout = vi.fn();
    
    render(
      <AuthContext.Provider value={{ 
        user: { _id: '1', pseudo: 'testuser', email: 'user@test.com', role: 'user' },
        logout: mockLogout
      }}>
        <MemoryRouter>
          <Layout>
            <div data-testid="content">Contenu de test</div>
          </Layout>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Cliquer sur le bouton de déconnexion
    fireEvent.click(screen.getByText('Déconnexion'));
    
    // Vérifier que la confirmation est affichée
    expect(screen.getByText('Confirmer la déconnexion')).toBeInTheDocument();
    
    // Confirmer la déconnexion
    fireEvent.click(screen.getByText('Confirmer la déconnexion'));
    
    // Vérifier que la fonction logout a été appelée
    expect(mockLogout).toHaveBeenCalled();
    
    // Vérifier que la navigation a été appelée
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('bascule correctement le menu mobile', () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <MemoryRouter>
          <Layout>
            <div data-testid="content">Contenu de test</div>
          </Layout>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Le menu mobile est initialement fermé
    const mobileMenuButton = screen.getByLabelText('Toggle menu');
    expect(mobileMenuButton).toBeInTheDocument();
    
    // Ouvrir le menu mobile
    fireEvent.click(mobileMenuButton);
    
    // Vérifier que le menu mobile contient les liens de navigation
    expect(screen.getByText('Accueil', { selector: '.md\\:hidden a' })).toBeInTheDocument();
    expect(screen.getByText('Hôtels', { selector: '.md\\:hidden a' })).toBeInTheDocument();
    
    // Fermer le menu mobile
    fireEvent.click(mobileMenuButton);
    
    // Vérifier que le menu mobile est fermé
    expect(screen.queryByText('Accueil', { selector: '.md\\:hidden a' })).not.toBeInTheDocument();
  });

  test('affiche les badges de rôle avec les bonnes couleurs', () => {
    // Test pour le rôle admin (rouge)
    const { rerender } = render(
      <AuthContext.Provider value={{ 
        user: { _id: '1', pseudo: 'admin', role: 'admin' },
        logout: vi.fn()
      }}>
        <MemoryRouter>
          <Layout>
            <div data-testid="content">Contenu de test</div>
          </Layout>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Vérifier que le badge admin est rouge
    const adminRoleBadges = screen.getAllByText('admin');
    const adminRoleBadge = adminRoleBadges.find(
      badge => badge.className && badge.className.includes('rounded-full')
    );
    expect(adminRoleBadge).toBeInTheDocument();
    expect(adminRoleBadge.className).toContain('bg-red-100');
    expect(adminRoleBadge.className).toContain('text-red-800');

    // Test pour le rôle employee (bleu)
    rerender(
      <AuthContext.Provider value={{ 
        user: { _id: '1', pseudo: 'employee', role: 'employee' },
        logout: vi.fn()
      }}>
        <MemoryRouter>
          <Layout>
            <div data-testid="content">Contenu de test</div>
          </Layout>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Vérifier que le badge employee est bleu
    const employeeRoleBadges = screen.getAllByText('employee');
    const employeeRoleBadge = employeeRoleBadges.find(
      badge => badge.className && badge.className.includes('rounded-full')
    );
    expect(employeeRoleBadge).toBeInTheDocument();
    expect(employeeRoleBadge.className).toContain('bg-blue-100');
    expect(employeeRoleBadge.className).toContain('text-blue-800');

    // Test pour le rôle user (vert)
    rerender(
      <AuthContext.Provider value={{ 
        user: { _id: '1', pseudo: 'user', role: 'user' },
        logout: vi.fn()
      }}>
        <MemoryRouter>
          <Layout>
            <div data-testid="content">Contenu de test</div>
          </Layout>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Vérifier que le badge user est vert
    const userRoleBadges = screen.getAllByText('user');
    const userRoleBadge = userRoleBadges.find(
      badge => badge.className && badge.className.includes('rounded-full')
    );
    expect(userRoleBadge).toBeInTheDocument();
    expect(userRoleBadge.className).toContain('bg-green-100');
    expect(userRoleBadge.className).toContain('text-green-800');
  });
});
