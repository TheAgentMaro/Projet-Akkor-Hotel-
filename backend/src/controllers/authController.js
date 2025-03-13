// Contrôleur d'authentification
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');

const JWT_SECRET = process.env.JWT_SECRET || 'supinfo';

// Set pour stocker les tokens blacklistés
const tokenBlacklist = new Set();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const authController = {
  // Inscription
  async register(req, res, next) {
    try {
      const { email, pseudo, password } = req.body;

      // Vérifier si l'email existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw createError(409, 'Cet email est déjà utilisé');
      }

      // Créer l'utilisateur
      const user = await User.create({
        email,
        pseudo,
        password
      });

      // Générer le token
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        data: user.toJSON(),
        token
      });
    } catch (error) {
      next(error);
    }
  },

  // Connexion
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Vérifier si l'utilisateur existe
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw createError(401, 'Email ou mot de passe incorrect');
      }

      // Vérifier le mot de passe
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw createError(401, 'Email ou mot de passe incorrect');
      }

      // Générer le token
      const token = generateToken(user);

      res.json({
        success: true,
        data: user.toJSON(),
        token
      });
    } catch (error) {
      next(error);
    }
  },

  // Déconnexion
  async logout(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        tokenBlacklist.add(token);
      }
      res.json({
        success: true,
        message: 'Déconnexion réussie'
      });
    } catch (error) {
      next(error);
    }
  },

  // Vérifier si un token est blacklisté
  isTokenBlacklisted(token) {
    return tokenBlacklist.has(token);
  }
};

module.exports = authController;
