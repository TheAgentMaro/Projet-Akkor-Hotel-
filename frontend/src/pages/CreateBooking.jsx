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
        setError('');
        
        // Vérifier si l'ID de l'hôtel est valide
        if (!hotelId || hotelId === 'undefined') {
          setError('ID d\'hôtel non spécifié ou invalide. Veuillez retourner à la liste des hôtels et sélectionner un hôtel valide.');
          console.error('ID d\'hôtel invalide ou non spécifié:', hotelId);
          return;
        }
        
        console.log('Chargement de l\'hôtel avec ID:', hotelId);
        const response = await hotelApi.getHotelById(hotelId);
        
        if (response.success) {
          setHotel(response.data);
          console.log('Hôtel chargé avec succès:', response.data);
        } else {
          // Gérer l'erreur retournée par l'API
          setError(response.error || 'Erreur lors du chargement de l\'hôtel');
          console.error('Erreur API lors du chargement de l\'hôtel:', response.error);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'hôtel:', error);
        setError('Erreur lors du chargement de l\'hôtel. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    // Lancer le chargement de l'hôtel
    loadHotel();
  }, [hotelId]);

  useEffect(() => {
    if (hotel && checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      // Vérifier si hotel.price existe, sinon utiliser une valeur par défaut
      // Cela est nécessaire car le modèle Hotel ne contient pas de champ price
      const basePrice = hotel.price || 100; // Prix par défaut de 100 par nuit
      console.log('Prix de base utilisé:', basePrice, 'Nuits:', nights, 'Invités:', numberOfGuests);
      
      const price = basePrice * nights * numberOfGuests;
      console.log('Prix total calculé:', price);
      setTotalPrice(price);
    }
  }, [hotel, checkIn, checkOut, numberOfGuests]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError('');

      // Vérifier que l'ID de l'hôtel est valide avant de soumettre
      if (!hotelId) {
        setError('ID d\'hôtel non spécifié. Veuillez sélectionner un hôtel valide.');
        return;
      }
      
      // S'assurer que le prix total est un nombre valide
      const finalPrice = parseFloat(totalPrice) || 0;
      if (finalPrice <= 0) {
        console.warn('Prix total invalide ou nul:', totalPrice, 'Utilisation d\'un prix par défaut');
        // Calculer un prix par défaut si le prix est invalide
        const start = new Date(data.checkIn);
        const end = new Date(data.checkOut);
        const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        const defaultPrice = 100 * nights * data.numberOfGuests;
        setTotalPrice(defaultPrice);
      }

      const bookingData = {
        hotelId,
        ...data,
        totalPrice: finalPrice > 0 ? finalPrice : 100 * Math.max(1, Math.ceil((new Date(data.checkOut) - new Date(data.checkIn)) / (1000 * 60 * 60 * 24))) * data.numberOfGuests
      };
      
      console.log('Données de réservation envoyées:', bookingData);

      const response = await bookingApi.createBooking(bookingData);
      
      if (response.success) {
        // Redirection avec message de succès
        navigate('/bookings', { 
          state: { 
            successMessage: 'Réservation créée avec succès!',
            bookingId: response.data?._id 
          } 
        });
      } else {
        // Afficher l'erreur retournée par l'API
        setError(response.error || 'Erreur lors de la création de la réservation');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      setError('Une erreur est survenue lors de la création de la réservation. Veuillez réessayer plus tard.');
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
        <div className="text-center p-8 bg-red-50 rounded-lg shadow-md max-w-md w-full">
          <svg className="h-12 w-12 text-red-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-red-700 mb-2">Erreur</h2>
          <p className="text-red-600 mb-4">{error}</p>
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
