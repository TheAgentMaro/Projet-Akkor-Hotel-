const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UnauthorizedError } = require('../utils/errors');

// Middleware pour protéger les routes
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Vérifier si le token est présent dans les headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Si pas de token, renvoyer une erreur
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé - Token manquant'
      });
    }

    try {
      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Récupérer l'utilisateur
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Ajouter l'utilisateur à la requête
      req.user = user;
      next();
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      return res.status(401).json({
        success: false,
        message: 'Non autorisé - Token invalide'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Middleware pour vérifier si l'utilisateur est admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Non autorisé - Accès administrateur requis'
    });
  }
};

// Middleware pour vérifier si l'utilisateur est propriétaire de la ressource
const owner = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.id === req.params.userId)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Non autorisé - Accès propriétaire requis'
    });
  }
};

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Le token expire dans 30 jours
  });
};

module.exports = {
  protect,
  admin,
  owner,
  generateToken
};