import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminHotels from '../../src/pages/AdminHotels';
import { hotelApi } from '../../src/services/api';
import AuthContext from '../../src/context/AuthContext';

// Correction du chemin d'import et mock complet de hotelApi
vi.mock('../../src/services/api', () => ({
  hotelApi: {
    getAllHotels: vi.fn(),
    createHotel: vi.fn(),
    updateHotel: vi.fn(),
    deleteHotel: vi.fn(),
  },
}));

describe('AdminHotels Page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('ne charge pas les hôtels si l\'utilisateur n\'est pas admin', () => {
    const mockUserContext = {
      user: { role: 'user' },
      hasRole: (role) => role === 'user',
    };
    
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

  it('affiche la liste des hôtels pour un admin', async () => {
    const mockAdminContext = {
      user: { role: 'admin' },
      hasRole: (role) => role === 'admin',
    };
    
    hotelApi.getAllHotels.mockResolvedValue({
      success: true,
      data: [
        { id: '1', name: 'Test Hotel', location: 'Paris', description: 'Cool hotel' },
      ],
    });
    
    render(
      <AuthContext.Provider value={mockAdminContext}>
        <MemoryRouter>
          <AdminHotels />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    
    const hotelName = await screen.findByText(/Test Hotel/i);
    expect(hotelName).toBeInTheDocument();
  });

  it('permet de créer un nouvel hôtel', async () => {
    const mockAdminContext = {
      user: { role: 'admin' },
      hasRole: (role) => role === 'admin',
    };
    
    hotelApi.getAllHotels.mockResolvedValue({ success: true, data: [] });
    hotelApi.createHotel.mockResolvedValue({ success: true, data: { id: '2' } });

    render(
      <AuthContext.Provider value={mockAdminContext}>
        <MemoryRouter>
          <AdminHotels />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Attendre que le formulaire soit chargé
    await waitFor(() => {
      expect(screen.getByText(/Gestion des Hôtels/i)).toBeInTheDocument();
    });

    // Trouver les champs du formulaire par leur placeholder ou label
    const nameInput = screen.getByPlaceholderText(/Nom de l'hôtel/i) || 
                    screen.getByLabelText(/Nom/i);
    const locationInput = screen.getByPlaceholderText(/Localisation/i) || 
                         screen.getByLabelText(/Localisation/i);
    const descriptionInput = screen.getByPlaceholderText(/Description/i) || 
                            screen.getByLabelText(/Description/i);

    // Remplir les champs
    fireEvent.change(nameInput, { target: { value: 'New Hotel' } });
    fireEvent.change(locationInput, { target: { value: 'Lyon' } });
    fireEvent.change(descriptionInput, { target: { value: 'Description test' } });

    // Trouver et cliquer sur le bouton de création
    const createButton = screen.getByRole('button', { name: /Créer/i });
    fireEvent.click(createButton);

    // Vérifier que l'API a été appelée
    await waitFor(() => {
      expect(hotelApi.createHotel).toHaveBeenCalled();
    });
    
    // Vérifier les arguments passés à createHotel
    const createHotelCalls = hotelApi.createHotel.mock.calls;
    expect(createHotelCalls.length).toBeGreaterThan(0);
    
    // Vérifier que les données du formulaire ont été transmises
    const firstCallArgs = createHotelCalls[0][0];
    expect(firstCallArgs).toHaveProperty('name', 'New Hotel');
    expect(firstCallArgs).toHaveProperty('location', 'Lyon');
    expect(firstCallArgs).toHaveProperty('description', 'Description test');
  });
});
