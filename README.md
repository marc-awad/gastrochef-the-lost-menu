# 🍽️ GastroChef – The Lost Menu

**Projet B3 Fullstack** – Jeu de gestion de restaurant en temps réel

---

## 📖 Description

Vous reprenez le restaurant mythique **"La Tour d'Émeraude"**, mais le chef précédent est parti avec le livre de recettes. Vous devez :
- 🧪 Redécouvrir les recettes en expérimentant dans le laboratoire
- 🍽️ Servir les clients en temps réel avant expiration des commandes
- 💰 Gérer votre trésorerie (achats, revenus)
- ⭐ Maintenir vos étoiles en servant les commandes VIP

**Game Over si :** Satisfaction < 0 OU Trésorerie < 0 OU Étoiles < 1

---

## 🛠️ Stack Technique

**Backend :** Node.js 18, Express 5, TypeScript, MySQL 8, Sequelize, Socket.io, JWT  
**Frontend :** React 19, TypeScript, Vite, Tailwind CSS, Socket.io Client, Axios, Recharts  
**DevOps :** Docker, Docker Compose, Nginx

---

## 📦 Installation

### Prérequis
- Node.js 18+
- MySQL 8+ (ou Docker)
- npm

### Développement (sans Docker)

```bash
# 1. Cloner le projet
git clone https://github.com/votre-username/gastrochef.git
cd gastrochef

# 2. Backend
cd server
npm install
cp .env.example .env  # Configurer les variables (voir section Configuration)
npm run seed          # Alimenter la BDD avec des recettes de test
npm run dev           # Démarrer sur http://localhost:5000

# 3. Frontend (nouveau terminal)
cd ../client
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev           # Démarrer sur http://localhost:5173
```

### Production (avec Docker)

```bash
# Cloner le projet
git clone https://github.com/votre-username/gastrochef.git
cd gastrochef

# Configurer .env à la racine
cp .env.example .env

# Démarrer tous les services
docker-compose up -d

# Attendre 30s puis alimenter la BDD
docker-compose exec server npm run seed

# ✅ Application disponible sur http://localhost:3000
# ✅ API disponible sur http://localhost:5000
```

---

## ⚙️ Configuration

### Variables d'Environnement (server/.env)

```env
# Serveur
PORT=5000
NODE_ENV=development

# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=              # Vide si pas de mot de passe
DB_NAME=gastrochef
DB_PORT=3306

# JWT Secret (MINIMUM 32 caractères aléatoires)
JWT_SECRET=votre_secret_minimum_32_caracteres_aleatoires

# Client URL (pour CORS)
CLIENT_URL=http://localhost:5173
```

**⚠️ Générer un JWT_SECRET sécurisé :**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

## 🚀 Commandes

### Développement
```bash
# Backend
npm run dev          # Démarrer le serveur (ts-node)
npm run build        # Compiler TypeScript
npm run seed         # Alimenter la BDD

# Frontend
npm run dev          # Démarrer Vite
npm run build        # Build de production
```

### Docker
```bash
docker-compose up -d              # Démarrer tous les services
docker-compose logs -f            # Voir les logs
docker-compose exec server npm run seed  # Alimenter la BDD
docker-compose down               # Arrêter
docker-compose down -v            # Arrêter + supprimer les données
```

---

## 📂 Structure du Projet

```
gastrochef/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── context/        # AuthContext + GameContext
│   │   ├── pages/          # Pages principales
│   │   ├── services/       # API + WebSocket
│   │   └── App.tsx
│   └── package.json
│
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── config/         # Config DB + validation env
│   │   ├── controllers/    # Logique métier
│   │   ├── models/         # Modèles Sequelize
│   │   ├── routes/         # Routes Express
│   │   ├── sockets/        # Gestion Socket.io
│   │   └── app.ts
│   └── package.json
│
├── docker-compose.yml      # Orchestration Docker
├── README.md               # Ce fichier
└── ARCHITECTURE.md         # Architecture détaillée
```

---

## ✨ Fonctionnalités

### Niveau 10/20 : Cuisinier (MVP)
- ✅ Authentification JWT (register + login)
- ✅ Laboratoire drag & drop
- ✅ Découverte de recettes (algorithme de matching)
- ✅ Livre de recettes

