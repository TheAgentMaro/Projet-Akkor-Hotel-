import React, { useEffect, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { userApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required('Email requis')
      .email('Format email invalide'),
    pseudo: Yup.string()
      .required('Pseudo requis')
      .min(3, 'Minimum 3 caractères'),
    currentPassword: Yup.string()
      .required('Mot de passe actuel requis'),
    newPassword: Yup.string()
      .min(6, 'Minimum 6 caractères'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Les mots de passe doivent correspondre')
  });
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: user?.email || '',
      pseudo: user?.pseudo || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (user) {
      setValue('email', user.email);
      setValue('pseudo', user.pseudo);
    }
  }, [user, setValue]);

  const onSubmit = async (formData) => {
    try {
      setSuccessMessage('');
      setErrorMessage('');

      const updateData = {
        email: formData.email,
        pseudo: formData.pseudo,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword || undefined
      };

      const response = await userApi.updateProfile(updateData);
      
      if (response.success) {
        setSuccessMessage('Profil mis à jour avec succès !');
        reset({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }

    try {
      setErrorMessage('');
      const response = await userApi.deleteAccount();
      
      if (response.success) {
        logout();
        navigate('/login');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Erreur lors de la suppression du compte');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            {...register('email')}
            className="border p-2 w-full rounded"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold mb-1">Pseudo</label>
          <input
            type="text"
            {...register('pseudo')}
            className="border p-2 w-full rounded"
          />
          {errors.pseudo && (
            <p className="text-red-500 text-sm">{errors.pseudo.message}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold mb-1">Mot de passe actuel</label>
          <input
            type="password"
            {...register('currentPassword')}
            className="border p-2 w-full rounded"
          />
          {errors.currentPassword && (
            <p className="text-red-500 text-sm">{errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold mb-1">Nouveau mot de passe (optionnel)</label>
          <input
            type="password"
            {...register('newPassword')}
            className="border p-2 w-full rounded"
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm">{errors.newPassword.message}</p>
          )}
        </div>

        {newPassword && (
          <div>
            <label className="block font-semibold mb-1">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              {...register('confirmPassword')}
              className="border p-2 w-full rounded"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="text-red-500 font-semibold">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="text-green-500 font-semibold">{successMessage}</div>
        )}

        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Mettre à jour
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className={`${
              isDeleting ? 'bg-red-600' : 'bg-red-500'
            } text-white px-4 py-2 rounded hover:bg-red-600`}
          >
            {isDeleting ? 'Confirmer la suppression' : 'Supprimer mon compte'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
