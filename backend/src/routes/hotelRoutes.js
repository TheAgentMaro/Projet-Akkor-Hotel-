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

/**
 * @swagger
 * /hotels:
 *   get:
 *     summary: Lister tous les hôtels
 *     tags: [Hôtels]
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *           enum: [name, location, createdAt]
 *         description: Champ de tri
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           default: desc
 *           enum: [asc, desc]
 *         description: Ordre de tri
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *     responses:
 *       200:
 *         description: Liste des hôtels
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Hotel'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Paramètres invalides
 */
router.get('/', hotelController.getAllHotels);

/**
 * @swagger
 * /hotels/{id}:
 *   get:
 *     summary: Obtenir un hôtel par ID
 *     tags: [Hôtels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'hôtel
 *     responses:
 *       200:
 *         description: Détails de l'hôtel
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HotelResponse'
 *       400:
 *         description: ID invalide
 *       404:
 *         description: Hôtel non trouvé
 */
router.get('/:id', hotelController.getHotelById);

// Routes protégées
router.use(protect);

/**
 * @swagger
 * /hotels/search/availability:
 *   get:
 *     summary: Vérifier la disponibilité d'un hôtel (employés/admins)
 *     tags: [Hôtels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'hôtel
 *       - in: query
 *         name: checkIn
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date d'arrivée
 *       - in: query
 *         name: checkOut
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de départ
 *     responses:
 *       200:
 *         description: Résultat de la disponibilité
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     isAvailable:
 *                       type: boolean
 *                     overlappingBookings:
 *                       type: integer
 *       400:
 *         description: Paramètres manquants
 *       404:
 *         description: Hôtel non trouvé
 */
router.get('/search/availability', adminOrEmployee, hotelController.checkAvailability);

/**
 * @swagger
 * /hotels/stats/occupancy:
 *   get:
 *     summary: Obtenir les statistiques d'occupation (employés/admins)
 *     tags: [Hôtels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'hôtel
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin
 *     responses:
 *       200:
 *         description: Statistiques d'occupation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalDays:
 *                       type: integer
 *                     occupiedDays:
 *                       type: integer
 *                     occupancyRate:
 *                       type: number
 *                     totalBookings:
 *                       type: integer
 *       400:
 *         description: Paramètres manquants
 *       404:
 *         description: Hôtel non trouvé
 */
router.get('/stats/occupancy', adminOrEmployee, hotelController.getOccupancyStats);

/**
 * @swagger
 * /hotels/{id}/status:
 *   put:
 *     summary: Mettre à jour le statut d'un hôtel (employés/admins)
 *     tags: [Hôtels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'hôtel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, maintenance, closed]
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HotelResponse'
 *       400:
 *         description: Statut invalide
 *       404:
 *         description: Hôtel non trouvé
 */
router.put('/:id/status', adminOrEmployee, hotelController.updateHotelStatus);

/**
 * @swagger
 * /hotels:
 *   post:
 *     summary: Créer un nouvel hôtel (admin)
 *     tags: [Hôtels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               pictures:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *             required:
 *               - name
 *               - location
 *               - description
 *     responses:
 *       201:
 *         description: Hôtel créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HotelResponse'
 *       400:
 *         description: Données invalides
 */
router.post('/', admin, upload.array('pictures', 5), validator.validateHotelCreate, hotelController.createHotel);

/**
 * @swagger
 * /hotels/{id}:
 *   put:
 *     summary: Mettre à jour un hôtel (admin)
 *     tags: [Hôtels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'hôtel
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               pictures:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               keepExistingImages:
 *                 type: boolean
 *               picture_list:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Hôtel mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HotelResponse'
 *       404:
 *         description: Hôtel non trouvé
 */
router.put('/:id', admin, upload.array('pictures', 5), validator.validateHotelUpdate, hotelController.updateHotel);

/**
 * @swagger
 * /hotels/{id}:
 *   delete:
 *     summary: Supprimer un hôtel (admin)
 *     tags: [Hôtels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'hôtel
 *     responses:
 *       200:
 *         description: Hôtel supprimé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Hôtel non trouvé
 */
router.delete('/:id', admin, hotelController.deleteHotel);

module.exports = router;