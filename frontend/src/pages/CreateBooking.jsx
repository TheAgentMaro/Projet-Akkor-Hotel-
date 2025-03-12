import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { bookingApi, hotelApi } from '../services/api';

const schema = yup.object().shape({
  checkIn: yup
    .date()
    .required('Date d\'arrivée requise')
    .min(new Date(), 'La date d\'arrivée doit être dans le futur'),
  checkOut: yup
    .date()
    .required('Date de départ requise')
    .min(yup.ref('checkIn'), 'La date de départ doit être après la date d\'arrivée'),
  numberOfGuests: yup
    .number()
    .required('Nombre de personnes requis')
    .min(1, 'Minimum 1 personne')
    .max(10, 'Maximum 10 personnes'),
  specialRequests: yup
    .string()
    .max(500, 'Maximum 500 caractères')
});

function CreateBooking() {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      checkIn: '',
      checkOut: '',
      numberOfGuests: 1,
      specialRequests: ''
    }
  });

  const checkIn = watch('checkIn');
  const checkOut = watch('checkOut');
  const numberOfGuests = watch('numberOfGuests');

  useEffect(() => {
    const loadHotel = async () => {
      try {
        setLoading(true);
        const response = await hotelApi.getHotelById(hotelId);
        if (response.success) {
          setHotel(response.data);
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Erreur lors du chargement de l\'hôtel');
      } finally {
        setLoading(false);
      }
    };

    if (hotelId) {
      loadHotel();
    }
  }, [hotelId]);

  useEffect(() => {
    if (hotel && checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const price = hotel.price * nights * numberOfGuests;
      setTotalPrice(price);
    }
  }, [hotel, checkIn, checkOut, numberOfGuests]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError('');

      const bookingData = {
        hotelId,
        ...data,
        totalPrice
      };

      const response = await bookingApi.createBooking(bookingData);
      
      if (response.success) {
        navigate('/bookings');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la création de la réservation');
    } finally {
      setIsSubmitting(false);
    }
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
            onClick={() => navigate('/hotels')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retour aux hôtels
          </button>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-yellow-50 rounded-lg">
          <p className="text-yellow-600 font-semibold">Hôtel non trouvé</p>
          <button
            onClick={() => navigate('/hotels')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retour aux hôtels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Réserver - {hotel.name}</h1>
          <p className="text-gray-600">{hotel.location}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'arrivée
                </label>
                <input
                  type="date"
                  {...register('checkIn')}
                  className="w-full border rounded-md p-2"
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.checkIn && (
                  <p className="mt-1 text-sm text-red-600">{errors.checkIn.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de départ
                </label>
                <input
                  type="date"
                  {...register('checkOut')}
                  className="w-full border rounded-md p-2"
                  min={checkIn || new Date().toISOString().split('T')[0]}
                />
                {errors.checkOut && (
                  <p className="mt-1 text-sm text-red-600">{errors.checkOut.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de personnes
              </label>
              <input
                type="number"
                {...register('numberOfGuests')}
                className="w-full border rounded-md p-2"
                min="1"
                max="10"
              />
              {errors.numberOfGuests && (
                <p className="mt-1 text-sm text-red-600">{errors.numberOfGuests.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demandes spéciales
              </label>
              <textarea
                {...register('specialRequests')}
                className="w-full border rounded-md p-2 h-32"
                placeholder="Ex: Chambre non-fumeur, lit supplémentaire..."
              />
              {errors.specialRequests && (
                <p className="mt-1 text-sm text-red-600">{errors.specialRequests.message}</p>
              )}
            </div>

            {totalPrice > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Prix total</span>
                  <span className="text-2xl font-bold text-blue-600">{totalPrice}€</span>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/hotels')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-md text-white ${
                  isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isSubmitting ? 'Réservation en cours...' : 'Confirmer la réservation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateBooking;
