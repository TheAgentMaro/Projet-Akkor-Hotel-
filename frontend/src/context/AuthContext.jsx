import React, { createContext, useState, useEffect } from 'react';
import { userApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await userApi.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
  
    initializeAuth();
  }, []);

  const login = (userData, token) => {
    if (!userData || !token) {
      console.error('Données de connexion invalides');
      return;
    }
    localStorage.setItem('token', token);
    setUser(userData);
    console.log('Utilisateur connecté:', userData); // Pour déboguer
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;