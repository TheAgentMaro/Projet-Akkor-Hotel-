const express = require('express');
const cors = require('cors');
const createError = require('http-errors');

// Routes
const authRoutes = require('../../src/routes/authRoutes');
const userRoutes = require('../../src/routes/userRoutes');
const hotelRoutes = require('../../src/routes/hotelRoutes');
const bookingRoutes = require('../../src/routes/bookingRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);

// Route 404
app.use((req, res, next) => {
  next(createError(404, 'Route non trouvée'));
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  // En mode test, on ne log que les erreurs inattendues
  if (process.env.NODE_ENV !== 'test' || 
      (err.status !== 400 && err.status !== 401 && err.status !== 403 && err.status !== 404 && err.status !== 409)) {
    console.error(err);
  }

  // Erreurs de validation Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      error: 'Erreur de validation',
      messages
    });
  }

  // Erreur de duplication MongoDB
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: 'Cette valeur existe déjà'
    });
  }

  // Erreur de cast MongoDB (ID invalide)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'ID invalide'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Erreur serveur'
  });
});

module.exports = app;
