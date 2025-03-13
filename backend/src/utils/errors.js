// src/utils/errors.js

class CustomError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  class UnauthorizedError extends CustomError {
    constructor(message = 'Non autorisé') {
      super(message, 401);
    }
  }
  
  class ForbiddenError extends CustomError {
    constructor(message = 'Accès interdit') {
      super(message, 403);
    }
  }
  
  class NotFoundError extends CustomError {
    constructor(message = 'Ressource non trouvée') {
      super(message, 404);
    }
  }
  
  class BadRequestError extends CustomError {
    constructor(message = 'Requête invalide') {
      super(message, 400);
    }
  }
  
  module.exports = {
    CustomError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    BadRequestError
  };