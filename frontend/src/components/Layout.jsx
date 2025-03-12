import React, { useContext, useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  console.log('État utilisateur dans Layout:', user); // Pour déboguer

  const navigationItems = [
    { path: '/', label: 'Accueil', public: true },
    { path: '/hotels', label: 'Hôtels', public: true },
    { path: '/bookings', label: 'Réservations', private: true },
    { path: '/profile', label: 'Profil', private: true },
    { path: '/admin-hotels', label: 'Administration', adminOnly: true },
  ];

  const renderNavItems = () => {
    return navigationItems.map((item) => {
      // Items publics (toujours visibles)
      if (item.public) {
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-white hover:bg-blue-500'
              }`
            }
          >
            {item.label}
          </NavLink>
        );
      }

      // Items privés (visibles uniquement si connecté)
      if (item.private && user) {
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-white hover:bg-blue-500'
              }`
            }
          >
            {item.label}
          </NavLink>
        );
      }

      // Items admin (visibles uniquement si l'utilisateur est admin)
      if (item.adminOnly && user?.role === 'admin') {
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-white hover:bg-blue-500'
              }`
            }
          >
            {item.label}
          </NavLink>
        );
      }

      return null;
    });
  };

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="font-bold text-xl">
              Akkor Hotel
            </Link>

            {/* Navigation Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {renderNavItems()}
              
              {user ? (
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                >
                  Déconnexion
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-md text-sm font-medium ${
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
                      `px-4 py-2 rounded-md text-sm font-medium ${
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
              className="md:hidden p-2 rounded-md text-white hover:bg-blue-700"
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
            <div className="md:hidden border-t border-blue-500 py-2">
              {renderNavItems()}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-white hover:bg-blue-700 rounded-md mt-2"
                >
                  Déconnexion
                </button>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-sm font-medium mt-2 ${
                        isActive
                          ? 'bg-blue-700 text-white'
                          : 'text-white hover:bg-blue-500'
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Connexion
                  </NavLink>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-sm font-medium mt-2 ${
                        isActive
                          ? 'bg-blue-700 text-white'
                          : 'text-white hover:bg-blue-500'
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Inscription
                  </NavLink>
                </>
              )}
            </div>
          )}
        </nav>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;