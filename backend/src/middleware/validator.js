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
  },

  validateHotelCreate(req, res, next) {
    const { name, location, description } = req.body;

    if (!name || !location || !description) {
      return next(createError(400, 'Nom, localisation et description sont requis'));
    }

    if (name.length < 2) {
      return next(createError(400, 'Le nom doit contenir au moins 2 caractères'));
    }

    if (location.length < 2) {
      return next(createError(400, 'La localisation doit contenir au moins 2 caractères'));
    }

    if (description.length < 10) {
      return next(createError(400, 'La description doit contenir au moins 10 caractères'));
    }

    next();
  },

  validateHotelUpdate(req, res, next) {
    const { name, location, description } = req.body;

    if (name && name.length < 2) {
      return next(createError(400, 'Le nom doit contenir au moins 2 caractères'));
    }

    if (location && location.length < 2) {
      return next(createError(400, 'La localisation doit contenir au moins 2 caractères'));
    }

    if (description && description.length < 10) {
      return next(createError(400, 'La description doit contenir au moins 10 caractères'));
    }

    next();
  },

  validateBookingCreate(req, res, next) {
    const { hotel, checkIn, checkOut, numberOfGuests, totalPrice } = req.body;

    if (!hotel || !checkIn || !checkOut || !numberOfGuests || totalPrice === undefined) {
      return next(createError(400, 'Tous les champs sont requis'));
    }

    // Validation des dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const now = new Date();

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return next(createError(400, 'Dates invalides'));
    }

    if (checkInDate < now) {
      return next(createError(400, 'La date d\'arrivée ne peut pas être dans le passé'));
    }

    if (checkInDate >= checkOutDate) {
      return next(createError(400, 'La date de départ doit être après la date d\'arrivée'));
    }

    // Validation du nombre de personnes
    if (numberOfGuests < 1) {
      return next(createError(400, 'Au moins une personne requise'));
    }

    // Validation du prix
    if (totalPrice < 0) {
      return next(createError(400, 'Le prix ne peut pas être négatif'));
    }

    next();
  },

  validateBookingUpdate(req, res, next) {
    const { checkIn, checkOut, numberOfGuests, totalPrice } = req.body;

    if (checkIn || checkOut) {
      const checkInDate = new Date(checkIn || req.booking.checkIn);
      const checkOutDate = new Date(checkOut || req.booking.checkOut);
      const now = new Date();

      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        return next(createError(400, 'Dates invalides'));
      }

      if (checkInDate < now) {
        return next(createError(400, 'La date d\'arrivée ne peut pas être dans le passé'));
      }

      if (checkInDate >= checkOutDate) {
        return next(createError(400, 'La date de départ doit être après la date d\'arrivée'));
      }
    }

    if (numberOfGuests !== undefined && numberOfGuests < 1) {
      return next(createError(400, 'Au moins une personne requise'));
    }

    if (totalPrice !== undefined && totalPrice < 0) {
      return next(createError(400, 'Le prix ne peut pas être négatif'));
    }

    next();
  }
};

module.exports = validator;
