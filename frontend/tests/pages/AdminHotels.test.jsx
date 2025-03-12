import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminHotels from '../../src/pages/AdminHotels';
import { hotelApi } from '../../src/services/api';
import AuthContext from '../../src/context/AuthContext';

// Mock des API
vi.mock('../../src/services/api', () => ({
  hotelApi: {
    getAllHotels: vi.fn(),
    createHotel: vi.fn(),
    updateHotel: vi.fn(),
    deleteHotel: vi.fn(),
  },
}));

// Mock de window.confirm pour simuler la confirmation de suppression
vi.spyOn(window, 'confirm').mockImplementation(() => true);

describe('AdminHotels Page', () => {
  // Contexte d'authentification pour un admin
  const mockAdminContext = {
    user: { role: 'admin', pseudo: 'AdminUser' },
    hasRole: (role) => role === 'admin',
  };

  // Contexte d'authentification pour un utilisateur standard
  const mockUserContext = {
    user: { role: 'user' },
    hasRole: (role) => role === 'user',
  };

  // Données mock pour les hôtels
  const mockHotels = [
    { _id: '1', name: 'Test Hotel', location: 'Paris', description: 'Cool hotel', picture_list: ['url1.jpg'] },
    { _id: '2', name: 'Second Hotel', location: 'Lyon', description: 'Nice hotel', picture_list: ['url2.jpg'] }
  ];

  beforeEach(() => {
    localStorage.clear();
    // Configuration par défaut des mocks pour les tests
    hotelApi.getAllHotels.mockResolvedValue({
      success: true,
      data: mockHotels,
      pagination: { current: 1, total: 1, limit: 10, pages: 1 }
    });
    hotelApi.createHotel.mockResolvedValue({ success: true, data: { _id: '3' } });
    hotelApi.updateHotel.mockResolvedValue({ success: true });
    hotelApi.deleteHotel.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Vérifier que les hôtels ne sont pas chargés pour un utilisateur non-admin
  it('ne charge pas les hôtels si l\'utilisateur n\'est pas admin', () => {
    render(
      <AuthContext.Provider value={mockUserContext}>
        <MemoryRouter>
          <AdminHotels />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    // Vérifie que la fonction getAllHotels n'a pas été appelée
    expect(hotelApi.getAllHotels).not.toHaveBeenCalled();
  });

  // Test 2: Vérifier que la liste des hôtels est affichée pour un admin
  it('affiche la liste des hôtels pour un admin', async () => {
    render(
      <AuthContext.Provider value={mockAdminContext}>
        <MemoryRouter>
          <AdminHotels />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    // Vérifier que l'API a été appelée pour charger les hôtels
    await waitFor(() => {
      expect(hotelApi.getAllHotels).toHaveBeenCalled();
    });
    
    // Vérifier que les noms des hôtels sont affichés
    expect(await screen.findByText('Test Hotel')).toBeInTheDocument();
    expect(await screen.findByText('Second Hotel')).toBeInTheDocument();
  });

  // Test 3: Vérifier qu'un admin peut créer un nouvel hôtel
  it('permet de créer un nouvel hôtel', async () => {
    render(
      <AuthContext.Provider value={mockAdminContext}>
        <MemoryRouter>
          <AdminHotels />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Attendre le chargement de la page
    await waitFor(() => {
      expect(screen.getByText(/Gestion des Hôtels/i)).toBeInTheDocument();
    });

    // Vérifier que le formulaire de création est présent
    expect(screen.getByText(/Créer un Nouvel Hôtel/i)).toBeInTheDocument();

    // Vérifier que les champs du formulaire sont présents
    const nameInput = screen.getByPlaceholderText("Nom de l'hôtel");
    const locationInput = screen.getByPlaceholderText("Ville, Pays");
    const descriptionInput = screen.getByPlaceholderText(/Décrivez l'hôtel/i);

    // Remplir les champs du formulaire
    fireEvent.change(nameInput, { target: { value: 'New Hotel' } });
    fireEvent.change(locationInput, { target: { value: 'Lyon' } });
    fireEvent.change(descriptionInput, { target: { value: 'Description test' } });

    // Soumettre le formulaire
    const createButton = screen.getByRole('button', { name: /Créer/i });
    fireEvent.click(createButton);

    // Vérifier que l'API a été appelée
    await waitFor(() => {
      expect(hotelApi.createHotel).toHaveBeenCalled();
    });
  });

  // Test 4: Vérifier qu'un admin peut modifier un hôtel existant
  it('permet de modifier un hôtel existant', async () => {
    render(
      <AuthContext.Provider value={mockAdminContext}>
        <MemoryRouter>
          <AdminHotels />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Attendre que les hôtels soient chargés
    await waitFor(() => {
      expect(hotelApi.getAllHotels).toHaveBeenCalled();
    });

    // Trouver et cliquer sur le bouton d'édition
    const editButtons = await screen.findAllByText('Éditer');
    expect(editButtons.length).toBeGreaterThan(0);
    fireEvent.click(editButtons[0]);

    // Vérifier que le formulaire passe en mode édition
    await waitFor(() => {
      expect(screen.getByText("Modifier l'Hôtel")).toBeInTheDocument();
    });

    // Vérifier que le bouton de mise à jour est présent
    const updateButton = screen.getByText("Mettre à jour");
    expect(updateButton).toBeInTheDocument();

    // Modifier le nom de l'hôtel
    const nameInput = screen.getByPlaceholderText("Nom de l'hôtel");
    fireEvent.change(nameInput, { target: { value: 'Updated Hotel Name' } });

    // Soumettre le formulaire
    fireEvent.click(updateButton);

    // Vérifier que l'API a été appelée
    await waitFor(() => {
      expect(hotelApi.updateHotel).toHaveBeenCalled();
    });
  });

  // Test 5: Vérifier qu'un admin peut supprimer un hôtel
  it('permet de supprimer un hôtel après confirmation', async () => {
    render(
      <AuthContext.Provider value={mockAdminContext}>
        <MemoryRouter>
          <AdminHotels />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Attendre que les hôtels soient chargés
    await waitFor(() => {
      expect(hotelApi.getAllHotels).toHaveBeenCalled();
    });

    // Vérifier que les hôtels sont affichés
    expect(await screen.findByText('Test Hotel')).toBeInTheDocument();

    // Trouver et cliquer sur le bouton de suppression
    const deleteButtons = screen.getAllByTitle('Supprimer cet hôtel');
    expect(deleteButtons.length).toBeGreaterThan(0);
    fireEvent.click(deleteButtons[0]);

    // Vérifier que l'API a été appelée avec l'ID correct
    await waitFor(() => {
      expect(hotelApi.deleteHotel).toHaveBeenCalledWith('1');
    });

    // Vérifier que les hôtels sont rechargés après la suppression
    expect(hotelApi.getAllHotels).toHaveBeenCalledTimes(2);
  });
});
