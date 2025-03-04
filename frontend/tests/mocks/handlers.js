import { rest } from 'msw';

export const handlers = [
  // Mock pour /auth/login
  rest.post('http://localhost:3000/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body;
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.json({
          success: true,
          data: {
            email: 'test@example.com',
            pseudo: 'userTest'
          },
          token: 'FAKE_TOKEN_123'
        })
      );
    }
    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      })
    );
  }),

  // Mock pour /auth/register
  rest.post('http://localhost:3000/api/auth/register', (req, res, ctx) => {
    const { email, pseudo, password } = req.body;
    if (email === 'existing@test.com') {
      return res(ctx.status(409), ctx.json({ error: 'Cet email est déjà utilisé' }));
    }
    return res(
      ctx.json({
        success: true,
        data: {
          email,
          pseudo
        },
        token: 'FAKE_REGISTER_TOKEN'
      })
    );
  })
];
