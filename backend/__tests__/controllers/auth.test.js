const request = require('supertest');
const app = require('../config/testServer');
const User = require('../../src/models/User');
const jwt = require('jsonwebtoken');

require('../config/test-setup');

describe('Auth Controller', () => {
  const userData = {
    email: 'test@example.com',
    pseudo: 'testuser',
    password: 'password123'
  };

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(userData.email);
      expect(res.body.token).toBeDefined();
    });

    it('should not register user with existing email', async () => {
      await User.create(userData);

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.statusCode).toBe(409);
    });

    it('should not register user with invalid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid-email' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create(userData);
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: userData.password
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    let token;

    beforeEach(async () => {
      const user = await User.create(userData);
      token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'supinfo'
      );
    });

    it('should successfully logout', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Déconnexion réussie');

      // Vérifier que le token est maintenant invalide
      const protectedRes = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(protectedRes.statusCode).toBe(401);
    });

    it('should handle logout without token', async () => {
      const res = await request(app)
        .post('/api/auth/logout');

      expect(res.statusCode).toBe(401);
    });
  });
});
