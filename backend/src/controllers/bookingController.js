const Booking = require('../models/Booking');
const User = require('../models/User');
const createError = require('http-errors');

const bookingController = {
  // Créer une réservation
  async createBooking(req, res, next) {
    try {
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
      next(error);
    }
  },

  // Obtenir toutes les réservations (admin uniquement)
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

      // Construire la requête
      let query = {};
      
      // Filtrer par statut si spécifié
      if (status) {
        query.status = status;
      }

      // Recherche par email/nom d'utilisateur si spécifié
      if (search) {
        const users = await User.find({
          $or: [
            { email: { $regex: search, $options: 'i' } },
            { pseudo: { $regex: search, $options: 'i' } }
          ]
        });
        query.user = { $in: users.map(u => u._id) };
      }

      // Calculer le skip pour la pagination
      const skip = (page - 1) * limit;

      // Exécuter la requête
      const bookings = await Booking.find(query)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .limit(parseInt(limit))
        .skip(skip)
        .populate('user', 'email pseudo')
        .populate('hotel', 'name location');

      // Compter le total pour la pagination
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

  // Obtenir les réservations de l'utilisateur connecté
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

  // Obtenir une réservation par ID
  async getBookingById(req, res, next) {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate('user', 'email pseudo')
        .populate('hotel', 'name location');

      if (!booking) {
        throw createError(404, 'Réservation non trouvée');
      }

      // Vérifier les permissions
      if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
        throw createError(403, 'Non autorisé');
      }

      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  },

  // Mettre à jour une réservation
  async updateBooking(req, res, next) {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        throw createError(404, 'Réservation non trouvée');
      }

      // Vérifier les permissions
      if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
        throw createError(403, 'Non autorisé');
      }

      // Ne pas permettre la modification de l'utilisateur ou de l'hôtel
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
      next(error);
    }
  },

  // Annuler une réservation
  async cancelBooking(req, res, next) {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        throw createError(404, 'Réservation non trouvée');
      }

      // Vérifier les permissions
      if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
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

  // Supprimer une réservation (admin uniquement)
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
