import React, { useContext } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requireEmployee = false,
  allowAnonymous = false,
  requireAuth = true
}) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Si la route permet l'accès anonyme, on autorise
  if (allowAnonymous) {
    return children;
  }

  // Si l'utilisateur n'est pas connecté et que l'authentification est requise
  if (!user && requireAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full mx-4">
          <svg 
            className="mx-auto h-12 w-12 text-blue-500 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 15v2m0 0v2m0-2h2m-2 0H8m4-6V4" 
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
          <p className="text-gray-600 mb-6">
            Veuillez vous connecter pour accéder à cette page.
          </p>
          <div className="space-y-4">
            <Link
              to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
              className="block w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Se connecter
            </Link>
            <Link
              to="/"
              className="block w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Vérification des rôles
  const isAdmin = user?.role === 'admin';
  const isEmployee = user?.role === 'employee' || isAdmin; // Admin a aussi les droits employee

  const AccessDenied = ({ message }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full mx-4">
        <svg 
          className="mx-auto h-12 w-12 text-red-500 mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <h2 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Retour à l'accueil
          </Link>
          {user?.role !== 'admin' && (
            <p className="text-sm text-gray-500">
              Si vous pensez qu'il s'agit d'une erreur, contactez un administrateur.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Si la route nécessite un admin
  if (requireAdmin && !isAdmin) {
    return (
      <AccessDenied 
        message="Cette page est réservée aux administrateurs. Votre rôle actuel ne permet pas d'y accéder." 
      />
    );
  }

  // Si la route nécessite un employé
  if (requireEmployee && !isEmployee) {
    return (
      <AccessDenied 
        message="Cette page est réservée aux employés. Votre rôle actuel ne permet pas d'y accéder." 
      />
    );
  }

  return children;
};

export default ProtectedRoute;