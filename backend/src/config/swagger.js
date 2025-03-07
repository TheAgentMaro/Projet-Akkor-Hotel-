const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Akkor Hotel API',
      version: '1.0.0',
      description: 'API de réservation d\'hôtels Akkor Hotel',
      contact: {
        name: 'Support Akkor Hotel',
        email: 'support@akkor-hotel.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints pour l\'authentification'
      },
      {
        name: 'Users',
        description: 'Gestion des utilisateurs'
      },
      {
        name: 'Hotels',
        description: 'Gestion des hôtels'
      },
      {
        name: 'Bookings',
        description: 'Gestion des réservations'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  // Chemins vers les fichiers contenant les annotations
  apis: [
    './src/routes/*.js',
    './src/models/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
