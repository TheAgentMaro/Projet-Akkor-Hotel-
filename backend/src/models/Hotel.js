const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Hotel:
 *       type: object
 *       required:
 *         - name
 *         - location
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           description: ID auto-généré de l'hôtel
 *         name:
 *           type: string
 *           description: Nom de l'hôtel
 *         location:
 *           type: string
 *           description: Localisation de l'hôtel
 *         description:
 *           type: string
 *           description: Description détaillée de l'hôtel
 *         picture_list:
 *           type: array
 *           items:
 *             type: string
 *           description: Liste des URLs des images de l'hôtel
 *         status:
 *           type: string
 *           enum: [available, maintenance, closed]
 *           description: Statut de l'hôtel (disponible, en maintenance, fermé)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de l'hôtel
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour de l'hôtel
 */
const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  location: {
    type: String,
    required: [true, 'La localisation est requise'],
    trim: true,
    minlength: [2, 'La localisation doit contenir au moins 2 caractères'],
    maxlength: [200, 'La localisation ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    minlength: [10, 'La description doit contenir au moins 10 caractères'],
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  picture_list: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length <= 5;
      },
      message: 'Un hôtel ne peut pas avoir plus de 5 images'
    },
    default: []
  },
  status: {
    type: String,
    enum: {
      values: ['available', 'maintenance', 'closed'],
      message: 'Statut invalide. Les statuts autorisés sont : available, maintenance, closed'
    },
    default: 'available'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index pour le tri et la recherche
hotelSchema.index({ name: 1 });
hotelSchema.index({ location: 1 });
hotelSchema.index({ createdAt: -1 });
hotelSchema.index({ status: 1 });

// Middleware de validation personnalisée
hotelSchema.pre('save', function(next) {
  // Validation des URLs des images seulement en production et développement
  if (process.env.NODE_ENV !== 'test' && this.picture_list.length > 0) {
    const urlPattern = /^\/uploads\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|gif)$/;
    const validUrls = this.picture_list.every(url => urlPattern.test(url));
    if (!validUrls) {
      return next(new Error('Format d\'URL d\'image invalide'));
    }
  }
  next();
});

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
