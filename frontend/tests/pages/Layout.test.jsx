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

  test('renders header with navigation and footer correctly for anonymous users', () => {
    const { container } = render(
      <AuthContext.Provider value={{ user: null }}>
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const titleElements = screen.getAllByText(/Akkor Hotel/i);
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header).toContainElement(titleElements[0]);

    // Vérifier les liens publics
    expect(screen.getByText(/Accueil/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Hôtels/i)[0]).toBeInTheDocument();
    
    // Vérifier que les liens privés ne sont pas affichés
    expect(screen.queryByText(/Mes Réservations/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Mon Profil/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Gestion Hôtels/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Gestion Utilisateurs/i)).not.toBeInTheDocument();
    
    // Vérifier les boutons d'authentification
    expect(screen.getByText(/Connexion/i)).toBeInTheDocument();
    expect(screen.getByText(/Inscription/i)).toBeInTheDocument();

    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent(/Tous droits réservés/i);
  });

  test('renders navigation correctly for regular users', () => {
    render(
      <AuthContext.Provider value={{ 
        user: { id: '1', email: 'user@test.com', role: 'user' },
        logout: vi.fn(),
        roleBadgeColor: 'bg-green-100 text-green-800',
        roleLabel: 'Utilisateur'
      }}>
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Vérifier les liens publics
    expect(screen.getByText(/Accueil/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Hôtels/i)[0]).toBeInTheDocument();
    
    // Vérifier les liens privés pour utilisateurs
    expect(screen.getByText(/Mes Réservations/i)).toBeInTheDocument();
    expect(screen.getByText(/Mon Profil/i)).toBeInTheDocument();
    
    // Vérifier que les liens admin/employee ne sont pas affichés
    expect(screen.queryByText(/Gestion Hôtels/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Gestion Utilisateurs/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Gestion Réservations/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Recherche Utilisateurs/i)).not.toBeInTheDocument();
    
    // Vérifier le badge de rôle
    expect(screen.getByText(/Utilisateur/i)).toBeInTheDocument();
  });

  test('renders navigation correctly for employees', () => {
    render(
      <AuthContext.Provider value={{ 
        user: { id: '1', email: 'employee@test.com', role: 'employee' },
        logout: vi.fn(),
        roleBadgeColor: 'bg-blue-100 text-blue-800',
        roleLabel: 'Employé'
      }}>
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Vérifier les liens publics et privés
    expect(screen.getByText(/Accueil/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Hôtels/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Mes Réservations/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Mon Profil/i)[0]).toBeInTheDocument();
    
    // Vérifier les liens spécifiques aux employés
    expect(screen.getByText(/Gestion Réservations/i)).toBeInTheDocument();
    expect(screen.getByText(/Recherche Utilisateurs/i)).toBeInTheDocument();
    
    // Vérifier que les liens admin ne sont pas affichés
    expect(screen.queryByText(/Gestion Hôtels/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Gestion Utilisateurs/i)).not.toBeInTheDocument();
    
    // Vérifier le badge de rôle
    expect(screen.getByText(/Employé/i)).toBeInTheDocument();
  });

  test('renders navigation correctly for administrators', () => {
    render(
      <AuthContext.Provider value={{ 
        user: { id: '1', email: 'admin@test.com', role: 'admin' },
        logout: vi.fn(),
        roleBadgeColor: 'bg-red-100 text-red-800',
        roleLabel: 'Administrateur'
      }}>
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Vérifier les liens publics et privés
    expect(screen.getByText(/Accueil/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Hôtels/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Mes Réservations/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Mon Profil/i)[0]).toBeInTheDocument();
    
    // Vérifier tous les liens d'administration
    expect(screen.getByText(/Gestion Hôtels/i)).toBeInTheDocument();
    expect(screen.getByText(/Gestion Utilisateurs/i)).toBeInTheDocument();
    expect(screen.getByText(/Gestion Réservations/i)).toBeInTheDocument();
    expect(screen.getByText(/Recherche Utilisateurs/i)).toBeInTheDocument();
    
    // Vérifier le badge de rôle
    expect(screen.getByText(/Administrateur/i)).toBeInTheDocument();
  });

  test('handles logout with confirmation', () => {
    const mockLogout = vi.fn();
    
    render(
      <AuthContext.Provider value={{ 
        user: { id: '1', email: 'user@test.com', role: 'user' },
        logout: mockLogout
      }}>
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Cliquer sur le bouton de déconnexion
    fireEvent.click(screen.getByText(/Déconnexion/i));
    
    // Vérifier que la confirmation est affichée
    expect(screen.getByText(/Confirmer la déconnexion/i)).toBeInTheDocument();
    
    // Confirmer la déconnexion
    fireEvent.click(screen.getByText(/Confirmer/i));
    
    // Vérifier que la fonction logout a été appelée
    expect(mockLogout).toHaveBeenCalled();
  });

  test('toggles mobile menu correctly', () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Vérifier que le menu mobile est initialement fermé
    expect(screen.queryByText(/Connexion/i, { selector: '.md\\:hidden a' })).not.toBeInTheDocument();
    
    // Ouvrir le menu mobile
    fireEvent.click(screen.getByLabelText(/Toggle menu/i));
    
    // Vérifier que le menu mobile est ouvert
    expect(screen.getByText(/Connexion/i, { selector: '.md\\:hidden a' })).toBeInTheDocument();
    
    // Fermer le menu mobile
    fireEvent.click(screen.getByLabelText(/Toggle menu/i));
    
    // Vérifier que le menu mobile est fermé
    expect(screen.queryByText(/Connexion/i, { selector: '.md\\:hidden a' })).not.toBeInTheDocument();
  });
});
