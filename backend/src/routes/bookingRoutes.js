const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, admin, adminOrEmployee } = require('../middleware/auth');
const validator = require('../middleware/validator');

// Toutes les routes nécessitent d'être authentifié
router.use(protect);

// Routes pour tous les utilisateurs authentifiés
router.post('/', validator.validateBookingCreate, bookingController.createBooking);
router.get('/me', bookingController.getUserBookings);
router.put('/:id/cancel', bookingController.cancelBooking);

// Routes accessibles aux propriétaires, employés et admins
router.get('/:id', bookingController.getBookingById);
router.put('/:id', validator.validateBookingUpdate, bookingController.updateBooking);

// Routes pour employés et admins
router.get('/', adminOrEmployee, bookingController.getAllBookings);

// Routes admin uniquement
router.delete('/:id', admin, bookingController.deleteBooking);

module.exports = router;