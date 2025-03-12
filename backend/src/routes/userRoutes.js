const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin, adminOrEmployee } = require('../middleware/auth');
const validator = require('../middleware/validator');

// Routes publiques
router.post('/register', validator.validateRegistration, userController.register);
router.post('/login', validator.validateLogin, userController.login);

// Routes protégées
router.use(protect);

// Routes pour tous les utilisateurs authentifiés (gestion de son profil)
router.get('/me', userController.getProfile);
router.put('/me', validator.validateUserUpdate, userController.updateUser);
router.delete('/me', userController.deleteUser);

// Routes pour employés et admins
router.get('/search', adminOrEmployee, userController.getAllUsers);
router.get('/:id', adminOrEmployee, userController.getUserById);

// Routes admin uniquement
router.get('/', admin, userController.getAllUsers);
router.put('/:id', admin, validator.validateUserUpdate, userController.updateUser);
router.delete('/:id', admin, userController.deleteUser);

module.exports = router;
