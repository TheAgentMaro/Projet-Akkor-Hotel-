// Configuration de la base de données à implémenter
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.info('Tentative de connexion à MongoDB...');
    console.info(`URL: ${process.env.MONGODB_URI}`);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout après 5 secondes
    });

    console.info(`MongoDB Connected: ${conn.connection.host}`);
    console.info(`Database: ${conn.connection.name}`);
    
    // Événements de la base de données
    mongoose.connection.on('error', (err) => {
      console.error('Erreur MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.info('MongoDB déconnecté');
    });

    mongoose.connection.on('reconnected', () => {
      console.info('MongoDB reconnecté');
    });

    // Gestion gracieuse de la fermeture
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.info('Connexion MongoDB fermée suite à l\'arrêt de l\'application');
      process.exit(0);
    });

  } catch (error) {
    console.error(`Erreur de connexion MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
