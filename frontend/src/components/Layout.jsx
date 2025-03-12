import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
  const role = localStorage.getItem('role');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow">
        <nav className="container mx-auto flex justify-between items-center">
          <div className="font-bold text-xl">Akkor Hotel</div>
          <ul className="flex space-x-6">
            <li>
              <Link className="hover:underline" to="/">
                Accueil
              </Link>
            </li>
            <li>
              <Link className="hover:underline" to="/hotels">
                Hôtels
              </Link>
            </li>
            <li>
              <Link className="hover:underline" to="/bookings">
                Réservations
              </Link>
            </li>
            <li>
              <Link className="hover:underline" to="/profile">
                Profil
              </Link>
            </li>
            {role === 'admin' && (
              <li>
                <Link className="hover:underline" to="/admin-hotels">
                  Administration
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </header>

      <main className="flex-grow container mx-auto p-6">
        <Outlet />
      </main>

      <footer className="bg-gray-200 text-center p-4 text-gray-700">
        © 2025 Akkor Hotel. Tous droits réservés.
      </footer>
    </div>
  );
};

export default Layout;
