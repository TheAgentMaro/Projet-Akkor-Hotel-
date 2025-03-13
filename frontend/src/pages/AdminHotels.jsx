// src/pages/AdminHotels.jsx
import React, { useEffect, useState, useContext } from 'react';
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
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          pages: response.pagination?.pages || 1
        }));
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
    
    // Vérifier le nombre d'images (max 5 au total)
    if (formData.pictures.length + files.length > 5) {
      setError('Vous ne pouvez pas télécharger plus de 5 images au total');
      return;
    }

    // Vérifier la taille des images (max 5MB par image)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError('Les images ne doivent pas dépasser 5MB chacune');
      return;
    }

    // Créer des copies pour éviter les problèmes de référence
    const newImagePreview = [...imagePreview];
    const newPictures = [...formData.pictures];

    files.forEach(file => {
      // Générer un ID unique pour chaque image
      const uniqueId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      const reader = new FileReader();
      reader.onloadend = () => {
        // Ajouter l'image avec son ID à l'aperçu
        newImagePreview.push({
          id: uniqueId,
          src: reader.result
        });
        setImagePreview([...newImagePreview]);
      };
      reader.readAsDataURL(file);
      
      // Associer l'ID au fichier pour pouvoir le retrouver lors de la suppression
      file.id = uniqueId;
      newPictures.push(file);
    });

    setFormData(prev => ({
      ...prev,
      pictures: newPictures
    }));
    
    // Effacer le message d'erreur si tout est ok
    setError('');
  };

  const removeImage = (id) => {
    setImagePreview(prev => prev.filter(img => img.id !== id));
    setFormData(prev => ({
      ...prev,
      pictures: prev.pictures.filter(file => file.id !== id)
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
    setLoading(true); // Indiquer que le traitement commence
    
    try {
      // Validation côté client plus stricte
      const name = formData.name?.trim();
      const location = formData.location?.trim();
      const description = formData.description?.trim();

      if (!name || !location || !description) {
        setError('Tous les champs sont obligatoires');
        return;
      }
      
      // Validation de la longueur de la description (minimum 10 caractères)
      if (description.length < 10) {
        setError('La description doit contenir au moins 10 caractères');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', name);
      formDataToSend.append('location', location);
      formDataToSend.append('description', description);

      // Ajouter les images si présentes
      if (formData.pictures?.length > 0) {
        // Multer attend 'pictures' comme nom de champ pour l'upload
        // Le controller utilise ensuite req.files pour créer picture_list
        formData.pictures.forEach((pic) => {
          formDataToSend.append('pictures', pic);
        });
      }

      // Appel API pour créer ou mettre à jour l'hôtel
      let response;
      if (editMode && editHotelId) {
        response = await hotelApi.updateHotel(editHotelId, formDataToSend);
      } else {
        response = await hotelApi.createHotel(formDataToSend);
      }
      
      // Vérifier explicitement si la réponse indique un succès
      // Détecter un succès soit par la propriété success, soit par la présence d'un ID d'hôtel valide
      if ((response && response.success === true) || (response && response.id)) {
        // Si la réponse contient directement les données de l'hôtel (avec un ID)
        if (response.id) {
          setSuccessMessage(editMode ? 'Hôtel modifié avec succès' : 'Hôtel créé avec succès');
          // Afficher un badge de succès avec animation
          const successElement = document.createElement('div');
          successElement.className = 'success-notification';
          successElement.textContent = '✔ Opération réussie';
          document.body.appendChild(successElement);
          setTimeout(() => document.body.removeChild(successElement), 3000);
        } else {
          // Message standard si la réponse a la propriété success
          setSuccessMessage(response.message || (editMode ? 'Hôtel modifié avec succès' : 'Hôtel créé avec succès'));
        }
        
        resetForm();
        await loadHotels(); // Attendre que les hôtels soient rechargés
      } else if (response?.error) {
        // Erreur explicite retournée par l'API
        setError(response.error);
        console.error('Réponse API avec erreur:', response);
      } else {
        // Cas où la réponse n'a ni success ni error
        console.warn('Réponse API inattendue:', response);
        
        // Vérifier si la réponse contient des données qui ressemblent à un hôtel
        if (response && response.name && response.location) {
          // C'est probablement un hôtel créé avec succès
          setSuccessMessage('Hôtel créé avec succès');
          resetForm();
          await loadHotels();
        } else {
          // Sinon, considérer comme une erreur
          setError('Format de réponse inattendu. Veuillez vérifier si l\'opération a réussi.');
        }
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue lors de l\'opération');
      }
      
      // Recharger les hôtels même en cas d'erreur pour voir si l'hôtel a été créé malgré tout
      try {
        await loadHotels();
      } catch (loadError) {
        console.error('Erreur lors du rechargement des hôtels:', loadError);
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
  
  const handlePageChange = (pageNumber) => {
    // Ensure page number is within valid range
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > pagination.total) pageNumber = pagination.total;
    
    // Update pagination state
    setPagination(prev => ({
      ...prev,
      current: pageNumber
    }));
    
    // Scroll to top of the page for better user experience
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    
    // Convertir les URLs d'images en objets avec ID unique pour l'aperçu
    if (hotel.picture_list && hotel.picture_list.length > 0) {
      const formattedPreviews = hotel.picture_list.map(url => ({
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        src: url
      }));
      setImagePreview(formattedPreviews);
    } else {
      setImagePreview([]);
    }
  }

  async function handleDeleteHotel(hotelId) {
    // Vérifier que l'ID est valide
    if (!hotelId) {
      setError("Impossible de supprimer cet hôtel : ID non valide");
      return;
    }
    
    const confirmDelete = window.confirm('Voulez-vous vraiment supprimer cet hôtel ?');
    if (!confirmDelete) return;
    
    try {
      setLoading(true);
      const response = await hotelApi.deleteHotel(hotelId);
      if (response.success) {
        setSuccessMessage('Hôtel supprimé avec succès');
        await loadHotels();
      } else {
        setError(response.error || "Erreur lors de la suppression de l'hôtel.");
      }
    } catch (err) {
      console.error('Erreur deleteHotel:', err);
      setError("Erreur lors de la suppression de l'hôtel.");
    } finally {
      setLoading(false);
    }
  }

  if (loading && hotels.length === 0) return <div className="text-center p-8 text-gray-700">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gestion des Hôtels</h1>
            <p className="text-sm text-gray-500 mt-1">Ajoutez, modifiez ou supprimez des hôtels</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg shadow-sm">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.pseudo?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">{user?.pseudo}</div>
              <div className="text-xs text-gray-500">Administrateur</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm mb-4 animate-fadeIn flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-sm mb-4 animate-fadeIn flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}
        
        {/* Contrôles de tri et actions */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <label htmlFor="sortField" className="block text-xs font-medium text-gray-500 mb-1">Trier par</label>
              <div className="relative">
                <select
                  id="sortField"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
                >
                  <option value="createdAt">Date de création</option>
                  <option value="name">Nom</option>
                  <option value="location">Localisation</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="block text-xs font-medium text-gray-500 mb-1">Ordre</span>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
                aria-label={sortOrder === 'asc' ? 'Tri ascendant' : 'Tri descendant'}
              >
                {sortOrder === 'asc' ? (
                  <>
                    <svg className="h-4 w-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                    </svg>
                    <span className="text-sm">Ascendant</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                    <span className="text-sm">Descendant</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={resetForm}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Nouvel Hôtel
            </button>
            
            <button
              onClick={loadHotels}
              className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="Actualiser la liste"
            >
              <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Actualiser
            </button>
          </div>
        </div>

        {/* Liste des hôtels */}
        {hotels.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <p className="text-gray-600 font-medium mb-1">Aucun hôtel trouvé</p>
            <p className="text-gray-500 text-sm">Commencez par ajouter votre premier hôtel</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel, index) => (
              <div key={hotel._id || `hotel-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col border border-gray-100 group">
                <div className="relative h-52 bg-gray-200">
                  {hotel.picture_list && hotel.picture_list.length > 0 ? (
                    <img
                      src={hotel.picture_list[0].startsWith('/uploads') ? `http://localhost:3000${hotel.picture_list[0]}` : hotel.picture_list[0]}
                      alt={hotel.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        // Utiliser une image locale au lieu d'un service externe
                        e.target.src = '/assets/placeholder-hotel.jpg';
                        // Si l'image locale ne fonctionne pas, utiliser un SVG inline
                        e.target.onerror = () => {
                          const parent = e.target.parentNode;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-gray-100">
                                <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                              </div>
                            `;
                          }
                        };
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                    </div>
                  )}
                  {hotel.picture_list && hotel.picture_list.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2.5 py-1.5 rounded-full font-medium">
                      +{hotel.picture_list.length - 1} photos
                    </div>
                  )}
                  
                  {/* Badge de statut */}
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2.5 py-1.5 rounded-md font-medium shadow-sm">
                    Actif
                  </div>
                </div>
                
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="font-bold text-xl text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{hotel.name}</h2>
                    <div className="flex -space-x-1">
                      <button
                        onClick={() => startEdit(hotel)}
                        className="relative z-10 w-9 h-9 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-colors"
                        title="Éditer cet hôtel"
                      >
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteHotel(hotel._id)}
                        className="relative z-0 w-9 h-9 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-colors"
                        title="Supprimer cet hôtel"
                      >
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span className="text-sm">{hotel.location}</span>
                  </div>
                  
                  <p className="text-gray-700 text-sm line-clamp-3 mb-4">{hotel.description}</p>
                </div>
                
                <div className="px-4 pb-4 mt-auto">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(hotel)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded transition-colors flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                      Éditer
                    </button>
                    <button
                      onClick={() => handleDeleteHotel(hotel._id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-3 rounded transition-colors flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination et contrôles de tri */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Contrôles de tri */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 order-2 sm:order-1">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
                </svg>
                <span className="text-sm font-medium text-gray-700">Trier par:</span>
              </div>
              
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative inline-block w-full sm:w-auto">
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm appearance-none bg-white"
                    aria-label="Champ de tri"
                  >
                    <option value="name">Nom</option>
                    <option value="location">Localisation</option>
                    <option value="createdAt">Date de création</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                
                <div className="relative inline-block w-full sm:w-auto">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm appearance-none bg-white"
                    aria-label="Ordre de tri"
                  >
                    <option value="asc">Croissant (A-Z)</option>
                    <option value="desc">Décroissant (Z-A)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center space-x-1 order-1 sm:order-2 w-full sm:w-auto justify-center">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.current === 1}
                  className="inline-flex items-center justify-center p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Première page"
                  title="Première page"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
                  </svg>
                </button>
                
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="inline-flex items-center justify-center p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Page précédente"
                  title="Page précédente"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                
                <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md">
                  {pagination.current} / {pagination.total || 1}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current === pagination.total || pagination.total === 0}
                  className="inline-flex items-center justify-center p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Page suivante"
                  title="Page suivante"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
                
                <button
                  onClick={() => handlePageChange(pagination.total)}
                  disabled={pagination.current === pagination.total || pagination.total === 0}
                  className="inline-flex items-center justify-center p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Dernière page"
                  title="Dernière page"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {editMode ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                )}
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {editMode ? "Modifier l'Hôtel" : "Créer un Nouvel Hôtel"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="hotel-name" className="block text-sm font-medium text-gray-700 mb-1">Nom de l'hôtel</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                  <input
                    id="hotel-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    placeholder="Nom de l'hôtel"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="hotel-location" className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <input
                    id="hotel-location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    placeholder="Ville, Pays"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="hotel-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="relative rounded-md shadow-sm">
                <textarea
                  id="hotel-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                  placeholder="Décrivez l'hôtel, ses services et ses commodités..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                      <span>Télécharger des images</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only" 
                      />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF jusqu'à 5MB (max 5 images)
                  </p>
                </div>
              </div>
              
              {imagePreview.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Aperçu des images ({imagePreview.length})</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {imagePreview.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                          <img
                            src={image.src}
                            alt={`Aperçu ${index + 1}`}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-sm"
                          title="Supprimer cette image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 mt-6 flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-4">
              {editMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto mt-3 sm:mt-0 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Annuler
                </button>
              )}
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement...
                  </>
                ) : (
                  <>
                    {editMode ? (
                      <>
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                        </svg>
                        Mettre à jour
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Créer
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminHotels;