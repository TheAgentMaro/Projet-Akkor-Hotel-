import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminHotels from '../../src/pages/AdminHotels';
import { hotelApi } from '../../src/services/api';

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

  it('affiche un message d\'accès refusé si l\'utilisateur n\'est pas admin', () => {
    localStorage.setItem('role', 'user');
    render(
      <MemoryRouter>
        <AdminHotels />
      </MemoryRouter>
    );
    expect(screen.getByText(/Accès refusé/i)).toBeInTheDocument();
  });

  it('affiche la liste des hôtels pour un admin', async () => {
    localStorage.setItem('role', 'admin');
    hotelApi.getAllHotels.mockResolvedValue({
      success: true,
      data: [
        { id: '1', name: 'Test Hotel', location: 'Paris', description: 'Cool hotel' },
      ],
    });
    render(
      <MemoryRouter>
        <AdminHotels />
      </MemoryRouter>
    );
    const hotelName = await screen.findByText(/Test Hotel/i);
    expect(hotelName).toBeInTheDocument();
  });

  it('permet de créer un nouvel hôtel', async () => {
    localStorage.setItem('role', 'admin');
    hotelApi.getAllHotels.mockResolvedValue({ success: true, data: [] });
    hotelApi.createHotel.mockResolvedValue({ success: true, data: { id: '2' } });

    render(
      <MemoryRouter>
        <AdminHotels />
      </MemoryRouter>
    );

    // Récupérer tous les "textbox" (inputs et textarea) dans l'ordre du formulaire.
    const textboxes = await screen.findAllByRole('textbox');
    expect(textboxes.length).toBeGreaterThanOrEqual(4);

    const nameInput = textboxes[0];
    const locationInput = textboxes[1];
    const descriptionInput = textboxes[2];
    const imagesInput = textboxes[3];

    fireEvent.change(nameInput, { target: { value: 'New Hotel' } });
    fireEvent.change(locationInput, { target: { value: 'Lyon' } });
    fireEvent.change(descriptionInput, { target: { value: 'Description test' } });
    // Pour le champ images, on laisse vide ici (ce qui génère un tableau vide)
    fireEvent.change(imagesInput, { target: { value: '' } });

    const createButton = screen.getByRole('button', { name: /Créer/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(hotelApi.createHotel).toHaveBeenCalledWith({
        name: 'New Hotel',
        location: 'Lyon',
        description: 'Description test',
        picture_list: [],
      });
    });
  });
});
