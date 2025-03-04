import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Register from '../../../src/pages/auth/Register';

beforeEach(() => {
  localStorage.clear();
});

describe('Register Page', () => {
  it('renders the registration form fields', () => {
    render(<Register />);
    expect(screen.getByText('Inscription')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Pseudo')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Créer un compte/i })).toBeInTheDocument();
  });

  it('registers a new user successfully', async () => {
    render(<Register />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'newuser@example.com' } });
    fireEvent.change(screen.getByLabelText('Pseudo'), { target: { value: 'newUser' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Créer un compte/i }));

    const successMsg = await screen.findByText('Inscription réussie, bienvenue !');
    expect(successMsg).toBeInTheDocument();

    expect(localStorage.getItem('token')).toBe('FAKE_REGISTER_TOKEN');
  });

  it('shows an error if email is already used', async () => {
    render(<Register />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'existing@test.com' } });
    fireEvent.change(screen.getByLabelText('Pseudo'), { target: { value: 'existingUser' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Créer un compte/i }));

    const errorMsg = await screen.findByText('Cet email est déjà utilisé');
    expect(errorMsg).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
