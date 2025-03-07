const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/auth');
const validator = require('../middleware/validator');

// Toutes les routes nécessitent d'être authentifié
router.use(protect);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Créer une nouvelle réservation
 *     security:
 *       - BearerAuth: []
 */
router.post('/', validator.validateBookingCreate, bookingController.createBooking);

/**
 * @swagger
 * /api/bookings/me:
 *   get:
 *     summary: Obtenir les réservations de l'utilisateur connecté
 *     security:
 *       - BearerAuth: []
 */
router.get('/me', bookingController.getUserBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Obtenir une réservation par ID
 *     security:
 *       - BearerAuth: []
 */
router.get('/:id', bookingController.getBookingById);

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: Mettre à jour une réservation
 *     security:
 *       - BearerAuth: []
 */
router.put('/:id', validator.validateBookingUpdate, bookingController.updateBooking);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   put:
 *     summary: Annuler une réservation
 *     security:
 *       - BearerAuth: []
 */
router.put('/:id/cancel', bookingController.cancelBooking);

// Routes admin uniquement
router.use(admin);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Obtenir toutes les réservations (admin uniquement)
 *     security:
 *       - BearerAuth: []
 */
router.get('/', bookingController.getAllBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Supprimer une réservation (admin uniquement)
 *     security:
 *       - BearerAuth: []
 */
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
