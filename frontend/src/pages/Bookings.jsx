import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/bookings/me`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      .then(response => {
        if (response.data.success) {
          setBookings(response.data.data);
        } else {
          setError('Erreur lors du chargement des réservations');
        }
      })
      .catch(() => {
        setError('Erreur lors du chargement des réservations');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Mes Réservations</h1>
      <ul>
        {bookings.map(booking => (
          <li key={booking.id}>
            <p>Hôtel : {booking.hotel?.name}</p>
            <p>Date d'arrivée : {new Date(booking.checkIn).toLocaleDateString()}</p>
            <p>Date de départ : {new Date(booking.checkOut).toLocaleDateString()}</p>
            <p>Statut : {booking.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Bookings;
