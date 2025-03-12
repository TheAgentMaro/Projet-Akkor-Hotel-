import axios from 'axios';

// On définit l'URL de base ; à adapter selon l’adresse de votre backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Crée une instance Axios pour tous nos appels
const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT dans les headers
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Récupère le token stocké
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Authentification
 */
const authApi = {
  register: async (email, pseudo, password) => {
    const response = await apiInstance.post('/auth/register', { email, pseudo, password });
    return response.data; // { success, data, token }
  },
  login: async (email, password) => {
    const response = await apiInstance.post('/auth/login', { email, password });
    return response.data; // { success, data, token }
  },
  logout: async () => {
    // On tente d’appeler l’endpoint de logout si besoin
    const response = await apiInstance.post('/auth/logout');
    return response.data; // { success, message }
  },
};

/**
 * User - gestion du profil
 */
const userApi = {
  getProfile: async () => {
    // Récupère le profil de l’utilisateur courant
    const response = await apiInstance.get('/users/profile');
    return response.data; // { success, data: { email, pseudo, ... } }
  },
  updateUser: async (userId, updatePayload) => {
    // Met à jour le profil de l’utilisateur
    const response = await apiInstance.put(`/users/${userId}`, updatePayload);
    return response.data; // { success, data: { ... } }
  },
  deleteUser: async (userId) => {
    // Supprime le compte de l’utilisateur
    const response = await apiInstance.delete(`/users/${userId}`);
    return response.data; // { success, message }
  },
};

/**
 * Bookings - gestion des réservations
 */
const bookingApi = {
  createBooking: async (payload) => {
    const response = await apiInstance.post('/bookings', payload);
    return response.data; // { success, data: { ... } }
  },
  updateBooking: async (bookingId, payload) => {
    const response = await apiInstance.put(`/bookings/${bookingId}`, payload);
    return response.data; // { success, data: { ... } }
  },
  cancelBooking: async (bookingId) => {
    const response = await apiInstance.put(`/bookings/${bookingId}/cancel`);
    return response.data; // { success, data: { ... } }
  },
};

/**
 * Hotel
 */

const hotelApi = {
  // Liste des hôtels
  getAllHotels: async () => {
    const response = await apiInstance.get('/hotels');
    return response.data; // { success, data: [...], pagination... }
  },
  // Créer un hôtel (POST /api/hotels)
  createHotel: async (hotelPayload) => {
    const response = await apiInstance.post('/hotels', hotelPayload);
    return response.data; // { success, data: {...} }
  },
  // Mettre à jour un hôtel (PUT /api/hotels/:id)
  updateHotel: async (hotelId, updatePayload) => {
    const response = await apiInstance.put(`/hotels/${hotelId}`, updatePayload);
    return response.data; // { success, data: {...} }
  },
  // Supprimer un hôtel (DELETE /api/hotels/:id)
  deleteHotel: async (hotelId) => {
    const response = await apiInstance.delete(`/hotels/${hotelId}`);
    return response.data; // { success, message: ... }
  },
};

export { authApi, userApi, bookingApi, hotelApi };
