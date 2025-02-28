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

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Route 404
app.use((req, res, next) => {
  next(createError(404, 'Route non trouvée'));
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err);

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
    error: err.message || 'Erreur serveur',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Démarrer le serveur seulement si nous ne sommes pas en test
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.info(`Serveur démarré sur le port ${PORT}`);
    console.info(`Documentation API disponible sur http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
