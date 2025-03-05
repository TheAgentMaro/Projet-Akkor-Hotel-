const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const { protect, admin } = require('../middleware/auth');
const validator = require('../middleware/validator');

/**
 * @swagger
 * /api/hotels:
 *   get:
 *     summary: Liste tous les hôtels
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, location, createdAt]
 *         description: Champ de tri
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Ordre de tri
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Nombre d'hôtels par page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page
 */
router.get('/', hotelController.getAllHotels);

/**
 * @swagger
 * /api/hotels/{id}:
 *   get:
 *     summary: Obtient un hôtel par son ID
 */
router.get('/:id', hotelController.getHotelById);

// Routes protégées nécessitant les droits admin
router.use(protect, admin);

/**
 * @swagger
 * /api/hotels:
 *   post:
 *     summary: Crée un nouvel hôtel (admin uniquement)
 */
router.post('/', validator.validateHotelCreate, hotelController.createHotel);

/**
 * @swagger
 * /api/hotels/{id}:
 *   put:
 *     summary: Met à jour un hôtel (admin uniquement)
 */
router.put('/:id', validator.validateHotelUpdate, hotelController.updateHotel);

/**
 * @swagger
 * /api/hotels/{id}:
 *   delete:
 *     summary: Supprime un hôtel (admin uniquement)
 */
router.delete('/:id', hotelController.deleteHotel);

module.exports = router;
