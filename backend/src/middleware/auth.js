// Middleware d'authentification à implémenter
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supinfo';

const authMiddleware = {
  // Vérifier si l'utilisateur est authentifié
  async protect(req, res, next) {
    try {
      let token;

      // Vérifier si le token est présent dans les headers
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        throw createError(401, 'Non autorisé - Token manquant');
      }

      try {
        // Vérifier le token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Ajouter l'utilisateur à la requête
        const user = await User.findById(decoded.id);
        if (!user) {
          throw createError(401, 'Non autorisé - Utilisateur non trouvé');
        }

        req.user = {
          id: user._id.toString(),
          role: user.role
        };
        next();
      } catch (error) {
        console.error('Erreur de vérification du token:', error);
        throw createError(401, 'Non autorisé - Token invalide');
      }
    } catch (error) {
      next(error);
    }
  },

  // Vérifier si l'utilisateur est admin
  async admin(req, res, next) {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw createError(403, 'Non autorisé - Réservé aux administrateurs');
      }
      next();
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authMiddleware;
