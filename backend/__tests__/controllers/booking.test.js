const request = require('supertest');
const app = require('../config/testServer');
const Booking = require('../../src/models/Booking');
const User = require('../../src/models/User');
const Hotel = require('../../src/models/Hotel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

require('../config/test-setup');

describe('Booking Controller', () => {
  let adminToken;
  let userToken;
  let hotelId;
  let userId;
  let bookingId;
  
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

  const hotelData = {
    name: 'Test Hotel',
    location: 'Test Location',
    description: 'This is a test hotel description that is long enough',
    picture_list: ['test1.jpg', 'test2.jpg']
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);

  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  dayAfterTomorrow.setHours(12, 0, 0, 0);

  const bookingData = {
    checkIn: tomorrow.toISOString(),
    checkOut: dayAfterTomorrow.toISOString(),
    numberOfGuests: 2,
    totalPrice: 200,
    specialRequests: 'Test request'
  };

  beforeEach(async () => {
    // Créer un admin et un utilisateur normal
    const admin = await User.create(adminData);
    const user = await User.create(userData);
    userId = user._id;

    // Créer un hôtel de test
    const hotel = await Hotel.create(hotelData);
    hotelId = hotel._id;

    // Générer les tokens
    adminToken = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'supinfo'
    );

    userToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'supinfo'
    );

    // Créer une réservation de test
    const booking = await Booking.create({
      ...bookingData,
      user: userId,
      hotel: hotelId
    });
    bookingId = booking._id;
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking for authenticated user', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...bookingData,
          hotel: hotelId
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.hotel).toBeDefined();
      expect(res.body.data.user).toBeDefined();
    });

    it('should not create booking with invalid dates', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(12, 0, 0, 0);

      const dayBeforeYesterday = new Date();
      dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
      dayBeforeYesterday.setHours(12, 0, 0, 0);

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...bookingData,
          hotel: hotelId,
          checkIn: yesterday.toISOString(),
          checkOut: dayBeforeYesterday.toISOString()
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/bookings/me', () => {
    it('should get user bookings', async () => {
      const res = await request(app)
        .get('/api/bookings/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should get booking by id for admin', async () => {
      const res = await request(app)
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(bookingId.toString());
    });
  });

  describe('PUT /api/bookings/:id', () => {
    it('should update booking for owner', async () => {
      const res = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          numberOfGuests: 3,
          specialRequests: 'Updated request'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.numberOfGuests).toBe(3);
      expect(res.body.data.specialRequests).toBe('Updated request');
    });
  

    it('should not update booking dates to invalid values', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(12, 0, 0, 0);
  
      const res = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          checkIn: yesterday.toISOString()
        });
  
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/bookings/:id/cancel', () => {
    it('should cancel booking for owner', async () => {
      const res = await request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('cancelled');
    });
  });

  describe('GET /api/bookings (admin)', () => {
    it('should get all bookings for admin', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('should search bookings by user email', async () => {
      const res = await request(app)
        .get(`/api/bookings?search=${userData.email}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should not allow non-admin to get all bookings', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/bookings/:id (admin)', () => {
    it('should delete booking for admin', async () => {
      const res = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);

      const deletedBooking = await Booking.findById(bookingId);
      expect(deletedBooking).toBeNull();
    });

    it('should not allow non-admin to delete booking', async () => {
      const res = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
