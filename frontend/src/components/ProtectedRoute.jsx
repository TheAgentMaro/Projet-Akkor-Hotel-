import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requireEmployee = false,
  allowAnonymous = false 
}) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Si la route permet l'accès anonyme, on autorise
  if (allowAnonymous) {
    return children;
  }

  // Si l'utilisateur n'est pas connecté
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Vérification des rôles
  const isAdmin = user.role === 'admin';
  const isEmployee = user.role === 'employee' || isAdmin; // Admin a aussi les droits employee

  // Si la route nécessite un admin
  if (requireAdmin && !isAdmin) {
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

  // Si la route nécessite un employé
  if (requireEmployee && !isEmployee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h2>
          <p className="text-gray-600 mb-4">Cette page est réservée aux employés.</p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;