import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { userApi } from '../services/api';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await userApi.getProfile();
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        }
      }
      setIsLoading(false);
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    // Fermer le menu mobile lors du changement de route
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    navigate('/login');
  };

  const navigationItems = [
    { path: '/', label: 'Accueil', public: true },
    { path: '/hotels', label: 'Hôtels', public: true },
    { path: '/bookings', label: 'Réservations', public: false },
    { path: '/profile', label: 'Profil', public: false },
    { path: '/admin-hotels', label: 'Administration', adminOnly: true }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white shadow-lg">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <span className="font-bold text-2xl">Akkor Hotel</span>
            </Link>

            {/* Menu Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => {
                if (item.adminOnly && user?.role !== 'admin') return null;
                if (!item.public && !user) return null;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-white hover:text-blue-200 transition duration-150 ${
                      location.pathname === item.path ? 'border-b-2' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              
              {user ? (
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-150"
                >
                  Déconnexion
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition duration-150"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-150"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>

            {/* Menu Mobile Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-blue-700 transition duration-150"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Menu Mobile */}
          <div
            className={`md:hidden ${
              isMobileMenuOpen ? 'block' : 'hidden'
            } pt-4 pb-3 space-y-2`}
          >
            {navigationItems.map((item) => {
              if (item.adminOnly && user?.role !== 'admin') return null;
              if (!item.public && !user) return null;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-3 py-2 rounded-md text-white hover:bg-blue-700 transition duration-150"
                >
                  {item.label}
                </Link>
              );
            })}
            
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-white hover:bg-red-600 rounded-md transition duration-150"
              >
                Déconnexion
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md transition duration-150"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md transition duration-150"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto p-6">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-white mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">À propos</h3>
              <p className="text-gray-400">
                Akkor Hotel vous offre le meilleur confort pour vos séjours partout dans le monde.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/hotels" className="text-gray-400 hover:text-white transition duration-150">
                    Nos hôtels
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white transition duration-150">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400">
                Email: contact@akkor-hotel.com<br />
                Téléphone: +33 1 23 45 67 89
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p> 2025 Akkor Hotel. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
