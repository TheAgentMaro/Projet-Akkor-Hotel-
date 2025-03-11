import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { userApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validationSchema = Yup.object().shape({
    email: Yup.string().required('Email requis').email('Format email invalide'),
    pseudo: Yup.string().required('Pseudo requis').min(3, 'Minimum 3 caractères'),
    password: Yup.string()
      .transform((value, originalValue) => originalValue === '' ? undefined : value)
      .notRequired()
      .min(6, 'Minimum 6 caractères'),
  });
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await userApi.getProfile();
        if (response.success && response.data) {
          const { id, email, pseudo } = response.data;
          setUserId(id);
          setValue('email', email);
          setValue('pseudo', pseudo);
        }
      } catch (error) {
        setErrorMessage(error.response?.data?.error || 'Erreur de récupération du profil');
      }
    }
    fetchProfile();
  }, [setValue]);

  const onSubmit = async (formData) => {
    try {
      setSuccessMessage('');
      setErrorMessage('');

      if (!formData.password) {
        delete formData.password;
      }

      const updateResponse = await userApi.updateUser(userId, formData);
      if (updateResponse.success && updateResponse.data) {
        setSuccessMessage('Profil mis à jour avec succès !');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    try {
      setSuccessMessage('');
      setErrorMessage('');

      const confirmDelete = window.confirm('Voulez-vous vraiment supprimer votre compte ?');
      if (!confirmDelete) return;

      const deleteResponse = await userApi.deleteUser(userId);
      if (deleteResponse.success) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4">
      <h1 className="text-2xl font-bold">Mon Profil</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block font-semibold mb-1">
            Email
          </label>
          <input
            type="text"
            id="email"
            {...register('email')}
            className="border border-gray-300 p-2 w-full"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="pseudo" className="block font-semibold mb-1">
            Pseudo
          </label>
          <input
            type="text"
            id="pseudo"
            {...register('pseudo')}
            className="border border-gray-300 p-2 w-full"
          />
          {errors.pseudo && <p className="text-red-500 text-sm">{errors.pseudo.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block font-semibold mb-1">
            Nouveau mot de passe (optionnel)
          </label>
          <input
            type="password"
            id="password"
            {...register('password')}
            className="border border-gray-300 p-2 w-full"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Mettre à jour
        </button>
      </form>

      <button
        onClick={handleDelete}
        className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Supprimer mon compte
      </button>

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

export default Profile;
