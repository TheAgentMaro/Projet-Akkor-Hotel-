// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Configuration d'Axios avec le token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Assurez-vous que le format est correct
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// API pour l'authentification
export const authApi = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// API pour les utilisateurs
export const userApi = {
  getProfile: async () => {
    const response = await axios.get(`${API_URL}/users/profile`);
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await axios.put(`${API_URL}/users/profile`, userData);
    return response.data;
  },
};

// API pour les hôtels
export const hotelApi = {
  getAllHotels: async ({ page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = {}) => {
    const response = await axios.get(`${API_URL}/hotels`, {
      params: { page, limit, sort, order }
    });
    return response.data;
  },

  getHotelById: async (id) => {
    const response = await axios.get(`${API_URL}/hotels/${id}`);
    return response.data;
  },

  createHotel: async (formData) => {
    const response = await axios.post(`${API_URL}/hotels`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  updateHotel: async (id, formData) => {
    const response = await axios.put(`${API_URL}/hotels/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  deleteHotel: async (id) => {
    const response = await axios.delete(`${API_URL}/hotels/${id}`);
    return response.data;
  },
};

// API pour les réservations
export const bookingApi = {
  getAllBookings: async () => {
    const response = await axios.get(`${API_URL}/bookings`);
    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await axios.post(`${API_URL}/bookings`, bookingData);
    return response.data;
  },

  updateBooking: async (id, bookingData) => {
    const response = await axios.put(`${API_URL}/bookings/${id}`, bookingData);
    return response.data;
  },

  deleteBooking: async (id) => {
    const response = await axios.delete(`${API_URL}/bookings/${id}`);
    return response.data;
  },
};