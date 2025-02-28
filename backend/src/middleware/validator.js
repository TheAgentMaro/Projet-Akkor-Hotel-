const createError = require('http-errors');

const validator = {
  validateRegister(req, res, next) {
    const { email, pseudo, password } = req.body;

    if (!email || !pseudo || !password) {
      return next(createError(400, 'Tous les champs sont requis'));
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return next(createError(400, 'Format email invalide'));
    }

    if (pseudo.length < 3 || pseudo.length > 30) {
      return next(createError(400, 'Le pseudo doit faire entre 3 et 30 caractères'));
    }

    if (password.length < 6) {
      return next(createError(400, 'Le mot de passe doit faire au moins 6 caractères'));
    }

    next();
  },

  validateLogin(req, res, next) {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError(400, 'Email et mot de passe requis'));
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return next(createError(400, 'Format email invalide'));
    }

    next();
  },

  validateUpdate(req, res, next) {
    const { email, pseudo, password } = req.body;

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return next(createError(400, 'Format email invalide'));
    }

    if (pseudo && (pseudo.length < 3 || pseudo.length > 30)) {
      return next(createError(400, 'Le pseudo doit faire entre 3 et 30 caractères'));
    }

    if (password && password.length < 6) {
      return next(createError(400, 'Le mot de passe doit faire au moins 6 caractères'));
    }

    next();
  }
};

module.exports = validator;
