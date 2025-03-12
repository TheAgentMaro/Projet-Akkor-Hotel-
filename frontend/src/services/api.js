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
      // Ne pas ajouter "Bearer" si c'est déjà présent
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
axiosInstance.interceptors.response.use(
  (response) => {
    // Standardiser la structure de la réponse
    const standardResponse = {
      success: true,
      data: response.data.data,
      token: response.data.token,
      message: response.data.message
    };

    // Si la réponse n'a pas de data.data mais a un data, utiliser data directement
    if (!response.data.data && response.data) {
      standardResponse.data = response.data;
    }

    return standardResponse;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
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
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      
      // La réponse est déjà standardisée par l'intercepteur
      return response;
    } catch (error) {
      console.error('Erreur login:', error);
      throw error;
    }
  },

  register: async (email, pseudo, password) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        email,
        pseudo,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Erreur register:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axiosInstance.defaults.headers.common['Authorization'];
  },
};

// API pour les utilisateurs
export const userApi = {
  // Obtenir son propre profil
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Erreur getProfile:', error);
      throw error;
    }
  },

  // Mettre à jour son profil
  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Erreur updateProfile:', error);
      throw error;
    }
  },

  // Supprimer son compte
  deleteAccount: async () => {
    try {
      const response = await axiosInstance.delete('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Erreur deleteAccount:', error);
      throw error;
    }
  },

  // Admin : Obtenir la liste des utilisateurs
  getAllUsers: async () => {
    try {
      const response = await axiosInstance.get('/users');
      return response.data;
    } catch (error) {
      console.error('Erreur getAllUsers:', error);
      throw error;
    }
  },

  // Admin : Obtenir un utilisateur par ID
  getUserById: async (userId) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getUserById:', error);
      throw error;
    }
  },

  // Admin : Mettre à jour le rôle d'un utilisateur
  updateUserRole: async (userId, role) => {
    try {
      const response = await axiosInstance.patch(`/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Erreur updateUserRole:', error);
      throw error;
    }
  },

  // Employee : Rechercher des utilisateurs
  searchUsers: async (query) => {
    try {
      const response = await axiosInstance.get('/users/search', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur searchUsers:', error);
      throw error;
    }
  }
};

// API pour les hôtels
export const hotelApi = {
  getAllHotels: async ({ page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = {}) => {
    try {
      const response = await axiosInstance.get('/hotels', {
        params: { page, limit, sort, order }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur getAllHotels:', error);
      throw error;
    }
  },

  getHotelById: async (id) => {
    try {
      const response = await axiosInstance.get(`/hotels/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getHotelById:', error);
      throw error;
    }
  },

  createHotel: async (formData) => {
    try {
      const response = await axiosInstance.post('/hotels', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur createHotel:', error);
      throw error;
    }
  },

  updateHotel: async (id, formData) => {
    try {
      const response = await axiosInstance.put(`/hotels/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur updateHotel:', error);
      throw error;
    }
  },

  deleteHotel: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hotels/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur deleteHotel:', error);
      throw error;
    }
  },
};

// API pour les réservations
export const bookingApi = {
  getAllBookings: async () => {
    try {
      const response = await axiosInstance.get('/bookings');
      return response.data;
    } catch (error) {
      console.error('Erreur getAllBookings:', error);
      throw error;
    }
  },

  getBookingById: async (id) => {
    try {
      const response = await axiosInstance.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getBookingById:', error);
      throw error;
    }
  },

  createBooking: async (bookingData) => {
    try {
      const response = await axiosInstance.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Erreur createBooking:', error);
      throw error;
    }
  },

  updateBooking: async (id, bookingData) => {
    try {
      const response = await axiosInstance.put(`/bookings/${id}`, bookingData);
      return response.data;
    } catch (error) {
      console.error('Erreur updateBooking:', error);
      throw error;
    }
  },

  deleteBooking: async (id) => {
    try {
      const response = await axiosInstance.delete(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur deleteBooking:', error);
      throw error;
    }
  },
};