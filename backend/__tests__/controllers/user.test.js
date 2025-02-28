const request = require('supertest');
const app = require('../config/testServer');
const User = require('../../src/models/User');
const jwt = require('jsonwebtoken');

require('../config/test-setup');

describe('User Controller', () => {
  let userToken;
  let adminToken;
  let userId;

  const userData = {
    email: 'user@test.com',
    pseudo: 'testuser',
    password: 'password123',
    role: 'user'
  };

  const adminData = {
    email: 'admin@test.com',
    pseudo: 'testadmin',
    password: 'password123',
    role: 'admin'
  };

  beforeEach(async () => {
    // Créer un utilisateur normal
    const user = await User.create(userData);
    userId = user._id;
    userToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    // Créer un admin
    const admin = await User.create(adminData);
    adminToken = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key'
    );
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(userData.email);
    });

    it('should not get profile without token', async () => {
      const res = await request(app)
        .get('/api/users/profile');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should let admin get any user', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe(userData.email);
    });

    it('should let user get their own profile', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe(userData.email);
    });

    it('should not let user get other user profiles', async () => {
      const otherUser = await User.create({
        email: 'other@test.com',
        pseudo: 'other',
        password: 'password123'
      });

      const res = await request(app)
        .get(`/api/users/${otherUser._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /api/users/:id', () => {
    const updateData = {
      pseudo: 'updatedpseudo'
    };

    it('should let user update their own profile', async () => {
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.pseudo).toBe(updateData.pseudo);
    });

    it('should let admin update any user', async () => {
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.pseudo).toBe(updateData.pseudo);
    });

    it('should not let user update other profiles', async () => {
      const otherUser = await User.create({
        email: 'other@test.com',
        pseudo: 'other',
        password: 'password123'
      });

      const res = await request(app)
        .put(`/api/users/${otherUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should let user delete their own profile', async () => {
      const res = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      
      const deletedUser = await User.findById(userId);
      expect(deletedUser).toBeNull();
    });

    it('should let admin delete any user', async () => {
      const res = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      
      const deletedUser = await User.findById(userId);
      expect(deletedUser).toBeNull();
    });

    it('should not let user delete other profiles', async () => {
      const otherUser = await User.create({
        email: 'other@test.com',
        pseudo: 'other',
        password: 'password123'
      });

      const res = await request(app)
        .delete(`/api/users/${otherUser._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      
      const userStillExists = await User.findById(otherUser._id);
      expect(userStillExists).toBeTruthy();
    });
  });

  describe('GET /api/users', () => {
    it('should let admin get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should not let normal user get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
