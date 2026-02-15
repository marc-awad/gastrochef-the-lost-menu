# 🐳 Documentation Docker - GastroChef: The Lost Menu

## Vue d'ensemble

Cette application est entièrement dockerisée avec Docker Compose pour faciliter le développement et le déploiement.

## Architecture des conteneurs

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Client (React/Vite)                            │
│  Port: 3000                                     │
│  Nginx serving static files                     │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 │ HTTP requests
                 │
┌────────────────▼────────────────────────────────┐
│                                                 │
│  Server (Node.js/Express)                       │
│  Port: 5000                                     │
│  API REST + WebSockets                          │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 │ SQL queries
                 │
┌────────────────▼────────────────────────────────┐
│                                                 │
│  Database (MySQL 8.0)                           │
│  Port: 3306                                     │
│  Volume persistant: mysql_data                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Prérequis

- Docker >= 20.10
- Docker Compose >= 2.0

Vérifier les versions :

```bash
docker --version
docker-compose --version
```

## Installation rapide

### 1. Cloner le projet

```bash
git clone <repository-url>
cd gastro-chef
```

### 2. Configuration des variables d'environnement

```bash
cp .env.example .env
```

Modifier le fichier `.env` selon vos besoins (optionnel pour le développement).

### 3. Lancer l'application

```bash
docker-compose up
```

L'application sera accessible sur :

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000
- **Base de données** : localhost:3306

### 4. Arrêter l'application

```bash
# Arrêt simple (conteneurs supprimés)
docker-compose down

# Arrêt avec suppression des volumes (⚠️ perte de données)
docker-compose down -v
```

## Commandes Docker essentielles

### Démarrage

```bash
# Lancer en arrière-plan (mode détaché)
docker-compose up -d

# Lancer avec rebuild des images
docker-compose up --build

# Lancer un seul service
docker-compose up database
```

### Logs

```bash
# Voir tous les logs
docker-compose logs

# Suivre les logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs server
docker-compose logs -f client
```

### Gestion des conteneurs

```bash
# Lister les conteneurs en cours
docker-compose ps

# Arrêter sans supprimer
docker-compose stop

# Redémarrer un service
docker-compose restart server

# Supprimer tous les conteneurs et volumes
docker-compose down -v
```

### Accéder à un conteneur

```bash
# Shell interactif sur le serveur
docker-compose exec server sh

# Shell sur la base de données
docker-compose exec database mysql -u root -p

# Exécuter une commande
docker-compose exec server npm run seed
```

### Rebuild

```bash
# Rebuild tous les services
docker-compose build

# Rebuild un service spécifique
docker-compose build server

# Rebuild sans cache
docker-compose build --no-cache
```

## Structure des volumes

### Volume persistant

Le volume `mysql_data` conserve les données de la base de données entre les redémarrages.

```bash
# Lister les volumes
docker volume ls

# Inspecter le volume
docker volume inspect gastro-chef_mysql_data

# Supprimer le volume (⚠️ perte de données)
docker volume rm gastro-chef_mysql_data
```

### Volumes de développement

Les dossiers `./server` et `./client` sont montés en volumes pour le hot-reload en développement.

## Variables d'environnement

### Base de données

- `DB_NAME` : Nom de la base (défaut: `gastrochef`)
- `DB_USER` : Utilisateur MySQL (défaut: `gastrochef_user`)
- `DB_PASSWORD` : Mot de passe MySQL (défaut: `userpassword`)
- `DB_HOST` : Hôte de la base (défaut: `database`)

### Backend

- `JWT_SECRET` : Clé secrète pour les tokens JWT (**À CHANGER EN PRODUCTION**)
- `PORT` : Port du serveur (défaut: `5000`)
- `CLIENT_URL` : URL du frontend pour CORS

### Frontend

- `VITE_API_URL` : URL de l'API backend

## Troubleshooting

### Problème 1 : Port déjà utilisé

