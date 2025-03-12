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
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          // Configurer le token dans Axios
          const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
          
          // Vérifier si l'utilisateur est toujours valide
          const response = await userApi.getProfile();
          
          if (response.success && response.data) {
            const userData = response.data;
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            // Si la réponse n'est pas valide, nettoyer le stockage
            handleLogout('Session expirée');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        handleLogout('Erreur de connexion');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogout = (errorMessage = null) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setError(errorMessage);

    // Redirection avec message d'erreur si nécessaire
    if (errorMessage) {
      window.location.href = `/login?error=${encodeURIComponent(errorMessage)}`;
    } else {
      window.location.href = '/login';
    }
  };

  const login = async (userData, token) => {
    try {
      const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      localStorage.setItem('token', tokenWithBearer);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      setError(null);

      // Redirection intelligente selon le rôle
      const redirectPath = localStorage.getItem('redirectPath') || '/';
      localStorage.removeItem('redirectPath');
      window.location.href = redirectPath;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError('Erreur lors de la connexion');
      handleLogout();
      throw error;
    }
  };

  // Obtenir le chemin par défaut selon le rôle
  const getRoleDefaultPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'employee':
        return '/employee/dashboard';
      default:
        return '/';
    }
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    if (!user) return false;
    if (role === 'admin') return user.role === 'admin';
    if (role === 'employee') return ['admin', 'employee'].includes(user.role);
    return true;
  };

  // Vérifier si l'utilisateur peut accéder à une ressource
  const canAccess = (resourceId) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'employee') return true;
    return user.id === resourceId;
  };

  // Composant de chargement avec style adaptatif
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Chargement de votre session...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout: handleLogout, 
      loading,
      error,
      isAuthenticated,
      hasRole,
      canAccess,
      // Ajouter des badges de rôle avec code couleur
      roleBadgeColor: user ? {
        admin: 'bg-red-100 text-red-800',
        employee: 'bg-blue-100 text-blue-800',
        user: 'bg-green-100 text-green-800'
      }[user.role] : '',
      roleLabel: user ? {
        admin: 'Administrateur',
        employee: 'Employé',
        user: 'Utilisateur'
      }[user.role] : ''
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;