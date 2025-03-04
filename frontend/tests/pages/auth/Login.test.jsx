import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Login from '../../../src/pages/auth/Login';

describe('Login Page', () => {
  it('renders the login form fields', () => {
    render(<Login />);

    // Vérifier la présence des champs
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
  });
});
