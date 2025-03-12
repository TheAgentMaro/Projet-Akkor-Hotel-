import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../services/api';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/bookings/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((response) => {
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

  const handleCancel = async (bookingId) => {
    try {
      const confirmCancel = window.confirm('Voulez-vous annuler cette réservation ?');
      if (!confirmCancel) return;

      await bookingApi.cancelBooking(bookingId);
      setBookings(bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
    } catch (err) {
      setError('Échec de l’annulation');
    }
  };

  const handleEdit = (bookingId) => {
    navigate(`/create-booking?edit=${bookingId}`);
  };

  if (loading) return <div className="text-gray-700">Chargement...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mes Réservations</h1>
      <button
        onClick={() => navigate('/create-booking')}
        className="bg-green-500 text-white p-2 rounded mb-4 hover:bg-green-600"
      >
        Nouvelle réservation
      </button>
      <ul className="space-y-4">
        {bookings.map((booking) => (
          <li key={booking.id} className="bg-white p-4 rounded shadow">
            <p className="text-gray-700">
              <span className="font-semibold">Hôtel :</span> {booking.hotel?.name}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Date d'arrivée :</span>{' '}
              {new Date(booking.checkIn).toLocaleDateString()}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Date de départ :</span>{' '}
              {new Date(booking.checkOut).toLocaleDateString()}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Statut :</span> {booking.status}
            </p>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => handleEdit(booking.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Modifier
              </button>
              <button
                onClick={() => handleCancel(booking.id)}
                disabled={booking.status === 'cancelled'}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Bookings;