### Niveau 13/20 : Chef de Partie
- ✅ WebSocket temps réel
- ✅ Service de commandes avec timer
- ✅ Système de satisfaction (+1 si réussi, -10 si raté)
- ✅ Game Over si satisfaction < 0

### Niveau 16/20 : Restaurateur
- ✅ Système monétaire complet
- ✅ Marketplace (achat d'ingrédients)
- ✅ Dashboard financier avec graphiques
- ✅ Historique des transactions
- ✅ Game Over si trésorerie < 0

### Niveau 18/20 : Chef Étoilé (⭐⭐⭐)
- ✅ Commandes VIP (bonus ×3 si réussi, -1 étoile si raté)
- ✅ Système d'étoiles (Game Over si < 1)
- ✅ Gestion DLC (FIFO) : date de péremption + consommation des stocks les plus anciens
- ✅ Cron job automatique : suppression des produits périmés
- ✅ Docker + docker-compose
- ✅ Interface responsive (mobile/tablette)

---

## 🔌 API Endpoints

| Endpoint                      | Méthode | Auth | Description                     |
| ----------------------------- | ------- | ---- | ------------------------------- |
| `/api/auth/register`          | POST    | ❌   | Inscription + token             |
| `/api/auth/login`             | POST    | ❌   | Connexion + token               |
| `/api/recipes`                | GET     | ❌   | Liste toutes les recettes       |
| `/api/recipes/user`           | GET     | ✅   | Recettes découvertes            |
| `/api/laboratory/experiment`  | POST    | ✅   | Tester une combinaison          |
| `/api/orders`                 | GET     | ✅   | Commandes en attente            |
| `/api/orders/serve/:id`       | POST    | ✅   | Servir une commande             |
| `/api/marketplace/buy`        | POST    | ✅   | Acheter des ingrédients         |
| `/api/marketplace/inventory`  | GET     | ✅   | Stock actuel                    |
| `/api/dashboard/stats`        | GET     | ✅   | Statistiques globales           |
| `/api/dashboard/transactions` | GET     | ✅   | Historique des transactions     |

---

## 🔧 Troubleshooting

### Erreur : "Variables d'environnement manquantes"
→ Vérifier que `server/.env` existe avec toutes les variables (notamment `JWT_SECRET`)

### Erreur : "Port 5000 déjà utilisé"
→ Tuer le processus : `netstat -ano | findstr :5000` puis `taskkill /PID <PID> /F`

### Erreur : Connexion à la base de données
→ Vérifier que MySQL est démarré et que les credentials sont corrects dans `.env`

### WebSocket ne se connecte pas
→ Vérifier que `VITE_API_URL` dans `client/.env` pointe vers le bon serveur

### Les commandes n'apparaissent pas
→ Découvrir au moins 1 recette dans le laboratoire (le système génère uniquement des commandes pour les recettes découvertes)

---

## 🧪 Tester l'Application

### Flux complet
1. **S'inscrire** : Créer un compte (token retourné automatiquement)
2. **Laboratoire** : Drag & drop d'ingrédients pour découvrir une recette
3. **Marketplace** : Acheter des ingrédients (vérifier que la trésorerie diminue)
4. **Service** : Attendre qu'une commande arrive en temps réel, la servir avant expiration
5. **Dashboard** : Consulter les graphiques de trésorerie et l'historique

### Recettes de test (après seed)
Essayer ces combinaisons dans le laboratoire :
- Tomate + Mozzarella + Basilic = Margherita
- Pâtes + Œufs + Bacon + Parmesan = Carbonara
- _(Voir `server/src/seed.ts` pour toutes les recettes)_

---

## 👥 Contributeurs

- **[Votre Nom]** – Développeur Fullstack

---

## 📄 Licence

Projet pédagogique B3 – Usage éducatif uniquement

---

## 🎯 Rendu

**Deadline :** Dimanche 23h55  
**Présentation :** Vendredi devant le groupe

**Livrables :**
- ✅ Lien Git avec README + ARCHITECTURE.md
- ✅ Code fonctionnel (niveau 18/20 atteint)
- ✅ Documentation complète
- ✅ Tag v1.0.0 créé

---

**🍽️ Bon appétit, Chef !**
