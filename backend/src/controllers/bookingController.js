const Booking = require('../models/Booking');
const User = require('../models/User');
const createError = require('http-errors');

const bookingController = {
  async createBooking(req, res, next) {
    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const checkIn = new Date(req.body.checkIn);
      checkIn.setHours(0, 0, 0, 0);

      const checkOut = new Date(req.body.checkOut);
      checkOut.setHours(0, 0, 0, 0);

      if (checkIn < now) {
        throw createError(400, "La date d'arrivée ne peut pas être dans le passé");
      }

      if (checkIn >= checkOut) {
        throw createError(400, 'La date de départ doit être après la date d\'arrivée');
      }

      const booking = await Booking.create({
        ...req.body,
        user: req.user.id
      });

      await booking.populate('hotel');

      res.status(201).json({
        success: true,
        data: booking
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        next(createError(400, error.message));
      } else {
        next(error);
      }
    }
  },

  async getAllBookings(req, res, next) {
    try {
      const { 
        sort = 'createdAt',
        order = 'desc',
        limit = 10,
        page = 1,
        status,
        search
      } = req.query;

      let query = {};
      
      if (status) {
        query.status = status;
      }

      if (search) {
        const users = await User.find({
          $or: [
            { email: { $regex: search, $options: 'i' } },
            { pseudo: { $regex: search, $options: 'i' } }
          ]
        });
        query.user = { $in: users.map(u => u._id) };
      }

      const skip = (page - 1) * limit;

      const bookings = await Booking.find(query)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .limit(parseInt(limit))
        .skip(skip)
        .populate('user', 'email pseudo')
        .populate('hotel', 'name location');

      const total = await Booking.countDocuments(query);

      res.json({
        success: true,
        data: bookings,
        pagination: {
          current: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserBookings(req, res, next) {
    try {
      const bookings = await Booking.find({ user: req.user.id })
        .populate('hotel', 'name location');

      res.json({
        success: true,
        data: bookings
      });
    } catch (error) {
      next(error);
    }
  },

  async getBookingById(req, res, next) {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate('user', 'email pseudo')
        .populate('hotel', 'name location');
  
      if (!booking) {
        throw createError(404, 'Réservation non trouvée');
      }
  
      const bookingUserId = booking.user._id ? booking.user._id.toString() : booking.user.toString();
      const requestUserId = req.user.id.toString();
  
      if (req.user.role !== 'admin' && bookingUserId !== requestUserId) {
        throw createError(403, 'Non autorisé');
      }
  
      res.json({
        success: true,
        data: booking.toJSON() // Convertir en JSON brut
      });
    } catch (error) {
      next(error);
    }
  },

  async updateBooking(req, res, next) {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        throw createError(404, 'Réservation non trouvée');
      }

      // Normaliser les IDs pour la comparaison
      const bookingUserId = booking.user._id ? booking.user._id.toString() : booking.user.toString();
      const requestUserId = req.user.id.toString(); // Toujours utiliser req.user.id

      if (req.user.role !== 'admin' && bookingUserId !== requestUserId) {
        throw createError(403, 'Non autorisé');
      }

      // Valider les dates si elles sont modifiées
      if (req.body.checkIn || req.body.checkOut) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const checkIn = new Date(req.body.checkIn || booking.checkIn);
        checkIn.setHours(0, 0, 0, 0);

        const checkOut = new Date(req.body.checkOut || booking.checkOut);
        checkOut.setHours(0, 0, 0, 0);

        if (checkIn < now) {
          throw createError(400, "La date d'arrivée ne peut pas être dans le passé");
        }

        if (checkIn >= checkOut) {
          throw createError(400, 'La date de départ doit être après la date d\'arrivée');
        }
      }

      delete req.body.user;
      delete req.body.hotel;

      const updatedBooking = await Booking.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('hotel', 'name location');

      res.json({
        success: true,
        data: updatedBooking
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        next(createError(400, error.message));
      } else {
        next(error);
      }
    }
  },

  async cancelBooking(req, res, next) {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        throw createError(404, 'Réservation non trouvée');
      }

      const bookingUserId = booking.user._id ? booking.user._id.toString() : booking.user.toString();
      const requestUserId = req.user.id.toString();

      if (req.user.role !== 'admin' && bookingUserId !== requestUserId) {
        throw createError(403, 'Non autorisé');
      }

      booking.status = 'cancelled';
      await booking.save();

      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteBooking(req, res, next) {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        throw createError(404, 'Réservation non trouvée');
      }

      await booking.deleteOne();

      res.json({
        success: true,
        message: 'Réservation supprimée avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = bookingController;