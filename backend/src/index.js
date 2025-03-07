require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/database');
const createError = require('http-errors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Akkor Hotel API Documentation"
}));

// Connexion à MongoDB
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Ignorer les requêtes favicon.ico
app.get('/favicon.ico', (req, res) => res.status(204));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);

// Route racine
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Route 404
app.use((req, res, next) => {
  next(createError(404, 'Route non trouvée'));
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  // Ne pas logger les erreurs 404 en production
  if (process.env.NODE_ENV !== 'production' || err.status !== 404) {
    console.error(err);
  }

  // Erreurs de validation Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      error: messages.join(', ')
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Erreur serveur'
  });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`Documentation API disponible sur http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
