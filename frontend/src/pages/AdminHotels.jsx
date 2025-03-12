// src/pages/AdminHotels.jsx
import React, { useEffect, useState, useContext, useRef } from 'react';
import { hotelApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function AdminHotels() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const formRef = useRef(null);
  const [pagination, setPagination] = useState({
    current: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  // États pour le tri
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // États du formulaire
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    pictures: []
  });
  const [editMode, setEditMode] = useState(false);
  const [editHotelId, setEditHotelId] = useState(null);
  const [imagePreview, setImagePreview] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadHotels();
    }
  }, [user, pagination.current, sortField, sortOrder]);

  async function loadHotels() {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      const response = await hotelApi.getAllHotels({
        page: pagination.current,
        limit: pagination.limit,
        sort: sortField,
        order: sortOrder
      });
      
      if (response.success) {
        setHotels(response.data);
        setPagination(response.pagination);
      } else {
        setError('Erreur lors du chargement des hôtels.');
      }
    } catch (err) {
      setError('Erreur lors du chargement des hôtels.');
      console.error('Erreur loadHotels:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Vérifier le nombre d'images
    if (files.length > 5) {
      setError('Vous ne pouvez pas uploader plus de 5 images');
      return;
    }

    // Vérifier la taille des images (max 5MB par image)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError('Les images ne doivent pas dépasser 5MB chacune');
      return;
    }

    const newImagePreview = [];
    const newPictures = [];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImagePreview.push(reader.result);
        setImagePreview([...newImagePreview]);
      };
      reader.readAsDataURL(file);
      newPictures.push(file);
    });

    setFormData(prev => ({
      ...prev,
      pictures: [...prev.pictures, ...newPictures]
    }));
    
    // Effacer le message d'erreur si tout est ok
    setError('');
  };

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      pictures: prev.pictures.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Empêcher la soumission si déjà en cours
    if (loading) {
      return;
    }
    
    setError(''); // Reset error
    setSuccessMessage(''); // Reset success message
    try {
      // Debug des données du formulaire
      console.log('FormData initial:', formData);
      
      // Validation côté client plus stricte
      const name = formData.name?.trim();
      const location = formData.location?.trim();
      const description = formData.description?.trim();
      
      console.log('Valeurs après trim:', { name, location, description });

      if (!name || !location || !description) {
        setError('Tous les champs sont obligatoires');
        return;
      }

      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', name);
      formDataToSend.append('location', location);
      formDataToSend.append('description', description);

      // Ajouter les images si présentes
      if (formData.pictures?.length > 0) {
        formData.pictures.forEach(pic => {
          formDataToSend.append('picture_list', pic);
        });
      }

      // Debug du FormData avant envoi
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`FormData avant envoi - ${key}:`, value);
      }

      const response = await hotelApi.createHotel(formDataToSend);
      
      if (response.success) {
        setSuccessMessage(response.message || 'Hôtel créé avec succès');
        resetForm();
        await loadHotels(); // Attendre que les hôtels soient rechargés
      } else {
        setError(response.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue lors de la création de l\'hôtel');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      description: '',
      pictures: []
    });
    setImagePreview([]);
    setEditMode(false);
    setEditHotelId(null);
    setError('');
    setSuccessMessage('');
  };

  function startEdit(hotel) {
    setEditMode(true);
    setEditHotelId(hotel._id);
    setFormData({
      name: hotel.name,
      location: hotel.location,
      description: hotel.description,
      pictures: []
    });
    setImagePreview(hotel.picture_list || []);
  }

  async function handleDeleteHotel(hotelId) {
    const confirmDelete = window.confirm('Voulez-vous vraiment supprimer cet hôtel ?');
    if (!confirmDelete) return;
    try {
      await hotelApi.deleteHotel(hotelId);
      loadHotels();
    } catch (err) {
      setError("Erreur lors de la suppression de l'hôtel.");
    }
  }

  if (loading) return <div className="text-center text-gray-700">Chargement...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gestion des Hôtels</h1>
          <div className="text-sm text-gray-600">
            Connecté en tant que : {user?.pseudo} (Admin)
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}
        
        {/* Contrôles de tri */}
        <div className="mb-4 flex items-center space-x-4">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="border rounded p-2"
          >
            <option value="createdAt">Date de création</option>
            <option value="name">Nom</option>
            <option value="location">Localisation</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* Liste des hôtels */}
        <ul className="space-y-4">
          {hotels.map((hotel) => (
            <li key={hotel._id} className="bg-white p-4 rounded shadow">
              <div className="flex flex-wrap gap-4 mb-4">
                {hotel.picture_list?.map((pic, index) => (
                  <img
                    key={index}
                    src={pic}
                    alt={`${hotel.name} - ${index + 1}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                ))}
              </div>
              <h2 className="font-semibold text-xl">{hotel.name}</h2>
              <p className="text-gray-600">{hotel.location}</p>
              <p className="text-gray-700 mt-2">{hotel.description}</p>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => startEdit(hotel)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Éditer
                </button>
                <button
                  onClick={() => handleDeleteHotel(hotel._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Pagination */}
        <div className="mt-4 flex justify-center space-x-2">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPagination(prev => ({ ...prev, current: i + 1 }))}
              className={`px-3 py-1 rounded ${
                pagination.current === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Formulaire */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">
            {editMode ? "Modifier l'Hôtel" : "Créer un Nouvel Hôtel"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Nom</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Localisation</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="border p-2 w-full rounded"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="border p-2 w-full rounded"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="border p-2 w-full rounded"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {imagePreview.map((src, index) => (
                  <div key={index} className="relative">
                    <img
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {editMode ? 'Mettre à jour' : 'Créer'}
              </button>
              {editMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminHotels;