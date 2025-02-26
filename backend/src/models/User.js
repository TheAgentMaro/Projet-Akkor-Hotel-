const mongoose = require('mongoose');

// Modèle utilisateur à implémenter
const userSchema = new mongoose.Schema({
  // Schema à définir
});

module.exports = mongoose.model('User', userSchema);
