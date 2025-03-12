// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Configuration initiale d'Axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour les requêtes
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour les réponses
axiosInstance.interceptors.response.use(
  (response) => ({
    success: true,
    data: response.data.data || response.data,
    token: response.data.token,
    message: response.data.message
  }),
  (error) => {
    if (error.response?.status === 401) {
      // Double confirmation pour la déconnexion
      if (confirm('Votre session a expiré. Voulez-vous vous reconnecter ?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      }
    }
    return Promise.reject({
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    });
  }
);

// API pour l'authentification
export const authApi = {
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      if (response.success && response.token) {
        localStorage.setItem('token', `Bearer ${response.token}`);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response;
    } catch (error) {
      console.error('Erreur login:', error);
      throw error;
    }
  },

  register: async (email, pseudo, password) => {
    try {
      const response = await axiosInstance.post('/auth/register', { email, pseudo, password });
      return response;
    } catch (error) {
      console.error('Erreur register:', error);
      throw error;
    }
  },

  logout: async () => {
    // Double confirmation pour la déconnexion
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axiosInstance.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
  },

  // Vérifier si l'utilisateur est authentifié et son rôle
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole: (role) => {
    const user = authApi.getCurrentUser();
    if (!user) return false;
    if (role === 'admin') return user.role === 'admin';
    if (role === 'employee') return ['admin', 'employee'].includes(user.role);
    return true;
  }
};

// API pour les utilisateurs
export const userApi = {
  // Obtenir son propre profil
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/users/me');
      return response;
    } catch (error) {
      console.error('Erreur getProfile:', error);
      throw error;
    }
  },

  // Mettre à jour son profil
  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.put('/users/me', userData);
      // Mettre à jour les données utilisateur dans le localStorage
      if (response.success) {
        const currentUser = authApi.getCurrentUser();
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...response.data }));
      }
      return response;
    } catch (error) {
      console.error('Erreur updateProfile:', error);
      throw error;
    }
  },

  // Supprimer son compte
  deleteAccount: async () => {
    try {
      // Double confirmation pour la suppression
      if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
        const response = await axiosInstance.delete('/users/me');
        if (response.success) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/register';
        }
        return response;
      }
    } catch (error) {
      console.error('Erreur deleteAccount:', error);
      throw error;
    }
  },

  // Admin : Obtenir la liste des utilisateurs
  getAllUsers: async () => {
    try {
      const response = await axiosInstance.get('/users');
      return response;
    } catch (error) {
      if (error.status === 403) {
        alert('Contactez un administrateur pour obtenir les droits nécessaires.');
      }
      throw error;
    }
  },

  // Employee : Rechercher des utilisateurs
  searchUsers: async (query) => {
    try {
      if (!query || query.trim() === '') {
        return {
          success: false,
          error: 'Veuillez saisir un terme de recherche',
          data: []
        };
      }
      
      const response = await axiosInstance.get('/users/search', {
        params: { query }
      });
      return response;
    } catch (error) {
      console.error('Erreur searchUsers:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la recherche des utilisateurs',
        data: []
      };
    }
  },

  // Admin : Mettre à jour le rôle d'un utilisateur
  updateUserRole: async (userId, role) => {
    try {
      // Double confirmation pour le changement de rôle
      if (confirm(`Êtes-vous sûr de vouloir modifier le rôle de cet utilisateur en "${role}" ?`)) {
        const response = await axiosInstance.put(`/users/${userId}/role`, { role });
        return response;
      }
    } catch (error) {
      console.error('Erreur updateUserRole:', error);
      throw error;
    }
  }
};

