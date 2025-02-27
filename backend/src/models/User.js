const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - pseudo
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: ID auto-généré de l'utilisateur
 *         email:
 *           type: string
 *           format: email
 *           description: Email de l'utilisateur
 *         pseudo:
 *           type: string
 *           description: Pseudo de l'utilisateur
 *         password:
 *           type: string
 *           format: password
 *           description: Mot de passe hashé de l'utilisateur
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *           description: Rôle de l'utilisateur
 *       example:
 *         email: user@akkor-hotel.com
 *         pseudo: JohnDoe
 *         password: hashedPassword123
 *         role: user
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  pseudo: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
