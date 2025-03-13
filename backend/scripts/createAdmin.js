const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../src/models/User');

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@akkor-hotel.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.disconnect();
      return;
    }

    // Créer l'utilisateur admin
    const adminUser = new User({
      email: 'admin@akkor-hotel.com',
      pseudo: 'AdminAkkor',
      password: 'Admin123!',  // Le modèle User va hasher automatiquement le mot de passe
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully:', adminUser._id);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdminUser();
