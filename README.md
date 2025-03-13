# Projet Akkor Hotel

## Table des matières
1. [Aperçu du projet](#aperçu-du-projet)
2. [Fonctionnalités](#fonctionnalités)
3. [Technologies utilisées](#technologies-utilisées)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Utilisation](#utilisation)
7. [Tests](#tests)
8. [CI/CD](#cicd)
9. [Contribution](#contribution)
10. [Licence](#licence)

## Aperçu du projet
Akkor Hotel Ltd est une entreprise qui vise à vous offrir la meilleure expérience pour réserver un hôtel partout dans le monde. Notre plateforme vous permet de gérer toutes les tâches liées à la recherche d'un lieu, sa réservation, le paiement en ligne et la reprogrammation si nécessaire.

Nous proposons une interface élégante et centrée sur l'expérience utilisateur qui fonctionne aussi bien sur ordinateur que sur mobile.

## Fonctionnalités
### Gestion des utilisateurs
#### Pour les administrateurs
- Gestion complète des utilisateurs (CRUD)
- Modification des rôles des utilisateurs
- Gestion des hôtels et des réservations
- Accès à toutes les réservations

#### Pour les employés
- Recherche et consultation des utilisateurs
- Accès aux informations des réservations
- Gestion limitée des hôtels

#### Pour les utilisateurs standard
- Gestion de leur profil (consultation, mise à jour, suppression)
- Gestion de leurs propres réservations uniquement
- Consultation des hôtels sans authentification

### Authentification
- Système d'inscription/connexion/déconnexion
- Protection des routes via JWT
- Accès public aux données de consultation des hôtels
- Accès protégé pour toutes les opérations d'écriture

### Gestion des hôtels
- Liste complète des hôtels avec tri par date, nom ou emplacement
- Pagination des résultats avec limite personnalisable
- Création, consultation, mise à jour et suppression d'hôtels (CRUD)
- Restriction des opérations de création, mise à jour et suppression aux administrateurs uniquement

### Gestion des réservations
- Création, consultation, mise à jour et annulation de réservations
- Restriction d'accès : les utilisateurs ne voient que leurs propres réservations
- Interface administrateur pour rechercher des réservations par ID, nom ou email d'utilisateur
- Validation complète des données avec retours appropriés

## Technologies utilisées
### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ORM
- JWT pour l'authentification
- Multer pour la gestion des fichiers
- Validation avec Joi/Yup
- Documentation Swagger/OpenAPI
- Tests avec Jest et Supertest

### Frontend
- React.js
- React Router pour la navigation
- Context API pour la gestion de l'état
- Axios pour les requêtes HTTP
- React Hook Form pour la validation des formulaires
- Tailwind CSS pour le style
- Tests avec Vitest, React Testing Library et MSW

## Installation
### Prérequis
- Node.js (v14 ou supérieur)
- MongoDB

### Étapes
1. Cloner le dépôt :
   ```bash
   git clone https://github.com/theagentmaro/projet-akkor-hotel.git
   ```
2. Installer les dépendances du backend :
   ```bash
   cd backend
   npm install
   ```
3. Installer les dépendances du frontend :
   ```bash
   cd ../frontend
   npm install
   ```

## Configuration
1. Créer un fichier `.env` dans le dossier `backend` avec les variables suivantes :
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/akkor-hotel
   JWT_SECRET=votre_secret_jwt
   ```
2. Créer un fichier `.env` dans le dossier `frontend` avec les variables suivantes :
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

### Créer un administrateur (optionnel) :
Cette commande crée un utilisateur admin avec les identifiants:
- Email: admin@akkor-hotel.com
- Mot de passe: Admin123!

## Utilisation
1. Démarrer le serveur backend :
   ```bash
   cd backend
   npm run dev
   ```
2. Démarrer le serveur frontend :
   ```bash
   cd frontend
   npm run dev
   ```
3. Accéder à l'application via `http://localhost:5173`.
4. La documentation de l'API est disponible à l'adresse `http://localhost:3000/api-docs`.

## Tests
Le projet dispose d'une suite complète de tests unitaires, d'intégration et end-to-end.

### Exécuter les tests backend :
```bash
cd backend
npm test
```

### Exécuter les tests frontend :
```bash
cd frontend
npm test
```

Les tests couvrent :
- Tests unitaires pour les fonctions et composants
- Tests d'intégration pour les services API
- Tests end-to-end pour les parcours utilisateur clés
- Cas d'erreur et cas limites pour garantir la robustesse

## CI/CD
Le projet utilise GitHub Actions pour l'intégration continue et le déploiement continu.

### Workflow de pull request :
- Exécution de tous les tests
- Vérification du formatage du code
- Blocage de la fusion si les tests échouent ou s'il y a des commentaires non résolus

### Workflow de déploiement (branche principale) :
- Exécution de tous les tests
- Vérification de sécurité des dépendances
- Construction de l'application
- Préparation pour le déploiement

## Contribution
1. Forker le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Committer vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pousser la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

Chaque Pull Request doit :
- Être revue par au moins une personne
- Passer tous les tests automatisés
- Ne pas avoir de commentaires ouverts

## Licence
Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.
