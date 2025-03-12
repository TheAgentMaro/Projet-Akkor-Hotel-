import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { hotelApi } from '../services/api';
import AuthContext from '../context/AuthContext';

function Hotels() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadHotels();
  }, [currentPage]);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelApi.getAllHotels({
        page: currentPage,
        limit: 10,
        sort: 'createdAt',
        order: 'desc'
      });

      if (response.success) {
        setHotels(response.data);
        setTotalPages(Math.ceil(response.total / 10));
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors du chargement des hôtels');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = (hotelId) => {
    if (!user) {
      navigate('/login', { state: { from: `/hotels/${hotelId}` } });
      return;
    }
    navigate(`/bookings/create/${hotelId}`);
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
            onClick={loadHotels}
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
        <h1 className="text-3xl font-bold text-gray-800">Nos Hôtels</h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin/hotels')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Gérer les hôtels
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel, index) => (
          <div key={`hotel-${hotel._id || index}`} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {hotel.images && hotel.images.length > 0 && (
              <img
                key={`hotel-img-${hotel._id || index}`}
                src={`${import.meta.env.VITE_API_URL}/uploads/${hotel.images[0]}`}
                alt={hotel.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{hotel.name}</h2>
              <p className="text-gray-600 mb-2">{hotel.location}</p>
              <p className="text-gray-700 mb-4 line-clamp-3">{hotel.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-blue-600">{hotel.price}€ / nuit</span>
                <button
                  onClick={() => handleBooking(hotel._id)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Réserver
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Précédent
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}

export default Hotels;
