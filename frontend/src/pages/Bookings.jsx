import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../services/api';
import AuthContext from '../context/AuthContext';

function Bookings() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      let response;
      
      // Utiliser la fonction appropriée selon le rôle de l'utilisateur
      if (user.role === 'admin' || user.role === 'employee') {
        // Pour les admins et employés : toutes les réservations
        response = await bookingApi.getAllBookings();
      } else {
        // Pour les utilisateurs normaux : uniquement leurs réservations
        response = await bookingApi.getUserBookings();
      }
      
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      if (!isDeleting) {
        setIsDeleting(true);
        return;
      }

      const response = await bookingApi.deleteBooking(bookingId);
      if (response.success) {
        setBookings(bookings.filter(booking => booking._id !== bookingId));
        setIsDeleting(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de l\'annulation');
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  
  // Fonction pour extraire et formater l'ID de réservation de manière sécurisée
  const getBookingDisplayId = (booking) => {
    if (!booking) return 'N/A';
    
    // Vérifier les différentes façons dont l'ID peut être stocké
    const bookingId = booking._id || booking.id || booking.bookingId;
    
    if (!bookingId) return 'ID-???';
    
    // S'assurer que l'ID est une chaîne de caractères avant d'appeler slice
    const idString = String(bookingId);
    return idString.slice(-6); // Afficher les 6 derniers caractères de l'ID
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={loadBookings}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {user?.role === 'admin' ? 'Toutes les Réservations' : 'Mes Réservations'}
        </h1>
        <button
          onClick={() => navigate('/hotels')}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Nouvelle réservation
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">
            Aucune réservation trouvée.{' '}
            <span className="text-blue-500 cursor-pointer" onClick={() => navigate('/hotels')}>
              Réserver maintenant
            </span>
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {booking.hotel?.name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">
                    Réservation #{getBookingDisplayId(booking)}
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    {booking.totalPrice ? `${booking.totalPrice}€` : 'Prix non disponible'}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-600">Check-in</p>
                  <p className="font-semibold">{formatDate(booking.checkIn)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Check-out</p>
                  <p className="font-semibold">{formatDate(booking.checkOut)}</p>
                </div>
              </div>

              {booking.status !== 'cancelled' && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleCancel(booking._id)}
                    className={`px-4 py-2 rounded ${
                      isDeleting
                        ? 'bg-red-600 text-white'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {isDeleting ? 'Confirmer l\'annulation' : 'Annuler'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookings;
