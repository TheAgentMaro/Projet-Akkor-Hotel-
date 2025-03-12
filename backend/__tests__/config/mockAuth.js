const jwt = require('jsonwebtoken');

// Mock du middleware d'authentification pour les tests
const mockProtect = jest.fn((req, res, next) => {
  try {
    let token = req.headers.authorization?.startsWith('Bearer') 
      ? req.headers.authorization.split(' ')[1] 
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé. Veuillez vous connecter pour accéder à cette ressource.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supinfo');
    
    // Dans les tests, on accepte directement le token décodé
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session invalide. Veuillez vous reconnecter.'
    });
  }
});

// Mock du middleware admin pour les tests
const mockAdmin = jest.fn((req, res, next) => {
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
});

// Mock du middleware adminOrEmployee pour les tests
const mockAdminOrEmployee = jest.fn((req, res, next) => {
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
});

// Mock de la fonction de vérification d'accès aux ressources
const mockCheckResourceAccess = (resourceField = 'userId') => {
  return jest.fn((req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé. Veuillez vous connecter.'
      });
    }

    // Admin et employé ont accès à toutes les ressources
    if (['admin', 'employee'].includes(req.user.role)) {
      return next();
    }

    // Pour les utilisateurs normaux, vérifier qu'ils sont propriétaires de la ressource
    const resourceId = req.params[resourceField] || req.body[resourceField];
    if (resourceId && resourceId.toString() === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Vous n\'avez pas les droits nécessaires pour accéder à cette ressource.'
    });
  });
};

module.exports = { 
  mockProtect, 
  mockAdmin, 
  mockAdminOrEmployee,
  mockCheckResourceAccess
};
