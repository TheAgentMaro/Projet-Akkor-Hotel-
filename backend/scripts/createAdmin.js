const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

async function createAdminUser() {
  const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/akkor_hotel";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const usersCollection = db.collection('users');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await usersCollection.findOne({ email: 'admin@akkor-hotel.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Créer l'utilisateur admin
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const adminUser = {
      email: 'admin@akkor-hotel.com',
      password: hashedPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'Akkor',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(adminUser);
    console.log('Admin user created successfully:', result.insertedId);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await client.close();
  }
}

createAdminUser();
