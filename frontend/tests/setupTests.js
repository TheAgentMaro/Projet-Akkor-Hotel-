import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Avant tous les tests, on démarre le serveur mock
beforeAll(() => server.listen());

// Après chaque test, on réinitialise les handlers
afterEach(() => server.resetHandlers());

// Après tous les tests, on éteint le serveur mock
afterAll(() => server.close());
