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
      console.log('Create Hotel - Body reçu:', req.body);
      console.log('Create Hotel - Files reçus:', req.files);
  
      const { name, location, description } = req.body;
  
      // Création de l'hôtel
      const hotel = await Hotel.create({
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        picture_list: req.files ? req.files.map(file => `/uploads/${file.filename}`) : []
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
