import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  console.log('Protected Route - User:', user); // Pour déboguer
  console.log('Protected Route - Required Admin:', requireAdmin); // Pour déboguer

  // Si l'utilisateur n'est pas connecté
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Si la route nécessite un admin et que l'utilisateur n'est pas admin
  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h2>
          <p className="text-gray-600 mb-4">Cette page est réservée aux administrateurs.</p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;