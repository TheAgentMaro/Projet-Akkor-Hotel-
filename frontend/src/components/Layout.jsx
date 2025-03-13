import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);

  const navigationItems = [
    { path: '/', label: 'Accueil', public: true },
    { path: '/hotels', label: 'Hôtels', public: true },
    { path: '/bookings', label: 'Mes Réservations', private: true },
    { path: '/profile', label: 'Mon Profil', private: true },
    { path: '/admin/hotels', label: 'Gestion Hôtels', role: 'admin' },
    { path: '/admin/users', label: 'Gestion Utilisateurs', role: 'admin' },
    { path: '/admin/bookings', label: 'Gestion Réservations', role: ['admin', 'employee'] },
    { path: '/employee/users', label: 'Recherche Utilisateurs', role: ['admin', 'employee'] }
  ];

  const renderNavItems = () => {
    return navigationItems.map((item) => {
      // Items publics (toujours visibles)
      if (item.public) {
        return renderNavLink(item);
      }

      // Vérifier si l'utilisateur est connecté
      if (!user) return null;

      // Items privés (visibles uniquement si connecté)
      if (item.private) {
        return renderNavLink(item);
      }

      // Items basés sur les rôles
      if (item.role) {
        const roles = Array.isArray(item.role) ? item.role : [item.role];
        if (roles.includes(user.role)) {
          return renderNavLink(item);
        }
      }

      return null;
    });
  };

  const renderNavLink = (item) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium ${
          isActive
            ? 'bg-blue-700 text-white'
            : 'text-white hover:bg-blue-500 transition-colors duration-200'
        }`
      }
    >
      {item.label}
    </NavLink>
  );

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsConfirmingLogout(false);
  }, [location.pathname]);

  const handleLogout = () => {
    if (!isConfirmingLogout) {
      setIsConfirmingLogout(true);
      return;
    }
    logout();
    navigate('/login');
    setIsConfirmingLogout(false);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'employee':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">Akkor Hotel</span>
            </Link>

            {/* Navigation Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {renderNavItems()}
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{user.pseudo}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isConfirmingLogout
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {isConfirmingLogout ? 'Confirmer la déconnexion' : 'Déconnexion'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-700 text-white'
                          : 'bg-white text-blue-600 hover:bg-blue-50'
                      }`
                    }
                  >
                    Connexion
                  </NavLink>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-700 text-white'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`
                    }
                  >
                    Inscription
                  </NavLink>
                </div>
              )}
            </div>

            {/* Menu Mobile Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-white hover:bg-blue-700 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Menu Mobile */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-blue-500 py-2 space-y-1">
              {renderNavItems()}
              {user ? (
                <div className="border-t border-blue-500 pt-2 mt-2 space-y-2">
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{user.pseudo}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-3 py-2 text-white rounded-md transition-colors duration-200 ${
                      isConfirmingLogout
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'hover:bg-blue-700'
                    }`}
                  >
                    {isConfirmingLogout ? 'Confirmer la déconnexion' : 'Déconnexion'}
                  </button>
                </div>
              ) : (
                <div className="border-t border-blue-500 pt-2 mt-2 space-y-2">
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-sm font-medium ${
                        isActive ? 'bg-blue-700' : 'hover:bg-blue-700'
                      }`
                    }
                  >
                    Connexion
                  </NavLink>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-sm font-medium ${
                        isActive ? 'bg-blue-700' : 'hover:bg-blue-700'
                      }`
                    }
                  >
                    Inscription
                  </NavLink>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1 py-6">
        {children}
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Akkor Hotel</h3>
              <p className="text-gray-400">
                Votre destination de confiance pour des séjours inoubliables.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/hotels" className="text-gray-400 hover:text-white">
                    Nos hôtels
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link to="/bookings" className="text-gray-400 hover:text-white">
                      Mes réservations
                    </Link>
                  </li>
                )}
                <li>
                  <Link to="/profile" className="text-gray-400 hover:text-white">
                    Mon compte
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: contact@akkor-hotel.com</li>
                <li>Téléphone: +33 1 23 45 67 89</li>
                <li>Adresse: 123 Rue de l'Hôtel, Paris</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Akkor Hotel. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;