import React, { createContext, useState, useEffect } from 'react';
import { userApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await userApi.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(response.data));
          } else {
            // Si la réponse n'est pas valide, nettoyer le stockage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
          setError(error.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };
  
    initializeAuth();
  }, []);

  const login = async (userData, token) => {
    try {
      // Ajouter le préfixe Bearer si nécessaire
      const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      localStorage.setItem('token', tokenWithBearer);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError('Erreur lors de la connexion');
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
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