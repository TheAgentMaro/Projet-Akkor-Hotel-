const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const auth = require('../middleware/auth');
const validator = require('../middleware/validator');

/**
 * @swagger
 * tags:
 *   name: Hotels
 *   description: Gestion des hôtels
 */

/**
 * @swagger
 * /api/hotels:
 *   get:
 *     tags: [Hotels]
 *     summary: Liste tous les hôtels
 *     description: Récupère la liste des hôtels avec options de tri et pagination
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, location, createdAt]
 *         description: Champ pour le tri
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Ordre du tri (asc ou desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Nombre maximum d'hôtels à retourner
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de la page
 *     responses:
 *       200:
 *         description: Liste des hôtels récupérée avec succès
 *       400:
 *         description: Paramètres de requête invalides
 */
router.get('/', hotelController.getAllHotels);

/**
 * @swagger
 * /api/hotels:
 *   post:
 *     tags: [Hotels]
 *     summary: Crée un nouvel hôtel
 *     description: Crée un nouvel hôtel (réservé aux administrateurs)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de l'hôtel
 *               location:
 *                 type: string
 *                 description: Localisation de l'hôtel
 *               description:
 *                 type: string
 *                 description: Description détaillée de l'hôtel
 *               picture_list:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des URLs des images de l'hôtel
 *     responses:
 *       201:
 *         description: Hôtel créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé (réservé aux administrateurs)
 */
router.post('/', auth.protect, auth.admin, validator.validateHotelCreate, hotelController.createHotel);

/**
 * @swagger
 * /api/hotels/{id}:
 *   get:
 *     tags: [Hotels]
 *     summary: Obtient un hôtel par son ID
 *     description: Récupère les détails d'un hôtel spécifique
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'hôtel
 *     responses:
 *       200:
 *         description: Détails de l'hôtel récupérés avec succès
 *       404:
 *         description: Hôtel non trouvé
 */
router.get('/:id', hotelController.getHotelById);

/**
 * @swagger
 * /api/hotels/{id}:
 *   put:
 *     tags: [Hotels]
 *     summary: Met à jour un hôtel
 *     description: Met à jour les informations d'un hôtel (réservé aux administrateurs)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'hôtel à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de l'hôtel
 *               location:
 *                 type: string
 *                 description: Localisation de l'hôtel
 *               description:
 *                 type: string
 *                 description: Description détaillée de l'hôtel
 *               picture_list:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des URLs des images de l'hôtel
 *     responses:
 *       200:
 *         description: Hôtel mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé (réservé aux administrateurs)
 *       404:
 *         description: Hôtel non trouvé
 */
router.put('/:id', auth.protect, auth.admin, validator.validateHotelUpdate, hotelController.updateHotel);

/**
 * @swagger
 * /api/hotels/{id}:
 *   delete:
 *     tags: [Hotels]
 *     summary: Supprime un hôtel
 *     description: Supprime un hôtel existant (réservé aux administrateurs)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'hôtel à supprimer
 *     responses:
 *       200:
 *         description: Hôtel supprimé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé (réservé aux administrateurs)
 *       404:
 *         description: Hôtel non trouvé
 */
router.delete('/:id', auth.protect, auth.admin, hotelController.deleteHotel);

module.exports = router;
