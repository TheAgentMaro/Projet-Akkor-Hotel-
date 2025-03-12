const Hotel = require('../models/Hotel');
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
      const hotel = await Hotel.findById(req.params.id);
      if (!hotel) {
        throw createError(404, 'Hôtel non trouvé');
      }

      res.json({
        success: true,
        data: hotel
      });
    } catch (error) {
      next(error);
    }
  },

  // Créer un nouvel hôtel (admin uniquement)
  async createHotel(req, res, next) {
    try {
      const { name, location, description } = req.body;
  
      // Validation des champs requis
      if (!name || !location || !description) {
        return res.status(400).json({
          success: false,
          message: 'Nom, localisation et description sont requis'
        });
      }
  
      // Création de l'hôtel
      const hotel = await Hotel.create({
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        picture_list: req.files ? req.files.map(file => file.path) : []
      });
  
      res.status(201).json({
        success: true,
        data: hotel
      });
    } catch (error) {
      next(error);
    }
  },

  // Mettre à jour un hôtel (admin uniquement)
  async updateHotel(req, res, next) {
    try {
      const { name, location, description, picture_list } = req.body;

      const hotel = await Hotel.findByIdAndUpdate(
        req.params.id,
        {
          name,
          location,
          description,
          picture_list
        },
        { new: true, runValidators: true }
      );

      if (!hotel) {
        throw createError(404, 'Hôtel non trouvé');
      }

      res.json({
        success: true,
        data: hotel
      });
    } catch (error) {
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
