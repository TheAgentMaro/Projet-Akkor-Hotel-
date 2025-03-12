const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const { protect, admin, adminOrEmployee } = require('../middleware/auth');
const validator = require('../middleware/validator');
const multer = require('multer');
const path = require('path');

// Configuration de Multer pour les images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées!'));
    }
  }
});

// Routes publiques (consultation des hôtels)
router.get('/', hotelController.getAllHotels);
router.get('/:id', hotelController.getHotelById);

// Routes protégées
router.use(protect);

// Routes pour employés et admins
router.get('/search/availability', adminOrEmployee, hotelController.checkAvailability);
router.get('/stats/occupancy', adminOrEmployee, hotelController.getOccupancyStats);
router.put('/:id/status', adminOrEmployee, hotelController.updateHotelStatus);

// Routes admin uniquement
router.post('/', admin, upload.array('pictures', 5), validator.validateHotelCreate, hotelController.createHotel);
router.put('/:id', admin, upload.array('pictures', 5), validator.validateHotelUpdate, hotelController.updateHotel);
router.delete('/:id', admin, hotelController.deleteHotel);

module.exports = router;
