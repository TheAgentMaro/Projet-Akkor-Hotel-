const express = require('express');
const cors = require('cors');
const userRoutes = require('../../src/routes/userRoutes');
const authRoutes = require('../../src/routes/authRoutes');
const hotelRoutes = require('../../src/routes/hotelRoutes');
const createError = require('http-errors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotels', hotelRoutes);

// Route 404
app.use((req, res, next) => {
  next(createError(404, 'Route non trouvée'));
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
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

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Erreur serveur'
  });
});

module.exports = app;
