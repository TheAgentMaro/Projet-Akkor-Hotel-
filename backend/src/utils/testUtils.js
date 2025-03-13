/**
 * Utilitaires pour les tests
 */

/**
 * Vérifie si un utilisateur a accès à une ressource dans l'environnement de test
 * @param {Object} user - L'utilisateur qui tente d'accéder à la ressource
 * @param {Object|String} resourceOwner - L'objet propriétaire ou son ID
 * @returns {Boolean} - true si l'utilisateur a accès, false sinon
 */
const hasAccessInTest = (user, resourceOwner) => {
  // Les administrateurs ont toujours accès
  if (user && user.role === 'admin') {
    return true;
  }

  if (!user || !resourceOwner) {
    return false;
  }

  // Extraire l'ID de l'utilisateur
  const userIdStr = (user.id || user._id || '').toString();

  // Extraire l'ID du propriétaire de la ressource
  let ownerIdStr;
  
  if (typeof resourceOwner === 'string') {
    ownerIdStr = resourceOwner;
  } else if (typeof resourceOwner === 'object' && resourceOwner !== null) {
    if (resourceOwner._id) {
      ownerIdStr = resourceOwner._id.toString();
    } else if (resourceOwner.id) {
      ownerIdStr = resourceOwner.id.toString();
    } else {
      ownerIdStr = resourceOwner.toString();
    }
  } else {
    ownerIdStr = String(resourceOwner);
  }
  
  // Pour le débogage en environnement de test
  if (process.env.NODE_ENV === 'test') {
    console.log(`Comparing user ID: ${userIdStr} with owner ID: ${ownerIdStr}`);
  }
  
  // Vérifier si l'utilisateur est le propriétaire
  return userIdStr === ownerIdStr;
};

module.exports = {
  hasAccessInTest
};
