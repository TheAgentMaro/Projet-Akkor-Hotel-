import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-500 text-white p-4">
        <nav className="container mx-auto flex justify-between">
          <div className="font-bold">Akkor Hotel</div>
          <ul className="flex space-x-4">
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/hotels">Hôtels</Link></li>
            <li><Link to="/bookings">Réservations</Link></li>
            <li><Link to="/profile">Profil</Link></li>
          </ul>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
      <footer className="bg-gray-200 text-center p-4">
        © 2025 Akkor Hotel. Tous droits réservés.
      </footer>
    </div>
  );
};

export default Layout;
