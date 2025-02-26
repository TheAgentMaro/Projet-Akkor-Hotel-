# Akkor Hotel Platform

Akkor Hotel est une plateforme de réservation d'hôtels en ligne offrant une expérience utilisateur fluide et optimisée pour le desktop et le mobile. Ce projet comprend un backend sécurisé et un frontend moderne.

## Stack Technique

### Backend
- Node.js avec Express.js
- MongoDB avec Mongoose
- JWT Authentication avec Passport.js
- Validation avec Joi
- Tests avec Jest

### Frontend
- React.js avec Vite
- Material UI + Tailwind CSS
- React Router pour la navigation
- React Hook Form + Yup pour la validation
- Tests avec Vitest et React Testing Library

## Structure du Projet

```
akkor-hotel/
├── backend/                # API Node.js
│   ├── src/
│   │   ├── models/        # Modèles Mongoose
│   │   ├── routes/        # Routes API
│   │   ├── controllers/   # Logique métier
│   │   ├── middleware/    # Middleware personnalisé
│   │   └── config/       # Configuration
│   └── tests/            # Tests unitaires et d'intégration
├── frontend/             # Application React
│   ├── src/
│   │   ├── components/   # Composants React
│   │   ├── pages/       # Pages de l'application
│   │   ├── services/    # Services API
│   │   └── utils/       # Utilitaires
│   └── tests/           # Tests frontend
└── .github/             # Configuration GitHub Actions
```

## Installation

### Prérequis
- Node.js (v18 ou supérieur)
- MongoDB
- Git

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Configurer les variables d'environnement
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Tests

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## CI/CD

Le projet utilise GitHub Actions pour :
- Exécuter les tests
- Vérifier le linting
- Construire l'application
- Déploiement automatique (à configurer)

## Documentation API

La documentation Swagger sera disponible sur `/api-docs` une fois le backend démarré.
