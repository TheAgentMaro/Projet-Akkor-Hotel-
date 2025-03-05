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
 *         description: Champ de tri (name, location, createdAt)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *         description: Ordre de tri (asc, desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'hôtels par page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
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

/**
 * @swagger
 * /api/hotels:
 *   post:
 *     summary: Crée un nouvel hôtel (admin uniquement)
 */
router.post(
  '/',
  protect,
  admin,
  validator.validateHotel,
  hotelController.createHotel
);

/**
 * @swagger
 * /api/hotels/{id}:
 *   put:
 *     summary: Met à jour un hôtel (admin uniquement)
 */
router.put(
  '/:id',
  protect,
  admin,
  validator.validateHotel,
  hotelController.updateHotel
);

/**
 * @swagger
 * /api/hotels/{id}:
 *   delete:
 *     summary: Supprime un hôtel (admin uniquement)
 */
router.delete(
  '/:id',
  protect,
  admin,
  hotelController.deleteHotel
);

module.exports = router;