**Erreur** :

```
Error starting userland proxy: listen tcp4 0.0.0.0:3000: bind: address already in use
```

**Solution** :

```bash
# Trouver le processus utilisant le port
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Changer le port dans docker-compose.yml
ports:
  - "3001:80"  # Utiliser 3001 au lieu de 3000
```

### Problème 2 : Base de données non prête

**Erreur** :

```
Error: connect ECONNREFUSED database:3306
```

**Solution** :

```bash
# Vérifier le healthcheck
docker-compose ps

# Attendre que la DB soit "healthy"
# Ou redémarrer le service server
docker-compose restart server
```

### Problème 3 : Erreur de build

**Erreur** :

```
ERROR [build 4/7] RUN npm ci
```

**Solution** :

```bash
# Rebuild sans cache
docker-compose build --no-cache server

# Supprimer les images orphelines
docker image prune -a
```

### Problème 4 : Volume de données corrompu

**Symptômes** :

- La base refuse de démarrer
- Erreurs SQL inexpliquées

**Solution** :

```bash
# Supprimer le volume et recréer
docker-compose down -v
docker volume rm gastro-chef_mysql_data
docker-compose up -d
```

### Problème 5 : Hot reload ne fonctionne pas

**Solution** :

```bash
# Vérifier les volumes dans docker-compose.yml
volumes:
  - ./server:/app
  - /app/node_modules

# Redémarrer le service
docker-compose restart server
```

### Problème 6 : Erreurs de permissions

**Erreur** :

```
EACCES: permission denied
```

**Solution** :

```bash
# Linux/Mac: Changer les permissions
sudo chown -R $USER:$USER .

# Ou modifier le Dockerfile pour utiliser un user non-root
```

## Commandes de maintenance

### Seed de la base de données

```bash
# Via Docker
docker-compose exec server npm run seed

# Ou ajouter dans docker-compose.yml (déjà fait)
command: sh -c "npm run seed && node dist/app.js"
```

### Backup de la base de données

```bash
# Exporter
docker-compose exec database mysqldump -u root -p gastrochef > backup.sql

# Importer
docker-compose exec -T database mysql -u root -p gastrochef < backup.sql
```

### Nettoyer Docker

```bash
# Supprimer tous les conteneurs arrêtés
docker container prune

# Supprimer toutes les images inutilisées
docker image prune -a

# Nettoyer complètement (⚠️ tout supprimer)
docker system prune -a --volumes
```

## Configuration avancée

### Mode développement vs production

**Développement** (docker-compose.yml actuel) :

- Volumes montés pour hot-reload
- Logs verbeux
- Seed automatique

**Production** (à créer : docker-compose.prod.yml) :

```yaml
services:
  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
    restart: always
    # Pas de volumes montés
```

```bash
# Lancer en production
docker-compose -f docker-compose.prod.yml up -d
```

### Réseau personnalisé

Le réseau `gastrochef-network` est de type `bridge` et permet la communication entre conteneurs.

```bash
# Inspecter le réseau
docker network inspect gastro-chef_gastrochef-network

# Tester la connectivité
docker-compose exec server ping database
```

### Monitoring

```bash
# Stats en temps réel
docker stats

# Ressources utilisées
docker-compose top
```

## Checklist de déploiement

- [ ] Modifier `.env` avec des valeurs de production
- [ ] Changer `JWT_SECRET` (générer un secret fort)
- [ ] Configurer les variables `DB_PASSWORD`
- [ ] Tester la connexion à la base de données
- [ ] Vérifier les healthchecks
- [ ] Tester le seed de données
- [ ] Vérifier les logs : `docker-compose logs`
- [ ] Accéder à l'application : http://localhost:3000

## Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Best practices Docker](https://docs.docker.com/develop/dev-best-practices/)

---

**✅ TICKET #023 - Dockerisation complète : IMPLÉMENTÉ**

🎯 Niveau 18/20 atteint !
