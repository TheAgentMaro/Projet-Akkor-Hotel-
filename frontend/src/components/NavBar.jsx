import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav>
      <ul>
        <li><Link to="/">Accueil</Link></li>
        <li><Link to="/hotels">Hôtels</Link></li>
        {user && (
          <>
            <li><Link to="/bookings">Réservations</Link></li>
            <li><Link to="/profile">Profil</Link></li>
            {user.role === 'admin' && <li><Link to="/admin-hotels">Administration</Link></li>}
            <li><button onClick={logout}>Déconnexion</button></li>
          </>
        )}
        {!user && (
          <>
            <li><Link to="/login">Connexion</Link></li>
            <li><Link to="/register">Inscription</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
