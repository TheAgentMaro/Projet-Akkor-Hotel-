const User = require('../models/User');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');

const JWT_SECRET = process.env.JWT_SECRET || 'supinfo';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const userController = {
  async register(req, res, next) {
    try {
      const { email, pseudo, password } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw createError(409, 'Cet email est déjà utilisé');
      }
      const user = await User.create({ email, pseudo, password });
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

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw createError(401, 'Email ou mot de passe incorrect');
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw createError(401, 'Email ou mot de passe incorrect');
      }
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

  async getUserById(req, res, next) {
    try {
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

  async updateUser(req, res, next) {
    try {
      const userId = req.params.id || req.user.id; // Utiliser req.user.id pour /me
      const { email, pseudo, password } = req.body;
      const updateData = {};
      if (email) updateData.email = email;
      if (pseudo) updateData.pseudo = pseudo;
      if (password) updateData.password = password;

      const user = await User.findByIdAndUpdate(
        userId,
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

  async deleteUser(req, res, next) {
    try {
      const userId = req.params.id || req.user.id; // Utiliser req.user.id pour /me
      const user = await User.findById(userId);
      if (!user) {
        throw createError(404, 'Utilisateur non trouvé');
      }
      await user.deleteOne();
      res.json({
        success: true,
        message: 'Utilisateur supprimé avec succès'
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllUsers(req, res, next) {
    try {
      const isSearchRequest = req.path === '/search' || req.query.query;
      if (!isSearchRequest && req.user.role !== 'admin') {
        throw createError(403, 'Non autorisé - Réservé aux administrateurs');
      }
      if (isSearchRequest && !['admin', 'employee'].includes(req.user.role)) {
        throw createError(403, 'Non autorisé - Réservé aux administrateurs et employés');
      }

      let query = {};
      if (isSearchRequest && req.query.query) {
        const searchTerm = req.query.query.trim();
        query = {
          $or: [
            { email: { $regex: searchTerm, $options: 'i' } },
            { pseudo: { $regex: searchTerm, $options: 'i' } }
          ]
        };
      }

      const users = await User.find(query);
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