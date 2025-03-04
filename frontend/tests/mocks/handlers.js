// frontend/tests/mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  // EXISTANT
  rest.post('http://localhost:3000/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body;
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.json({
          success: true,
          data: {
            email: 'test@example.com',
            pseudo: 'userTest',
          },
          token: 'FAKE_TOKEN_123',
        })
      );
    }
    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        error: 'Email ou mot de passe incorrect',
      })
    );
  }),

  rest.post('http://localhost:3000/api/auth/register', (req, res, ctx) => {
    const { email } = req.body;
    if (email === 'existing@test.com') {
      return res(ctx.status(409), ctx.json({ error: 'Cet email est déjà utilisé' }));
    }
    return res(
      ctx.json({
        success: true,
        data: req.body,
        token: 'FAKE_REGISTER_TOKEN',
      })
    );
  }),

  rest.get('http://localhost:3000/api/users/profile', (req, res, ctx) => {
    // Renvoyer un user fictif
    return res(
      ctx.json({
        success: true,
        data: {
          _id: 'USER_ID_123',
          email: 'mockuser@test.com',
          pseudo: 'MockUser',
          role: 'user',
        },
      })
    );
  }),

  rest.put('http://localhost:3000/api/users/:id', (req, res, ctx) => {
    // On suppose que la mise à jour réussit
    const { id } = req.params;
    const { email, pseudo } = req.body;
    return res(
      ctx.json({
        success: true,
        data: {
          _id: id,
          email: email || 'mockuser@test.com',
          pseudo: pseudo || 'MockUser',
        },
      })
    );
  }),

  rest.delete('http://localhost:3000/api/users/:id', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        message: 'Utilisateur supprimé avec succès',
      })
    );
  }),
];
