# 🍽️ GastroChef – The Lost Menu

**Projet B3 Fullstack** : Gérez une Ghost Kitchen sous pression et redécouvrez les recettes perdues du légendaire restaurant **"La Tour d'Émeraude"**.

---

## 📖 Contexte

Vous reprenez un restaurant mythique, mais le chef précédent est parti avec le livre de recettes ! Les placards sont vides, vous avez une heure avant l'ouverture, et les clients ne vont pas tarder à affluer. À vous de tout reconstruire : acheter vos stocks, redécouvrir les recettes en expérimentant, et servir vos clients en temps réel pour éviter la faillite.

---

## 🛠️ Stack Technique

| Technologie                  | Usage                                        |
| ---------------------------- | -------------------------------------------- |
| **React**                    | Interface utilisateur                        |
| **Node.js + Express**        | API Backend                                  |
| **PostgreSQL**               | Base de données relationnelle                |
| **Socket.io**                | Communication temps réel (commandes clients) |
| **JWT**                      | Authentification sécurisée                   |
| **Chart.js** _(optionnel)_   | Visualisation financière                     |
| **Docker** _(niveau avancé)_ | Conteneurisation                             |

---

## 📦 Installation

### Prérequis

- Node.js (v16+)
- PostgreSQL (ou MySQL/MongoDB selon votre config)
- npm ou yarn

### Backend

```bash
cd server
npm install
cp .env.example .env  # Configurer les variables d'environnement
npm run migrate       # Créer les tables
npm run seed          # (Optionnel) Alimenter la BDD avec des recettes
npm run dev
```

**Serveur disponible sur** : `http://localhost:5000`

### Frontend

```bash
cd client
npm install
npm run dev
```

**Application disponible sur** : `http://localhost:5173`

---

## 🎮 Fonctionnalités

### ✅ Niveau 10/20 : "Cuisinier" (MVP)

- **Authentification JWT** : Inscription, connexion, protection des routes
- **Le Laboratoire** : Interface drag & drop pour combiner des ingrédients
- **Découverte de recettes** : Algorithme de matching, sauvegarde en BDD
- **Livre de recettes** : Consultation des recettes débloquées
- ⚠️ _Pas de gestion d'argent ni de stocks limités à ce niveau_

### 🔥 Niveau 13/20 : "Chef de Partie" (Le stress du direct !)

- **WebSockets** : Commandes clients envoyées en temps réel
- **Système de service** : Bouton "Servir" actif seulement si recette connue + stock disponible
- **Timer** : Les commandes expirent si non servies à temps
- **Satisfaction client** :
  - Commande honorée : **+1 point**
  - Commande ratée : **-10 points**
  - Game Over si **< 0 points** (départ à 20)

### 💰 Niveau 16/20 : "Restaurateur" (Capitalisme !)

- **Système monétaire complet** :
  - Table `Transactions` pour tracer tous les mouvements
  - Achats d'ingrédients = dépenses
  - Service réussi = revenus
  - Game Over si trésorerie **< 0**
- **Dashboard financier** :
  - Graphiques d'évolution de la trésorerie (Chart.js)
  - Répartition des dépenses/revenus
  - Calcul de la marge par plat

### ⭐ Niveau 18/20 : "Chef Étoilé" (\*\*\*)

- **Critique gastronomique** : Commandes VIP aléatoires avec gros bonus/malus + système d'étoiles (3*\*\* → Game Over à 1*)
- **Gestion DLC (FIFO)** : Utilisation prioritaire des stocks les plus anciens + cron de suppression des produits périmés
- **Docker** : Déploiement via `docker-compose up`
- **Interface responsive** : Adaptation mobile/tablette

---

## 📂 Structure du Projet

```
GastroChef/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages (Login, Lab, Service, Dashboard)
│   │   ├── services/       # Appels API & WebSocket
│   │   └── utils/          # Helpers
│   └── package.json
│
├── server/                 # Backend Node.js
│   ├── config/             # Configuration DB, JWT
│   ├── controllers/        # Logique métier
│   ├── models/             # Schémas de données
│   ├── routes/             # Routes API
│   ├── middleware/         # Auth, validation
│   ├── sockets/            # Gestion Socket.io
│   ├── migrations/         # Scripts SQL
│   └── package.json
│
├── docker-compose.yml      # Orchestration (niveau 18/20)
└── README.md               # Ce fichier
```

---

## 🎯 Rendu & Évaluation

### Livrables attendus

1. **Lien Git** (GitHub/GitLab) avec :
   - Procédure d'installation claire
   - Document d'architecture (README ou PDF) : diagrammes, modèle de données, explications techniques
2. **Présentation** : Vendredi devant le groupe observateur
3. **Deadline** : Dimanche 23h55

⚠️ **-1 point si absence de documentation d'architecture**

---

## 🧪 Données de Test

Un script de seed est fourni pour alimenter la base de données avec des recettes prédéfinies :

```bash
npm run seed
```

---

## 🚀 Améliorations Possibles

- Système de succès/achievements
- Mode multijoueur coopératif
- Événements saisonniers avec recettes spéciales
- IA pour optimiser les achats d'ingrédients
- Notifications push pour les commandes urgentes

---

## 👥 Contributeurs

- **Votre nom** – Développeur Fullstack
- _(Ajoutez vos collaborateurs)_

---

## 📄 Licence

Ce projet est réalisé dans le cadre d'un exercice pédagogique B3.

---
