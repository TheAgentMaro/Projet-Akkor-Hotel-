const mongoose = require('mongoose');
const Booking = require('../../src/models/Booking');
const User = require('../../src/models/User');
const Hotel = require('../../src/models/Hotel');
require('../config/test-setup');

describe('Booking Model Test', () => {
  let testUser;
  let testHotel;

  beforeEach(async () => {
    // Créer un utilisateur de test
    testUser = await User.create({
      email: 'test@test.com',
      pseudo: 'testuser',
      password: 'password123',
      role: 'user'
    });

    // Créer un hôtel de test
    testHotel = await Hotel.create({
      name: 'Test Hotel',
      location: 'Test Location',
      description: 'Test Description'
    });
  });

  it('should create & save booking successfully', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const validBooking = new Booking({
      user: testUser._id,
      hotel: testHotel._id,
      checkIn: tomorrow,
      checkOut: nextWeek,
      numberOfGuests: 2,
      totalPrice: 500,
      specialRequests: 'Chambre calme svp'
    });

    const savedBooking = await validBooking.save();
    
    expect(savedBooking._id).toBeDefined();
    expect(savedBooking.user.toString()).toBe(testUser._id.toString());
    expect(savedBooking.hotel.toString()).toBe(testHotel._id.toString());
    expect(savedBooking.status).toBe('pending');
    expect(savedBooking.numberOfGuests).toBe(2);
    expect(savedBooking.totalPrice).toBe(500);
    expect(savedBooking.specialRequests).toBe('Chambre calme svp');
    expect(savedBooking.createdAt).toBeDefined();
    expect(savedBooking.updatedAt).toBeDefined();
  });

  it('should fail to save booking without required fields', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const bookingWithoutRequiredField = new Booking({
      user: testUser._id,
      // hotel manquant
      checkIn: tomorrow,
      checkOut: nextWeek
      // numberOfGuests et totalPrice manquants
    });

    let err;
    try {
      await bookingWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.hotel).toBeDefined();
    expect(err.errors.numberOfGuests).toBeDefined();
    expect(err.errors.totalPrice).toBeDefined();
  });

  it('should fail when checkOut date is before checkIn date', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const bookingWithInvalidDates = new Booking({
      user: testUser._id,
      hotel: testHotel._id,
      checkIn: tomorrow,
      checkOut: yesterday,
      numberOfGuests: 2,
      totalPrice: 500
    });

    let err;
    try {
      await bookingWithInvalidDates.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.checkOut.message).toBe('La date de départ doit être après la date d\'arrivée');
  });

  it('should fail when checkIn date is in the past', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookingWithPastDate = new Booking({
      user: testUser._id,
      hotel: testHotel._id,
      checkIn: yesterday,
      checkOut: tomorrow,
      numberOfGuests: 2,
      totalPrice: 500
    });

    let err;
    try {
      await bookingWithPastDate.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.checkIn.message).toBe('La date d\'arrivée ne peut pas être dans le passé');
  });

  it('should fail when numberOfGuests is less than 1', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const bookingWithInvalidGuests = new Booking({
      user: testUser._id,
      hotel: testHotel._id,
      checkIn: tomorrow,
      checkOut: nextWeek,
      numberOfGuests: 0,
      totalPrice: 500
    });

    let err;
    try {
      await bookingWithInvalidGuests.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.numberOfGuests).toBeDefined();
  });

  it('should fail when totalPrice is negative', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const bookingWithNegativePrice = new Booking({
      user: testUser._id,
      hotel: testHotel._id,
      checkIn: tomorrow,
      checkOut: nextWeek,
      numberOfGuests: 2,
      totalPrice: -100
    });

    let err;
    try {
      await bookingWithNegativePrice.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.totalPrice).toBeDefined();
  });

  it('should update booking status successfully', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const booking = new Booking({
      user: testUser._id,
      hotel: testHotel._id,
      checkIn: tomorrow,
      checkOut: nextWeek,
      numberOfGuests: 2,
      totalPrice: 500
    });

    const savedBooking = await booking.save();
    expect(savedBooking.status).toBe('pending');

    savedBooking.status = 'confirmed';
    const updatedBooking = await savedBooking.save();
    expect(updatedBooking.status).toBe('confirmed');

    savedBooking.status = 'cancelled';
    const cancelledBooking = await savedBooking.save();
    expect(cancelledBooking.status).toBe('cancelled');
  });

  it('should fail when special requests exceed 500 characters', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const longText = 'a'.repeat(501);
    const bookingWithLongRequest = new Booking({
      user: testUser._id,
      hotel: testHotel._id,
      checkIn: tomorrow,
      checkOut: nextWeek,
      numberOfGuests: 2,
      totalPrice: 500,
      specialRequests: longText
    });

    let err;
    try {
      await bookingWithLongRequest.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.specialRequests).toBeDefined();
  });
});
