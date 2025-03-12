# Projet Akkor Hotel

## Table des matières
1. [Introduction](#introduction)
2. [Fonctionnalités](#fonctionnalités)
3. [Technologies utilisées](#technologies-utilisées)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Utilisation](#utilisation)
7. [Tests](#tests)
8. [Contribution](#contribution)
9. [Licence](#licence)

## Introduction
Le projet Akkor Hotel est une application web moderne pour la gestion des hôtels et des réservations. Il offre une interface intuitive pour les administrateurs, les employés et les utilisateurs finaux, avec des fonctionnalités adaptées à chaque rôle.

## Fonctionnalités
### Pour les administrateurs
- Gestion complète des utilisateurs (CRUD)
- Modification des rôles des utilisateurs
- Gestion des hôtels et des réservations

### Pour les employés
- Recherche et consultation des utilisateurs
- Accès aux informations des réservations
- Gestion limitée des hôtels

### Pour les utilisateurs
- Gestion de leur profil (mise à jour, suppression)
- Gestion de leurs réservations
- Consultation des hôtels

## Technologies utilisées
### Backend
- Node.js
- Express.js
- MongoDB
- JWT pour l'authentification
- Yup pour la validation des formulaires

### Frontend
- React.js
- React Router pour la navigation
- Context API pour la gestion de l'état
- Axios pour les requêtes HTTP
- Tailwind CSS pour le style

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
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/akkor-hotel
   JWT_SECRET=votre_secret_jwt
   ```
2. Créer un fichier `.env` dans le dossier `frontend` avec les variables suivantes :
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

## Utilisation
1. Démarrer le serveur backend :
   ```bash
   cd backend
   npm start
   ```
2. Démarrer le serveur frontend :
   ```bash
   cd frontend
   npm start
   ```
3. Accéder à l'application via `http://localhost:3000`.

## Tests
Pour exécuter les tests :
```bash
cd backend
npm test

cd ../frontend
npm test
```

## Contribution
1. Forker le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Committer vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pousser la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence
Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.
