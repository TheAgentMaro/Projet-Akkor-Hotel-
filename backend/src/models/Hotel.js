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
    trim: true
  },
  location: {
    type: String,
    required: [true, 'La localisation est requise'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise']
  },
  picture_list: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
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

// Index pour le tri
hotelSchema.index({ name: 1 });
hotelSchema.index({ location: 1 });
hotelSchema.index({ createdAt: -1 });

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
