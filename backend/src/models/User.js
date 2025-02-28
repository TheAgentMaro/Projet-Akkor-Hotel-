const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Format email invalide']
  },
  pseudo: {
    type: String,
    required: [true, 'Pseudo est requis'],
    trim: true,
    minlength: [3, 'Pseudo doit faire au moins 3 caractères'],
    maxlength: [30, 'Pseudo ne peut pas dépasser 30 caractères']
  },
  password: {
    type: String,
    required: [true, 'Mot de passe est requis'],
    minlength: [6, 'Mot de passe doit faire au moins 6 caractères']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Hash le mot de passe avant la sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour retourner l'utilisateur sans le mot de passe
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
