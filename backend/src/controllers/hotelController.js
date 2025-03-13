const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const createError = require('http-errors');

const hotelController = {
  // Lister tous les hôtels avec tri et pagination
  async getAllHotels(req, res, next) {
    try {
      const { 
        sort = 'createdAt', // tri par défaut par date de création
        order = 'desc',
        limit = 10,
        page = 1
      } = req.query;

      // Valider les paramètres
      const validSortFields = ['name', 'location', 'createdAt'];
      if (!validSortFields.includes(sort)) {
        throw createError(400, 'Champ de tri invalide');
      }

      const validOrders = ['asc', 'desc'];
      if (!validOrders.includes(order)) {
        throw createError(400, 'Ordre de tri invalide');
      }

      // Construire l'objet de tri
      const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

      // Calculer le skip pour la pagination
      const skip = (page - 1) * limit;

      // Récupérer les hôtels
      const hotels = await Hotel.find()
        .sort(sortObj)
        .limit(parseInt(limit))
        .skip(skip);

      // Compter le total pour la pagination
      const total = await Hotel.countDocuments();

      res.json({
        success: true,
        data: hotels,
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

  // Obtenir un hôtel par son ID
  async getHotelById(req, res, next) {
    try {
      // Vérifier si l'ID est valide
      const hotelId = req.params.id;
      
      if (!hotelId || hotelId === 'undefined' || hotelId === 'null') {
        return res.status(400).json({
          success: false,
          error: 'ID d\'hôtel invalide ou manquant',
          data: null
        });
      }
      
      // Utiliser try/catch spécifique pour la recherche par ID
      try {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
          return res.status(404).json({
            success: false,
            error: 'Hôtel non trouvé',
            data: null
          });
        }

        return res.json({
          success: true,
          data: hotel
        });
      } catch (idError) {
        // Erreur spécifique au format de l'ID
        if (idError.name === 'CastError') {
          return res.status(400).json({
            success: false,
            error: 'Format d\'ID d\'hôtel invalide',
            data: null
          });
        }
        throw idError; // Relancer l'erreur si ce n'est pas une erreur de cast
      }
    } catch (error) {
      console.error('Erreur getHotelById:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération de l\'hôtel',
        data: null
      });
    }
  },

  // Vérifier la disponibilité (employé et admin)
  async checkAvailability(req, res, next) {
    try {
      const { hotelId, checkIn, checkOut } = req.query;

      if (!hotelId || !checkIn || !checkOut) {
        throw createError(400, 'hotelId, checkIn et checkOut sont requis');
      }

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        throw createError(404, 'Hôtel non trouvé');
      }

      // Vérifier les réservations existantes
      const overlappingBookings = await Booking.find({
        hotel: hotelId,
        $or: [
          {
            checkIn: { $lte: new Date(checkOut) },
            checkOut: { $gte: new Date(checkIn) }
          }
        ]
      });

      const isAvailable = overlappingBookings.length === 0;

      res.json({
        success: true,
        data: {
          isAvailable,
          overlappingBookings: overlappingBookings.length
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Obtenir les statistiques d'occupation (employé et admin)
  async getOccupancyStats(req, res, next) {
    try {
      const { hotelId, startDate, endDate } = req.query;

      if (!hotelId || !startDate || !endDate) {
        throw createError(400, 'hotelId, startDate et endDate sont requis');
      }

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        throw createError(404, 'Hôtel non trouvé');
      }

      const bookings = await Booking.find({
        hotel: hotelId,
        checkIn: { $gte: new Date(startDate) },
        checkOut: { $lte: new Date(endDate) }
      });

      // Calculer le taux d'occupation
      const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
      const occupiedDays = bookings.reduce((acc, booking) => {
        const days = Math.ceil((booking.checkOut - booking.checkIn) / (1000 * 60 * 60 * 24));
        return acc + days;
      }, 0);

      const occupancyRate = (occupiedDays / totalDays) * 100;

      res.json({
        success: true,
        data: {
          totalDays,
          occupiedDays,
          occupancyRate: Math.round(occupancyRate * 100) / 100,
          totalBookings: bookings.length
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Mettre à jour le statut d'un hôtel (employé et admin)
  async updateHotelStatus(req, res, next) {
    try {
      const { status } = req.body;
      
      if (!['available', 'maintenance', 'closed'].includes(status)) {
        throw createError(400, 'Statut invalide. Les statuts autorisés sont : available, maintenance, closed');
      }

      const hotel = await Hotel.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      );

      if (!hotel) {
        throw createError(404, 'Hôtel non trouvé');
      }

      res.json({
        success: true,
        data: hotel,
        message: 'Statut de l\'hôtel mis à jour avec succès'
      });
    } catch (error) {
      next(error);
    }
  },

  // Créer un nouvel hôtel (admin uniquement)
  async createHotel(req, res, next) {
    try {
      console.log('Create Hotel - Body reçu dans controller:', req.body);
      console.log('Create Hotel - Files reçus dans controller:', req.files);
  
      const { name, location, description } = req.body;
  
      // Vérification supplémentaire
      if (!name || !location || !description) {
        return res.status(400).json({
          success: false,
          error: 'Données manquantes dans le controller'
        });
      }
  
      // Création de l'hôtel
      const hotel = await Hotel.create({
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        picture_list: req.files ? req.files.map(file => `/uploads/${file.filename}`) : [],
        status: 'available'
      });
  
      res.status(201).json({
        success: true,
        data: hotel,
        message: 'Hôtel créé avec succès'
      });
    } catch (error) {
      console.error('Erreur création hôtel:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de la création de l\'hôtel'
      });
    }
  },

  // Mettre à jour un hôtel (admin uniquement)
  async updateHotel(req, res, next) {
    try {
      console.log('Body reçu pour update:', req.body);
      console.log('Files reçus pour update:', req.files);
  
      // Récupérer l'hôtel existant
      const existingHotel = await Hotel.findById(req.params.id);
      if (!existingHotel) {
        throw createError(404, 'Hôtel non trouvé');
      }
  
      // Préparer l'objet de mise à jour
      const updateData = {};
  
      // Mettre à jour les champs texte seulement s'ils sont fournis
      if (req.body.name) updateData.name = req.body.name.trim();
      if (req.body.location) updateData.location = req.body.location.trim();
      if (req.body.description) updateData.description = req.body.description.trim();
  
      // Gérer les images
      if (req.files && req.files.length > 0) {
        // Ajouter les nouvelles images
        const newImages = req.files.map(file => `/uploads/${file.filename}`);
        
        // Si keepExistingImages est true dans le body, combiner avec les images existantes
        if (req.body.keepExistingImages === 'true') {
          updateData.picture_list = [...existingHotel.picture_list, ...newImages];
        } else {
          updateData.picture_list = newImages;
        }
      } else if (req.body.picture_list) {
        // Si picture_list est fourni dans le body (pour supprimer ou réorganiser les images existantes)
        updateData.picture_list = Array.isArray(req.body.picture_list) 
          ? req.body.picture_list 
          : JSON.parse(req.body.picture_list);
      }
  
      // Effectuer la mise à jour
      const hotel = await Hotel.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
  
      res.json({
        success: true,
        data: hotel,
        message: 'Hôtel mis à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur mise à jour hôtel:', error);
      next(error);
    }
  },

  // Supprimer un hôtel (admin uniquement)
  async deleteHotel(req, res, next) {
    try {
      const hotel = await Hotel.findByIdAndDelete(req.params.id);
      
      if (!hotel) {
        throw createError(404, 'Hôtel non trouvé');
      }

      res.json({
        success: true,
        message: 'Hôtel supprimé avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = hotelController;
