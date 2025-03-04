import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

import authApi from '../../services/api';

function Login() {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required('Email requis')
      .email('Format email invalide'),
    password: Yup.string()
      .required('Mot de passe requis')
      .min(6, 'Minimum 6 caractères')
  });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(validationSchema)
  });

  const onSubmit = async (data) => {
    try {
      setErrorMessage('');
      setSuccessMessage('');

      // Appel à l’API
      const response = await authApi.login(data.email, data.password);

      // Récupère le token et le stocke
      if (response && response.success && response.token) {
        localStorage.setItem('token', response.token);
        setSuccessMessage('Connexion réussie !');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Erreur lors de la connexion');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Connexion</h1>

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

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block font-bold mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            {...register('password')}
            className="border border-gray-300 p-2 w-full"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        {/* Bouton */}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Se connecter
        </button>
      </form>

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

export default Login;
