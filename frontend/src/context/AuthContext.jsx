import React, { createContext, useState, useEffect } from 'react';
import { userApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Configurer le token dans Axios
          const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
          
          // Vérifier si l'utilisateur est toujours valide
          const response = await userApi.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(response.data));
          } else {
            // Si la réponse n'est pas valide, nettoyer le stockage
            handleLogout();
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
          setError(error.message);
          handleLogout();
        }
      } else {
        handleLogout();
      }
      setLoading(false);
    };
  
    initializeAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const login = async (userData, token) => {
    try {
      // Ajouter le préfixe Bearer si nécessaire
      const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      // Stocker les informations d'authentification
      localStorage.setItem('token', tokenWithBearer);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Mettre à jour l'état
      setUser(userData);
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError('Erreur lors de la connexion');
      handleLogout();
      throw error;
    }
  };

  const logout = () => {
    handleLogout();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      error,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;