// API pour les hôtels
export const hotelApi = {
  // Public : Liste des hôtels avec tri et pagination
  getAllHotels: async ({ page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = {}) => {
    try {
      const response = await axiosInstance.get('/hotels', {
        params: { page, limit, sort, order }
      });
      
      // Normaliser les données pour s'assurer que chaque hôtel a un ID accessible
      if (response.success && response.data) {
        // Transformer les données pour s'assurer que l'ID est accessible via la propriété id
        const normalizedHotels = response.data.map(hotel => {
          // S'assurer que l'hôtel a une propriété id accessible
          // Mongoose utilise _id, mais nous voulons aussi id pour la cohérence
          const normalizedHotel = { ...hotel };
          
          // Si l'hôtel a _id mais pas id, ajouter id
          if (hotel._id && !hotel.id) {
            normalizedHotel.id = hotel._id;
          }
          // Si l'hôtel a id mais pas _id, ajouter _id
          else if (hotel.id && !hotel._id) {
            normalizedHotel._id = hotel.id;
          }
          
          return normalizedHotel;
        });
        
        // Remplacer les données originales par les données normalisées
        response.data = normalizedHotels;
      }
      
      return response;
    } catch (error) {
      console.error('Erreur getAllHotels:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des hôtels',
        status: error.response?.status || 500,
        data: []
      };
    }
  },

  // Public : Détails d'un hôtel
  getHotelById: async (id) => {
    try {
      // Vérifier si l'ID est valide
      if (!id) {
        console.error('Erreur getHotelById: ID d\'hôtel non défini');
        return {
          success: false,
          error: 'ID d\'hôtel non défini',
          status: 400,
          data: null
        };
      }
      
      const response = await axiosInstance.get(`/hotels/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur getHotelById:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement de l\'hôtel',
        status: error.response?.status || 500,
        data: null
      };
    }
  },

  // Employee : Vérifier la disponibilité
  checkAvailability: async (hotelId, checkIn, checkOut) => {
    try {
      const response = await axiosInstance.get('/hotels/search/availability', {
        params: { hotelId, checkIn, checkOut }
      });
      return response;
    } catch (error) {
      console.error('Erreur checkAvailability:', error);
      throw error;
    }
  },

  // Employee : Obtenir les statistiques d'occupation
  getOccupancyStats: async (hotelId, startDate, endDate) => {
    try {
      const response = await axiosInstance.get('/hotels/stats/occupancy', {
        params: { hotelId, startDate, endDate }
      });
      return response;
    } catch (error) {
      console.error('Erreur getOccupancyStats:', error);
      throw error;
    }
  },

  // Employee : Mettre à jour le statut
  updateHotelStatus: async (id, status) => {
    try {
      const response = await axiosInstance.put(`/hotels/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error('Erreur updateHotelStatus:', error);
      throw error;
    }
  },

  // Admin : Créer un hôtel
  createHotel: async (formData) => {
    try {
      // Vérifier que les données essentielles sont présentes
      if (!formData.get('name') || !formData.get('location') || !formData.get('description')) {
        return {
          success: false,
          error: 'Données manquantes pour la création de l\'hôtel',
          status: 400
        };
      }
      
      const response = await axiosInstance.post('/hotels', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Retourner directement les données de la réponse
      return response.data;
    } catch (error) {
      console.error('Erreur createHotel:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Erreur lors de la création de l\'hôtel',
        status: error.response?.status || 500
      };
    }
  },

  // Admin : Mettre à jour un hôtel
  updateHotel: async (id, formData) => {
    try {
      const response = await axiosInstance.put(`/hotels/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Retourner directement les données de la réponse
      return response.data;
    } catch (error) {
      console.error('Erreur updateHotel:', error);
      throw error;
    }
  },

  // Admin : Supprimer un hôtel
  deleteHotel: async (id) => {
    try {
      // Vérification que l'ID est valide
      if (!id) {
        return {
          success: false,
          error: "ID d'hôtel non valide",
          status: 400
        };
      }
      
      const response = await axiosInstance.delete(`/hotels/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur deleteHotel:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erreur lors de la suppression',
        status: error.response?.status || 500
      };
    }
  }
};

// API pour les réservations
export const bookingApi = {
  // User : Obtenir ses réservations
  getUserBookings: async () => {
    try {
      const response = await axiosInstance.get('/bookings/me');
      return response;
    } catch (error) {
      console.error('Erreur getUserBookings:', error);
      throw error;
    }
  },

  // Employee/Admin : Obtenir toutes les réservations
  getAllBookings: async ({ search, status } = {}) => {
    try {
      const response = await axiosInstance.get('/bookings', {
        params: { search, status }
      });
      return response;
    } catch (error) {
      console.error('Erreur getAllBookings:', error);
      throw error;
    }
  },

  // Employee/Admin : Obtenir une réservation par ID
  getBookingById: async (id) => {
    try {
      const response = await axiosInstance.get(`/bookings/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur getBookingById:', error);
      throw error;
    }
  },

  // User : Créer une réservation
  createBooking: async (bookingData) => {
    try {
      console.log('Données de réservation reçues:', bookingData);
      
      // Vérifier que l'ID de l'hôtel est valide
      if (!bookingData.hotelId) {
        console.error('Erreur createBooking: ID d\'hôtel non défini');
        return {
          success: false,
          error: 'ID d\'hôtel non défini ou invalide. Veuillez sélectionner un hôtel valide.',
          status: 400,
          data: null
        };
      }
      
      // Vérifier que les dates sont valides
      if (!bookingData.checkIn || !bookingData.checkOut) {
        return {
          success: false,
          error: 'Dates de réservation manquantes ou invalides.',
          status: 400,
          data: null
        };
      }
      
      // Transformer les données pour correspondre à ce que le backend attend
      const transformedData = {
        // Renommer hotelId en hotel pour le backend
        hotel: bookingData.hotelId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        numberOfGuests: bookingData.numberOfGuests,
        totalPrice: bookingData.totalPrice,
        specialRequests: bookingData.specialRequests
      };
      
      console.log('Données transformées envoyées au backend:', transformedData);
      
      const response = await axiosInstance.post('/bookings', transformedData);
      return response;
    } catch (error) {
      console.error('Erreur createBooking:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la création de la réservation',
        status: error.response?.status || 500,
        data: null
      };
    }
  },

  // User : Mettre à jour sa réservation
  updateBooking: async (id, bookingData) => {
    try {
      const response = await axiosInstance.put(`/bookings/${id}`, bookingData);
      return response;
    } catch (error) {
      console.error('Erreur updateBooking:', error);
      throw error;
    }
  },

  // User : Annuler sa réservation
  cancelBooking: async (id) => {
    try {
      // Double confirmation pour l'annulation
      if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
        const response = await axiosInstance.put(`/bookings/${id}/cancel`);
        return response;
      }
    } catch (error) {
      console.error('Erreur cancelBooking:', error);
      throw error;
    }
  },

  // Admin : Supprimer une réservation
  deleteBooking: async (id) => {
    try {
      // Double confirmation pour la suppression
      if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.')) {
        const response = await axiosInstance.delete(`/bookings/${id}`);
        return response;
      }
    } catch (error) {
      console.error('Erreur deleteBooking:', error);
      throw error;
    }
  }
};

export default {
  auth: authApi,
  users: userApi,
  hotels: hotelApi,
  bookings: bookingApi
};