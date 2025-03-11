import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import axios from 'axios';
import { bookingApi } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

function CreateBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editBookingId = searchParams.get('edit');

  const [hotels, setHotels] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validationSchema = Yup.object().shape({
    hotel: Yup.string().required('Choisissez un hôtel'),
    checkIn: Yup.date().required('Date arrivée requise'),
    checkOut: Yup.date().required('Date départ requise'),
    numberOfGuests: Yup.number().min(1, 'Minimum 1').required('Nombre de personnes requis'),
    totalPrice: Yup.number().min(0, 'Le prix ne peut pas être négatif').required('Prix requis'),
    specialRequests: Yup.string().max(500, 'Max 500 caractères').optional()
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      hotel: '',
      checkIn: '',
      checkOut: '',
      numberOfGuests: 1,
      totalPrice: 0,
      specialRequests: ''
    },
  });

  // Charger la liste des hôtels
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/hotels`)
      .then((res) => {
        if (res.data.success) {
          setHotels(res.data.data);
        }
      })
      .catch(() => {
        setErrorMessage('Erreur lors du chargement des hôtels.');
      });
  }, []);

  // Charger la réservation existante si on est en mode édition
  useEffect(() => {
    async function fetchBooking() {
      try {
        if (editBookingId) {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/bookings/${editBookingId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          if (response.data.success) {
            const booking = response.data.data;
            setValue('hotel', booking.hotel? booking.hotel._id : '');
            setValue('checkIn', booking.checkIn.split('T')[0]);
            setValue('checkOut', booking.checkOut.split('T')[0]);
            setValue('numberOfGuests', booking.numberOfGuests);
            setValue('totalPrice', booking.totalPrice);
            setValue('specialRequests', booking.specialRequests || '');
          }
        }
      } catch (error) {
        setErrorMessage('Erreur lors du chargement de la réservation à éditer.');
      }
    }
    fetchBooking();
  }, [editBookingId, setValue]);

  const onSubmit = async (formData) => {
    try {
      setErrorMessage('');
      setSuccessMessage('');

      if (editBookingId) {
        // Update
        const response = await bookingApi.updateBooking(editBookingId, formData);
        if (response.success && response.data) {
          setSuccessMessage('Réservation mise à jour avec succès!');
          navigate('/bookings');
        }
      } else {
        // Create
        const response = await bookingApi.createBooking(formData);
        if (response.success && response.data) {
          setSuccessMessage('Réservation créée avec succès!');
          navigate('/bookings');
        }
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Erreur lors de la création/mise à jour de la réservation');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-xl font-bold">
        {editBookingId ? 'Modifier la Réservation' : 'Créer une Réservation'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Hôtel</label>
          <select
            {...register('hotel')}
            className="border p-2 w-full"
          >
            <option value="">-- Choisissez un hôtel --</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} - {h.location}
              </option>
            ))}
          </select>
          {errors.hotel && <p className="text-red-500 text-sm">{errors.hotel.message}</p>}
        </div>

        <div>
          <label className="block font-semibold mb-1">Date d'arrivée</label>
          <input
            type="date"
            {...register('checkIn')}
            className="border p-2 w-full"
          />
          {errors.checkIn && <p className="text-red-500 text-sm">{errors.checkIn.message}</p>}
        </div>

        <div>
          <label className="block font-semibold mb-1">Date de départ</label>
          <input
            type="date"
            {...register('checkOut')}
            className="border p-2 w-full"
          />
          {errors.checkOut && <p className="text-red-500 text-sm">{errors.checkOut.message}</p>}
        </div>

        <div>
          <label className="block font-semibold mb-1">Nombre de personnes</label>
          <input
            type="number"
            {...register('numberOfGuests')}
            className="border p-2 w-full"
          />
          {errors.numberOfGuests && <p className="text-red-500 text-sm">{errors.numberOfGuests.message}</p>}
        </div>

        <div>
          <label className="block font-semibold mb-1">Prix total (EUR)</label>
          <input
            type="number"
            {...register('totalPrice')}
            className="border p-2 w-full"
          />
          {errors.totalPrice && <p className="text-red-500 text-sm">{errors.totalPrice.message}</p>}
        </div>

        <div>
          <label className="block font-semibold mb-1">Demandes spéciales (optionnel)</label>
          <textarea
            {...register('specialRequests')}
            className="border p-2 w-full"
            rows={3}
          />
          {errors.specialRequests && <p className="text-red-500 text-sm">{errors.specialRequests.message}</p>}
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          {editBookingId ? 'Enregistrer' : 'Créer'}
        </button>
      </form>

      {successMessage && (
        <div className="text-green-600 font-semibold">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="text-red-600 font-semibold">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

export default CreateBooking;
