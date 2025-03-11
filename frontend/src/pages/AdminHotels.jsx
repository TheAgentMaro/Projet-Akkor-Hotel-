import React, { useEffect, useState } from 'react';
import { hotelApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

function AdminHotels() {
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Formulaires simples pour créer ou éditer
  const [newHotelName, setNewHotelName] = useState('');
  const [newHotelLocation, setNewHotelLocation] = useState('');
  const [newHotelDescription, setNewHotelDescription] = useState('');
  const [newHotelPictures, setNewHotelPictures] = useState('');

  // État pour savoir si on est en train d’éditer un hôtel
  const [editMode, setEditMode] = useState(false);
  const [editHotelId, setEditHotelId] = useState(null);

  const navigate = useNavigate();
  const role = localStorage.getItem('role'); 

  if (role !== 'admin') {
    return <div className="text-red-600 font-semibold">Accès refusé : réservé aux administrateurs</div>;
  }

  useEffect(() => {
    loadHotels();
  }, []);

  async function loadHotels() {
    try {
      setLoading(true);
      setError('');
      const response = await hotelApi.getAllHotels();
      if (response.success && Array.isArray(response.data)) {
        setHotels(response.data);
      } else {
        setError('Erreur lors du chargement des hôtels.');
      }
    } catch (err) {
      setError('Erreur lors du chargement des hôtels.');
    } finally {
      setLoading(false);
    }
  }

  // Création d'un hôtel
  async function handleCreateHotel(e) {
    e.preventDefault();
    try {
      const pictureList = newHotelPictures
        ? newHotelPictures.split(',').map((pic) => pic.trim())
        : [];
      await hotelApi.createHotel({
        name: newHotelName,
        location: newHotelLocation,
        description: newHotelDescription,
        picture_list: pictureList,
      });
      loadHotels();
      setNewHotelName('');
      setNewHotelLocation('');
      setNewHotelDescription('');
      setNewHotelPictures('');
    } catch (err) {
      setError('Erreur lors de la création de l’hôtel.');
    }
  }

  // Mise à jour d'un hôtel
  async function handleUpdateHotel(e) {
    e.preventDefault();
    try {
      const pictureList = newHotelPictures
        ? newHotelPictures.split(',').map((pic) => pic.trim())
        : [];
      await hotelApi.updateHotel(editHotelId, {
        name: newHotelName,
        location: newHotelLocation,
        description: newHotelDescription,
        picture_list: pictureList,
      });
      setEditMode(false);
      setEditHotelId(null);
      setNewHotelName('');
      setNewHotelLocation('');
      setNewHotelDescription('');
      setNewHotelPictures('');
      loadHotels();
    } catch (err) {
      setError('Erreur lors de la mise à jour de l’hôtel.');
    }
  }

  // Passer en mode édition
  function startEdit(hotel) {
    setEditMode(true);
    setEditHotelId(hotel.id);
    setNewHotelName(hotel.name);
    setNewHotelLocation(hotel.location);
    setNewHotelDescription(hotel.description);
    setNewHotelPictures(hotel.picture_list?.join(', '));
  }

  // Supprimer un hôtel
  async function handleDeleteHotel(hotelId) {
    const confirmDelete = window.confirm('Voulez-vous vraiment supprimer cet hôtel ?');
    if (!confirmDelete) return;
    try {
      await hotelApi.deleteHotel(hotelId);
      loadHotels();
    } catch (err) {
      setError('Erreur lors de la suppression de l’hôtel.');
    }
  }

  if (loading) return <div className="text-center text-gray-700">Chargement...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestion des Hôtels (Admin)</h1>

      <ul className="space-y-4">
        {hotels.map((hotel) => (
          <li key={hotel.id} className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold text-xl">{hotel.name}</h2>
            <p className="text-gray-600">{hotel.location}</p>
            <p className="text-gray-700 mt-2">{hotel.description}</p>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => startEdit(hotel)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Éditer
              </button>
              <button
                onClick={() => handleDeleteHotel(hotel.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="bg-white p-4 rounded shadow">
        {editMode ? (
          <h2 className="text-xl font-bold mb-2">Modifier l’Hôtel</h2>
        ) : (
          <h2 className="text-xl font-bold mb-2">Créer un Nouvel Hôtel</h2>
        )}

        <form onSubmit={editMode ? handleUpdateHotel : handleCreateHotel} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Nom</label>
            <input
              className="border p-2 w-full"
              value={newHotelName}
              onChange={(e) => setNewHotelName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Localisation</label>
            <input
              className="border p-2 w-full"
              value={newHotelLocation}
              onChange={(e) => setNewHotelLocation(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              className="border p-2 w-full"
              rows={2}
              value={newHotelDescription}
              onChange={(e) => setNewHotelDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Liste d'images (séparées par des virgules)</label>
            <input
              className="border p-2 w-full"
              placeholder="ex: pic1.jpg, pic2.png"
              value={newHotelPictures}
              onChange={(e) => setNewHotelPictures(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {editMode ? 'Mettre à jour' : 'Créer'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminHotels;
