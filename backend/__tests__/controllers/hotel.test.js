const request = require('supertest');
const app = require('../config/testServer');
const Hotel = require('../../src/models/Hotel');
const User = require('../../src/models/User');
const jwt = require('jsonwebtoken');

require('../config/test-setup');

describe('Hotel Controller', () => {
  let adminToken;
  let userToken;
  
  const adminData = {
    email: 'admin@test.com',
    pseudo: 'testadmin',
    password: 'password123',
    role: 'admin'
  };

  const userData = {
    email: 'user@test.com',
    pseudo: 'testuser',
    password: 'password123',
    role: 'user'
  };

  const testHotel = {
    name: 'Test Hotel',
    location: 'Test Location',
    description: 'This is a test hotel description that is long enough',
    picture_list: ['test1.jpg', 'test2.jpg']
  };

  beforeEach(async () => {
    // Créer un admin et un utilisateur normal
    const admin = await User.create(adminData);
    const user = await User.create(userData);

    // Générer les tokens
    adminToken = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'supinfo'
    );

    userToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'supinfo'
    );

    // Nettoyer la collection des hôtels
    await Hotel.deleteMany({});
  });

  describe('GET /api/hotels', () => {
    beforeEach(async () => {
      // Créer quelques hôtels de test
      await Hotel.create([
        { ...testHotel, name: 'A Hotel' },
        { ...testHotel, name: 'B Hotel' },
        { ...testHotel, name: 'C Hotel' }
      ]);
    });

    it('should list hotels with default sorting', async () => {
      const res = await request(app).get('/api/hotels');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.pagination).toBeDefined();
    });

    it('should sort hotels by name', async () => {
      const res = await request(app)
        .get('/api/hotels?sort=name&order=asc');

      expect(res.statusCode).toBe(200);
      expect(res.body.data[0].name).toBe('A Hotel');
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/hotels?limit=2&page=1');

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.limit).toBe(2);
    });
  });

  describe('GET /api/hotels/:id', () => {
    let hotelId;

    beforeEach(async () => {
      const hotel = await Hotel.create(testHotel);
      hotelId = hotel._id;
    });

    it('should get hotel by id', async () => {
      const res = await request(app)
        .get(`/api/hotels/${hotelId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe(testHotel.name);
    });

    it('should return 404 for non-existent hotel', async () => {
      const res = await request(app)
        .get('/api/hotels/123456789012345678901234');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/hotels', () => {
    it('should allow admin to create hotel', async () => {
      const res = await request(app)
        .post('/api/hotels')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testHotel);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe(testHotel.name);
    });

    it('should not allow normal user to create hotel', async () => {
      const res = await request(app)
        .post('/api/hotels')
        .set('Authorization', `Bearer ${userToken}`)
        .send(testHotel);

      expect(res.statusCode).toBe(403);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/hotels')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/hotels/:id', () => {
    let hotelId;

    beforeEach(async () => {
      const hotel = await Hotel.create(testHotel);
      hotelId = hotel._id;
    });

    it('should allow admin to update hotel', async () => {
      const updateData = {
        name: 'Updated Hotel Name'
      };

      const res = await request(app)
        .put(`/api/hotels/${hotelId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe(updateData.name);
    });

    it('should not allow normal user to update hotel', async () => {
      const res = await request(app)
        .put(`/api/hotels/${hotelId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'New Name' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/hotels/:id', () => {
    let hotelId;

    beforeEach(async () => {
      const hotel = await Hotel.create(testHotel);
      hotelId = hotel._id;
    });

    it('should allow admin to delete hotel', async () => {
      const res = await request(app)
        .delete(`/api/hotels/${hotelId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      
      const deletedHotel = await Hotel.findById(hotelId);
      expect(deletedHotel).toBeNull();
    });

    it('should not allow normal user to delete hotel', async () => {
      const res = await request(app)
        .delete(`/api/hotels/${hotelId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      
      const hotelStillExists = await Hotel.findById(hotelId);
      expect(hotelStillExists).toBeTruthy();
    });
  });
});
