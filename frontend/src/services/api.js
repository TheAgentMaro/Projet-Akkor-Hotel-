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
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
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
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error) {
      console.error('Erreur login:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Erreur register:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    delete axiosInstance.defaults.headers.common['Authorization'];
  },
};

// API pour les utilisateurs
export const userApi = {
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Erreur getProfile:', error);
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Erreur updateProfile:', error);
      throw error;
    }
  },
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
      // Debug des données envoyées
      for (let [key, value] of formData.entries()) {
        console.log('FormData:', key, value);
      }

      const response = await axiosInstance.post('/hotels', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erreur createHotel:', error.response?.data);
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