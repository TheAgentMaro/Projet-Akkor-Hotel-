import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { userApi, authApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();

  // État local pour stocker l'ID de l'utilisateur (récupéré via getProfile)
  const [userId, setUserId] = useState('');

  // Pour afficher un message de succès / d'erreur
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Schéma de validation via Yup (email, pseudo obligatoires; password optionnel)
  const validationSchema = Yup.object().shape({
    email: Yup.string().required('Email requis').email('Format email invalide'),
    pseudo: Yup.string().required('Pseudo requis').min(3, 'Minimum 3 caractères'),
    // Password n'est pas forcé, seulement min 6 si renseigné
    password: Yup.string().min(6, 'Minimum 6 caractères'),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  // Récupère le profil utilisateur dès le montage
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await userApi.getProfile();
        if (response.success && response.data) {
          const { _id, email, pseudo } = response.data;
          setUserId(_id);

          // Remplit le formulaire avec les valeurs
          setValue('email', email);
          setValue('pseudo', pseudo);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        // S'il y a une 401, par ex. token expiré
        setErrorMessage(error.response?.data?.error || 'Erreur de récupération du profil');
      }
    }

    fetchProfile();
  }, [setValue]);

  // Fonction de mise à jour du user
  const onSubmit = async (formData) => {
    try {
      setSuccessMessage('');
      setErrorMessage('');

      // Si le champ password est vide, on l'enlève pour ne pas écraser
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

  // Fonction de suppression du compte
  const handleDelete = async () => {
    try {
      setSuccessMessage('');
      setErrorMessage('');

      // Confirmer la suppression
      const confirmDelete = window.confirm('Voulez-vous vraiment supprimer votre compte ?');
      if (!confirmDelete) return;

      const deleteResponse = await userApi.deleteUser(userId);
      if (deleteResponse.success) {
        // On supprime le token local pour "logout"
        localStorage.removeItem('token');

        // Redirection vers la page d'accueil ou login
        navigate('/login');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Mon Profil</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block font-bold mb-1">
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

        {/* Pseudo */}
        <div className="mb-4">
          <label htmlFor="pseudo" className="block font-bold mb-1">
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

        {/* Password (optionnel pour update) */}
        <div className="mb-4">
          <label htmlFor="password" className="block font-bold mb-1">
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

        {/* Bouton Update */}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Mettre à jour
        </button>
      </form>

      {/* Bouton Delete */}
      <button
        onClick={handleDelete}
        className="bg-red-500 text-white p-2 rounded mt-4 hover:bg-red-600"
      >
        Supprimer mon compte
      </button>

      {/* Messages de retour */}
      {successMessage && (
        <div className="mt-4 text-green-600 font-semibold">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mt-4 text-red-600 font-semibold">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

export default Profile;
