import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../../../src/pages/auth/Login';

// Pour réinitialiser le localStorage dans chaque test
beforeEach(() => {
  localStorage.clear();
});

describe('Login Page', () => {
  it('renders the login form fields', () => {
    render(<Login />);

    // Vérifier la présence des champs
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
  });

  it('successfully logs in with correct credentials', async () => {
    render(<Login />);

    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'password123' } });

    // Soumettre
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    // Attendre que le succès apparaisse
    const successMsg = await screen.findByText('Connexion réussie !');
    expect(successMsg).toBeInTheDocument();

    // Vérifier que le token a bien été stocké
    const storedToken = localStorage.getItem('token');
    expect(storedToken).toBe('FAKE_TOKEN_123');
  });

  it('shows an error message with invalid credentials', async () => {
    render(<Login />);

    // Remplir le formulaire avec mauvais MDP
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'wrong' } });

    // Soumettre
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    // Attendre le message d'erreur
    const errorMsg = await screen.findByText('Email ou mot de passe incorrect');
    expect(errorMsg).toBeInTheDocument();

    // Assurer que le token n'a pas été stocké
    expect(localStorage.getItem('token')).toBeNull();
  });
});
