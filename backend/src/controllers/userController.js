const User = require('../models/User');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');

// Générer un JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const userController = {
  // Créer un nouvel utilisateur
  async register(req, res, next) {
    try {
      const { email, pseudo, password } = req.body;

      // Vérifier si l'email existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw createError(409, 'Cet email est déjà utilisé');
      }

      // Créer l'utilisateur
      const user = await User.create({
        email,
        pseudo,
        password
      });

      // Générer le token
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        data: user.toJSON(),
        token
      });
    } catch (error) {
      next(error);
    }
  },

  // Connexion utilisateur
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Vérifier si l'utilisateur existe
      const user = await User.findOne({ email });
      if (!user) {
        throw createError(401, 'Email ou mot de passe incorrect');
      }

      // Vérifier le mot de passe
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw createError(401, 'Email ou mot de passe incorrect');
      }

      // Générer le token
      const token = generateToken(user);

      res.json({
        success: true,
        data: user.toJSON(),
        token
      });
    } catch (error) {
      next(error);
    }
  },

  // Obtenir le profil de l'utilisateur connecté
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        throw createError(404, 'Utilisateur non trouvé');
      }

      res.json({
        success: true,
        data: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  },

  // Obtenir un utilisateur par ID (admin ou propriétaire uniquement)
  async getUserById(req, res, next) {
    try {
      // Vérifier les permissions
      if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
        throw createError(403, 'Non autorisé');
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        throw createError(404, 'Utilisateur non trouvé');
      }

      res.json({
        success: true,
        data: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  },

  // Mettre à jour un utilisateur (admin ou propriétaire uniquement)
  async updateUser(req, res, next) {
    try {
      // Vérifier les permissions
      if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
        throw createError(403, 'Non autorisé');
      }

      const { email, pseudo, password } = req.body;
      const updateData = { email, pseudo };
      
      if (password) {
        updateData.password = password;
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!user) {
        throw createError(404, 'Utilisateur non trouvé');
      }

      res.json({
        success: true,
        data: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  },

  // Supprimer un utilisateur (admin ou propriétaire uniquement)
  async deleteUser(req, res, next) {
    try {
      // Vérifier les permissions
      if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
        throw createError(403, 'Non autorisé');
      }

      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        throw createError(404, 'Utilisateur non trouvé');
      }

      res.json({
        success: true,
        message: 'Utilisateur supprimé avec succès'
      });
    } catch (error) {
      next(error);
    }
  },

  // Liste des utilisateurs (admin uniquement)
  async getAllUsers(req, res, next) {
    try {
      // Vérifier les permissions
      if (req.user.role !== 'admin') {
        throw createError(403, 'Non autorisé - Réservé aux administrateurs');
      }

      const users = await User.find();
      res.json({
        success: true,
        data: users.map(user => user.toJSON())
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
