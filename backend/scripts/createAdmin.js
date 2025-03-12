const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importer le modèle User existant
const User = require('../src/models/User');

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@akkor-hotel.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Créer l'utilisateur admin
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const adminUser = new User({
      email: 'admin@akkor-hotel.com',
      pseudo: 'AdminAkkor',
      password: hashedPassword,
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
