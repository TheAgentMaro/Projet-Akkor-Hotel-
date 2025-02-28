const createError = require('http-errors');

const validator = {
  validateRegistration(req, res, next) {
    const { email, pseudo, password } = req.body;

    if (!email || !pseudo || !password) {
      return next(createError(400, 'Tous les champs sont requis'));
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(createError(400, 'Email invalide'));
    }

    // Validation du pseudo
    if (pseudo.length < 3) {
      return next(createError(400, 'Le pseudo doit contenir au moins 3 caractères'));
    }

    // Validation du mot de passe
    if (password.length < 6) {
      return next(createError(400, 'Le mot de passe doit contenir au moins 6 caractères'));
    }

    next();
  },

  validateLogin(req, res, next) {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError(400, 'Email et mot de passe requis'));
    }

    next();
  },

  validateUserUpdate(req, res, next) {
    const { email, pseudo, password } = req.body;

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return next(createError(400, 'Email invalide'));
      }
    }

    if (pseudo && pseudo.length < 3) {
      return next(createError(400, 'Le pseudo doit contenir au moins 3 caractères'));
    }

    if (password && password.length < 6) {
      return next(createError(400, 'Le mot de passe doit contenir au moins 6 caractères'));
    }

    next();
  }
};

module.exports = validator;
