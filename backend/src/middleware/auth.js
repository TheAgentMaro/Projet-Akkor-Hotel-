const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.startsWith('Bearer') 
      ? req.headers.authorization.split(' ')[1] 
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé - Token manquant'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé - Token invalide'
    });
  }
};

const admin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Non autorisé - Accès administrateur requis'
    });
  }
};

const adminOrEmployee = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.role === 'employee') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Non autorisé - Accès administrateur ou employé requis'
    });
  }
};

module.exports = { protect, admin, adminOrEmployee };