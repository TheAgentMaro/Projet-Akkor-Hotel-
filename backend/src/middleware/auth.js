const jwt = require('jsonwebtoken');
const User = require('../models/User');
const createError = require('http-errors');
const authController = require('../controllers/authController'); // Importez authController

/**
 * Middleware de protection des routes
 * Vérifie que l'utilisateur est authentifié via un token JWT
 */
const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.startsWith('Bearer') 
      ? req.headers.authorization.split(' ')[1] 
      : null;

    if (!token) {
      throw createError(401, 'Accès refusé. Veuillez vous connecter pour accéder à cette ressource.');
    }

    // Vérifier si le token est blacklisté
    if (authController.isTokenBlacklisted(token)) {
      throw createError(401, 'Session invalide. Token révoqué suite à une déconnexion.');
    }

    // Décoder le token
    const jwtSecret = process.env.JWT_SECRET || 'supinfo';
    const decoded = jwt.verify(token, jwtSecret);

    // En environnement de test, on accepte directement le token décodé sans vérifier l'existence de l'utilisateur
    if (process.env.NODE_ENV === 'test') {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        role: decoded.role || 'user',
        toString: function() {
          return this.id.toString();
        },
        toObject: function() {
          return {
            _id: this._id,
            id: this.id,
            role: this.role
          };
        }
      };
      return next();
    }
    
    // En production et développement, vérifier que l'utilisateur existe
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw createError(401, 'Compte utilisateur non trouvé. Veuillez vous reconnecter.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Session invalide. Veuillez vous reconnecter.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expirée. Veuillez vous reconnecter.'
      });
    }
    return res.status(error.status || 401).json({
      success: false,
      message: error.message || 'Erreur d\'authentification. Veuillez vous reconnecter.'
    });
  }
};

/**
 * Middleware pour les routes admin uniquement
 * Vérifie que l'utilisateur a le rôle 'admin'
 */
const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Accès refusé. Veuillez vous connecter.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Cette fonctionnalité nécessite des droits administrateur.',
      contactAdmin: true
    });
  }

  next();
};

/**
 * Middleware pour les routes employé ou admin
 * Vérifie que l'utilisateur a le rôle 'employee' ou 'admin'
 */
const adminOrEmployee = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Accès refusé. Veuillez vous connecter.'
    });
  }

  if (!['admin', 'employee'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Cette fonctionnalité nécessite des droits employé ou administrateur.',
      contactAdmin: true
    });
  }

  next();
};

/**
 * Middleware pour vérifier l'accès à une ressource
 * Vérifie que l'utilisateur est soit admin, soit employé, soit le propriétaire de la ressource
 */
const checkResourceAccess = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé. Veuillez vous connecter.'
      });
    }

    if (['admin', 'employee'].includes(req.user.role)) {
      return next();
    }

    const resourceId = req.params[resourceField] || req.body[resourceField];
    if (resourceId && resourceId.toString() === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Vous n\'avez pas les droits nécessaires pour accéder à cette ressource.'
    });
  };
};

module.exports = { 
  protect, 
  admin, 
  adminOrEmployee,
  checkResourceAccess
};