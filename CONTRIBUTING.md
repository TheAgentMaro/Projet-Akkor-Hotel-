# Guide de Contribution - Akkor Hotel

## Structure des Branches

```
main (production)
├── backend (développement backend)
│   ├── feature/auth-system
│   ├── feature/hotel-api
│   └── feature/booking-system
└── frontend (développement frontend)
    ├── feature/login-page
    ├── feature/hotel-list
    └── feature/booking-form
```

## Workflow de Développement

### Pour les Développeurs Backend

1. Basez-vous toujours sur la branche `backend` :
```bash
git checkout backend
git pull origin backend
```

2. Créez une branche pour votre fonctionnalité :
```bash
git checkout -b feature/nom-de-la-feature
```

3. Développez votre fonctionnalité avec des commits réguliers :
```bash
git add .
git commit -m "type: description"
```

4. Poussez vos changements :
```bash
git push origin feature/nom-de-la-feature
```

5. Créez une Pull Request vers la branche `backend`

### Pour les Développeurs Frontend

1. Basez-vous toujours sur la branche `frontend` :
```bash
git checkout frontend
git pull origin frontend
```

2. Créez une branche pour votre fonctionnalité :
```bash
git checkout -b feature/nom-de-la-feature
```

3. Développez votre fonctionnalité avec des commits réguliers :
```bash
git add .
git commit -m "type: description"
```

4. Poussez vos changements :
```bash
git push origin feature/nom-de-la-feature
```

5. Créez une Pull Request vers la branche `frontend`

## Convention de Nommage des Commits

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage, point-virgules manquants, etc.
- `refactor`: Refactoring du code
- `test`: Ajout ou modification de tests
- `chore`: Mise à jour des tâches de build, configurations, etc.

Exemple : `feat: Ajout de l'authentification JWT`

## Processus de Review

1. Chaque Pull Request doit être revue par au moins un autre développeur
2. Les tests doivent passer
3. Le code doit suivre les standards du projet (ESLint/Prettier)
4. Les conflits doivent être résolus avant le merge

## Déploiement

1. Les features sont mergées dans `backend` ou `frontend`
2. Une fois stables, `backend` et `frontend` sont mergés dans `main`
3. `main` est déployé en production
