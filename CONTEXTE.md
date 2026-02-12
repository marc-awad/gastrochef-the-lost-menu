# 🍽️ CONTEXT.MD - GastroChef : The Lost Menu

**Document de Référence Technique** - Version 1.0  
_Dernière mise à jour : 12 février 2026_

---

## 📚 Table des Matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack Technique](#2-stack-technique)
3. [Architecture des Dossiers](#3-architecture-des-dossiers)
4. [Modèles de Données (Sequelize)](#4-modèles-de-données-sequelize)
5. [Relations et Associations](#5-relations-et-associations)
6. [Règles Métier](#6-règles-métier)
7. [Système d'Authentification](#7-système-dauthentification)
8. [Système de Satisfaction & Game Over](#8-système-de-satisfaction--game-over)
9. [Niveaux de Progression](#9-niveaux-de-progression)
10. [WebSockets & Temps Réel](#10-websockets--temps-réel)
11. [Endpoints API Existants](#11-endpoints-api-existants)
12. [Conventions de Code](#12-conventions-de-code)

---

## 1. Vue d'ensemble

**GastroChef - The Lost Menu** est un jeu de gestion de restaurant en temps réel où le joueur reprend un restaurant mythique dont le chef précédent est parti avec le livre de recettes.

### Objectifs du jeu

- 🧪 Redécouvrir les recettes perdues en expérimentant dans le laboratoire
- 🍽️ Servir les clients en temps réel avant expiration des commandes
- 💰 Gérer sa trésorerie et éviter la faillite
- ⭐ Maintenir sa satisfaction client et ses étoiles

### Mécaniques principales

1. **Le Laboratoire** : Drag & drop d'ingrédients pour découvrir des recettes
2. **Service en temps réel** : Commandes WebSocket avec timer d'expiration
3. **Système de progression** : Satisfaction, trésorerie, étoiles
4. **Game Over** : Si satisfaction < 0 OU trésorerie < 0

---

## 2. Stack Technique

### Backend

- **Runtime** : Node.js v16+
- **Framework** : Express.js
- **Langage** : TypeScript
- **Base de données** : MySQL (via Sequelize ORM)
- **Authentification** : JWT (jsonwebtoken)
- **WebSockets** : Socket.io
- **Variables d'environnement** : dotenv

### Frontend

- **Framework** : React 18
- **Langage** : TypeScript
- **Build Tool** : Vite
- **Styling** : Tailwind CSS
- **HTTP Client** : Axios
- **WebSocket Client** : Socket.io-client
- **Routing** : React Router

### DevOps (Niveau 18/20)

- **Conteneurisation** : Docker + docker-compose
- **CI/CD** : (À définir)

---

## 3. Architecture des Dossiers

```
gastro-chef/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── assets/                  # Images, SVG
│   │   ├── components/              # Composants réutilisables
│   │   │   ├── DropZone.tsx
│   │   │   ├── IngredientCard.tsx
│   │   │   ├── OrderQueue.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/                 # Contextes React
│   │   │   ├── AuthContext.tsx      # Gestion auth + token
│   │   │   └── GameContext.tsx      # Stats (satisfaction, treasury, stars)
│   │   ├── hooks/                   # Custom hooks
│   │   │   ├── useIngredients.ts
│   │   │   └── useOrders.ts
│   │   ├── libs/                    # Utilitaires + shadcn/ui
│   │   │   ├── utils.ts
│   │   │   └── components/ui/       # Composants UI (button, card)
│   │   ├── pages/                   # Pages principales
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Laboratory.tsx       # Expérimentation recettes
│   │   │   └── RecipeBook.tsx       # Livre de recettes découvertes
│   │   ├── services/                # API + WebSocket
│   │   │   ├── api.ts               # Instance axios configurée
│   │   │   ├── socket.ts            # Socket.io client
│   │   │   └── laboratory.ts        # Logique laboratoire
│   │   ├── types/                   # Types TypeScript
│   │   │   └── order.ts
│   │   ├── App.tsx                  # Point d'entrée + Router
│   │   └── main.tsx                 # Render React
│   ├── package.json
│   └── vite.config.ts
│
├── server/                          # Backend Node.js
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                # Config Sequelize
│   │   ├── controllers/             # Logique métier
│   │   │   ├── healthController.ts
│   │   │   └── orderController.ts
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts    # Vérification JWT
│   │   ├── models/                  # Modèles Sequelize
│   │   │   ├── index.ts             # Associations
│   │   │   ├── User.ts
│   │   │   ├── Order.ts
│   │   │   ├── Recipe.ts
│   │   │   ├── Ingredient.ts
│   │   │   ├── RecipeIngredient.ts
│   │   │   └── UserDiscoveredRecipe.ts
│   │   ├── modules/                 # Modules métier
│   │   │   ├── index.ts
│   │   │   └── orderGenerator.ts    # Génération commandes aléatoires
│   │   ├── routes/                  # Routes Express
│   │   │   ├── auth.ts
│   │   │   ├── healthRoutes.ts
│   │   │   ├── ingredients.ts
│   │   │   ├── laboratory.ts
│   │   │   ├── order.ts
│   │   │   └── recipes.ts
│   │   ├── sockets/
│   │   │   └── index.ts             # Gestion Socket.io
│   │   ├── app.ts                   # Config Express + Routes
│   │   └── seed.ts                  # Script de seed BDD
│   ├── .env                         # Variables d'environnement
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                            # Documentation
├── .gitignore
├── .prettierrc
├── README.md
└── CONTEXT.md                       # CE FICHIER
```

---

## 4. Modèles de Données (Sequelize)

### 4.1 User

**Table** : `users`  
**Fichier** : `server/src/models/User.ts`

```typescript
{
  id: number (PK, auto-increment)
  restaurant_name: string (NOT NULL)
  email: string (UNIQUE, NOT NULL)
  password_hash: string (NOT NULL)
  treasury: number (DEFAULT 1000)         // Argent disponible
  satisfaction: number (DEFAULT 20)       // Points de satisfaction
  stars: number (DEFAULT 3)               // Étoiles (1-3)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Valeurs par défaut** :

- `treasury`: 1000 (argent initial)
- `satisfaction`: 20 (points de départ)
- `stars`: 3 (niveau max au départ)

---

### 4.2 Order

**Table** : `orders`  
**Fichier** : `server/src/models/Order.ts`

```typescript
{
  id: number (PK, auto-increment)
  user_id: number (FK → users.id, NOT NULL)
  recipe_id: number (FK → recipes.id, NOT NULL)
  status: 'pending' | 'served' | 'expired' (DEFAULT 'pending')
  price: decimal(10,2) (NOT NULL)
  expires_at: Date (NOT NULL)             // Timer d'expiration
  is_vip: boolean (DEFAULT false)         // Commande VIP (bonus/malus)
  created_at: Date (auto)
}
```

**Règles** :

- Une commande **expire** si `expires_at < Date.now()`
- Une commande VIP (`is_vip = true`) rapporte plus mais pénalise davantage si ratée
- `timestamps: false` (on utilise `created_at` manuel)

---

### 4.3 Recipe

**Table** : `recipes`  
**Fichier** : `server/src/models/Recipe.ts`

```typescript
{
  id: number (PK, auto-increment)
  name: string (NOT NULL)
  description: string (DEFAULT "Une délicieuse recette à découvrir !")
  sale_price: decimal(10,2) (DEFAULT 0.0)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Note** : `sale_price` = prix de vente de la recette (revenu si servie)

---

### 4.4 Ingredient

**Table** : `ingredients`  
**Fichier** : `server/src/models/Ingredient.ts`

```typescript
{
  id: number (PK, auto-increment)
  name: string (NOT NULL)
  price: decimal(10,2) (NOT NULL)        // Coût d'achat
}
```

---

### 4.5 RecipeIngredient (Table de liaison)

**Table** : `recipe_ingredients`  
**Fichier** : `server/src/models/RecipeIngredient.ts`

```typescript
{
  recipe_id: number (PK, FK → recipes.id)
  ingredient_id: number (PK, FK → ingredients.id)
  quantity: number (NOT NULL)             // Quantité nécessaire
}
```

**Clé primaire composite** : `(recipe_id, ingredient_id)`

---

### 4.6 UserDiscoveredRecipe (Table de liaison)

**Table** : `user_discovered_recipes`  
**Fichier** : `server/src/models/UserDiscoveredRecipe.ts`

```typescript
{
  user_id: number (PK, FK → users.id)
  recipe_id: number (PK, FK → recipes.id)
  discovered_at: Date (DEFAULT NOW)       // Date de découverte
}
```

**Clé primaire composite** : `(user_id, recipe_id)`  
**Règle** : Une recette ne peut être découverte qu'**une seule fois** par utilisateur

---

## 5. Relations et Associations

**Fichier** : `server/src/models/index.ts`

### 5.1 Recipe ↔ Ingredient (Many-to-Many)

```typescript
Recipe.belongsToMany(Ingredient, {
  through: RecipeIngredient,
  foreignKey: 'recipe_id',
  otherKey: 'ingredient_id',
  as: 'Ingredients',
});

Ingredient.belongsToMany(Recipe, {
  through: RecipeIngredient,
  foreignKey: 'ingredient_id',
  otherKey: 'recipe_id',
  as: 'Recipes',
});
```

**Usage** :

```typescript
// Récupérer une recette avec ses ingrédients
const recipe = await Recipe.findByPk(1, {
  include: [{ model: Ingredient, as: 'Ingredients' }],
});
```

---

### 5.2 User ↔ Recipe (Many-to-Many via UserDiscoveredRecipe)

```typescript
User.belongsToMany(Recipe, {
  through: UserDiscoveredRecipe,
  foreignKey: 'user_id',
  otherKey: 'recipe_id',
  as: 'discoveredRecipes',
});

Recipe.belongsToMany(User, {
  through: UserDiscoveredRecipe,
  foreignKey: 'recipe_id',
  otherKey: 'user_id',
  as: 'discoverers',
});
```

**Usage** :

```typescript
// Récupérer toutes les recettes découvertes par un utilisateur
const user = await User.findByPk(userId, {
  include: [{ model: Recipe, as: 'discoveredRecipes' }],
});
```

---

### 5.3 Order ↔ User (One-to-Many)

```typescript
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
```

---

### 5.4 Order ↔ Recipe (One-to-Many)

```typescript
Order.belongsTo(Recipe, { foreignKey: 'recipe_id', as: 'recipe' });
Recipe.hasMany(Order, { foreignKey: 'recipe_id', as: 'orders' });
```

**Usage** :

```typescript
// Récupérer une commande avec la recette associée
const order = await Order.findByPk(orderId, {
  include: [{ model: Recipe, as: 'recipe' }],
});
```

---

## 6. Règles Métier

### 6.1 Découverte de Recettes

**Lieu** : Laboratoire (`/laboratory`)

**Processus** :

1. L'utilisateur drag & drop des ingrédients sur une zone de dépôt
2. Frontend envoie la liste des `ingredient_id` au backend
3. Backend vérifie si une recette existe avec **EXACTEMENT** ces ingrédients
4. Si match → Insertion dans `UserDiscoveredRecipe` (si pas déjà découverte)
5. Retour de la recette découverte au frontend

**Endpoint** : `POST /api/laboratory/experiment`

**Contrainte** : Une recette ne peut être découverte qu'une seule fois par joueur (clé composite)

---

### 6.2 Génération des Commandes

**Lieu** : WebSocket (Socket.io)

**Processus** :

1. Le serveur génère périodiquement des commandes aléatoires
2. Seules les recettes **découvertes** par le joueur peuvent être commandées
3. Chaque commande a un `expires_at` (timer)
4. Le serveur émet un événement `new_order` via WebSocket
5. Le frontend affiche la commande dans `OrderQueue`

**Règle** : Si `expires_at < Date.now()` → Commande expirée automatiquement

---

### 6.3 Service d'une Commande

**Endpoint** : `POST /api/orders/serve/:orderId`

**Conditions de succès** :

1. ✅ Commande existe
2. ✅ Commande appartient à l'utilisateur (`order.user_id === req.userId`)
3. ✅ Commande n'est pas déjà servie (`status !== 'served'`)
4. ✅ Commande n'est pas expirée (`expires_at > Date.now()`)
5. ✅ Recette est découverte (`UserDiscoveredRecipe` existe)

**Actions si succès** (transaction atomique) :

```typescript
// 1. Mise à jour de la commande
Order.update({ status: 'served' });

// 2. Mise à jour de la satisfaction
User.update({ satisfaction: satisfaction + 1 });

// 3. Mise à jour de la trésorerie (Niveau 16/20)
User.update({ treasury: treasury + order.price });
```

**Actions si échec** :

- Commande expirée → `satisfaction -= 10` + `status = 'expired'`
- Recette non découverte → Erreur 400

---

### 6.4 Expiration des Commandes

**Processus** :

1. Serveur vérifie périodiquement les commandes `pending` avec `expires_at < Date.now()`
2. Mise à jour atomique :
   - `Order.status = 'expired'`
   - `User.satisfaction -= 10`
3. Émission d'un événement WebSocket `order_expired`
4. Frontend retire la commande de l'UI

---

## 7. Système d'Authentification

### 7.1 Backend (JWT)

**Fichier** : `server/src/middleware/authMiddleware.ts`

**Processus** :

1. Client envoie une requête avec header `Authorization: Bearer <token>`
2. Middleware extrait et vérifie le token avec `jwt.verify()`
3. Si valide → Décodage du payload `{ id: userId }`
4. Ajout de `req.userId` à la requête
5. Passage au controller suivant

**Interface** :

```typescript
export interface AuthRequest extends Request {
  userId?: number; // Injecté par le middleware
}
```

**Usage dans les controllers** :

```typescript
export const someController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId; // Toujours disponible après authMiddleware
  // ...
};
```

---

### 7.2 Frontend (React Context)

**Fichier** : `client/src/context/AuthContext.tsx`

**État global** :

```typescript
{
  token: string | null
  login: (email, password) => Promise<void>
  register: (restaurant_name, email, password) => Promise<void>
  logout: () => void
}
```

**Stockage** : `localStorage.setItem('token', jwt)`

**Axios Interceptor** (`client/src/services/api.ts`) :

```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Gestion déconnexion automatique** :

```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 8. Système de Satisfaction & Game Over

### 8.1 Satisfaction

**Champ** : `User.satisfaction` (INTEGER, DEFAULT 20)

**Règles** :

- **Valeur initiale** : 20 points
- **Service réussi** : `satisfaction += 1`
- **Commande expirée** : `satisfaction -= 10`
- **Commande VIP réussie** : `satisfaction += 5` (bonus)
- **Commande VIP ratée** : `satisfaction -= 20` (malus double)

**Game Over** : Si `satisfaction < 0`

---

### 8.2 Trésorerie (Niveau 16/20)

**Champ** : `User.treasury` (INTEGER, DEFAULT 1000)

**Règles** :

- **Valeur initiale** : 1000€
- **Service réussi** : `treasury += order.price`
- **Achat ingrédient** : `treasury -= ingredient.price * quantity`

**Game Over** : Si `treasury < 0`

---

### 8.3 Étoiles (Niveau 18/20)

**Champ** : `User.stars` (INTEGER, DEFAULT 3)

**Règles** :

- **Valeur initiale** : 3 étoiles
- **Perte d'étoile** : Après X commandes VIP ratées
- **Game Over** : Si `stars < 1`

---

### 8.4 Détection Game Over

**Lieu** : Controller de service (`orderController.ts`)

**Logique** :

```typescript
if (user.satisfaction < 0 || user.treasury < 0 || user.stars < 1) {
  return res.status(400).json({
    success: false,
    message: 'GAME OVER',
    gameOver: true,
    reason: 'satisfaction' | 'treasury' | 'stars',
  });
}
```

**Frontend** : Redirection vers page Game Over ou modal

---

## 9. Niveaux de Progression

| Niveau | Titre                | Fonctionnalités                                                                |
| ------ | -------------------- | ------------------------------------------------------------------------------ |
| 10/20  | **Cuisinier (MVP)**  | Auth JWT + Laboratoire + Découverte recettes + Livre de recettes               |
| 13/20  | **Chef de Partie**   | WebSockets + Service temps réel + Timer + Système satisfaction                 |
| 16/20  | **Restaurateur**     | Système monétaire complet + Transactions + Dashboard financier (Chart.js)      |
| 18/20  | **Chef Étoilé (⭐)** | Critiques VIP + Système d'étoiles + Gestion DLC (FIFO) + Docker + Mobile ready |

**Niveau actuel du code** : **13/20** (Service temps réel implémenté, satisfaction OK)

---

## 10. WebSockets & Temps Réel

### 10.1 Backend (Socket.io)

**Fichier** : `server/src/sockets/index.ts`

**Configuration** :

```typescript
import { Server } from 'socket.io';
import http from 'http';

export const initSockets = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('✅ Client connecté:', socket.id);

    // Événements personnalisés
    socket.on('join_game', (userId) => {
      socket.join(`user_${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('❌ Client déconnecté:', socket.id);
    });
  });

  return io;
};
```

**Utilisation dans app.ts** :

```typescript
import http from 'http';
import { initSockets } from './sockets';

const server = http.createServer(app);
export const io = initSockets(server);

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} (HTTP + WebSocket)`);
});
```

---

### 10.2 Événements Émis par le Serveur

| Événement       | Payload                                      | Description                       |
| --------------- | -------------------------------------------- | --------------------------------- |
| `new_order`     | `{ id, recipe_id, recipe_name, expires_at }` | Nouvelle commande générée         |
| `order_expired` | `{ orderId, satisfaction }`                  | Commande expirée (pénalité -10)   |
| `stats_update`  | `{ satisfaction, treasury, stars }`          | Mise à jour des stats utilisateur |
| `game_over`     | `{ reason: 'satisfaction' \| 'treasury' }`   | Fin de partie                     |
| `vip_order`     | `{ ... }`                                    | Commande VIP (niveau 18/20)       |

---

### 10.3 Frontend (Socket.io Client)

**Fichier** : `client/src/services/socket.ts`

**Initialisation** :

```typescript
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (token: string) => {
  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
    auth: { token },
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connecté');
  });

  return socket;
};

export const getSocket = () => socket;
```

**Écoute d'événements** (`GameContext.tsx`) :

```typescript
useEffect(() => {
  const socket = getSocket();

  if (socket) {
    socket.on('stats_update', (data) => {
      setStats((prev) => ({ ...prev, ...data }));
    });

    socket.on('order_expired', () => {
      setStats((prev) => ({
        ...prev,
        satisfaction: Math.max(0, prev.satisfaction - 10),
        failedOrders: prev.failedOrders + 1,
      }));
    });
  }

  return () => {
    socket?.off('stats_update');
    socket?.off('order_expired');
  };
}, []);
```

---

## 11. Endpoints API Existants

### 11.1 Authentification

| Méthode | Endpoint             | Protection | Description              |
| ------- | -------------------- | ---------- | ------------------------ |
| POST    | `/api/auth/register` | ❌ Public  | Inscription utilisateur  |
| POST    | `/api/auth/login`    | ❌ Public  | Connexion (retourne JWT) |

---

### 11.2 Recettes

| Méthode | Endpoint                    | Protection | Description                                   |
| ------- | --------------------------- | ---------- | --------------------------------------------- |
| GET     | `/api/recipes`              | ✅ JWT     | Liste toutes les recettes                     |
| GET     | `/api/recipes/discovered`   | ✅ JWT     | Recettes découvertes par le joueur            |
| POST    | `/api/recipes/:id/discover` | ✅ JWT     | Marquer une recette comme découverte (manuel) |

---

### 11.3 Ingrédients

| Méthode | Endpoint           | Protection | Description                |
| ------- | ------------------ | ---------- | -------------------------- |
| GET     | `/api/ingredients` | ✅ JWT     | Liste tous les ingrédients |

---

### 11.4 Laboratoire

| Méthode | Endpoint                     | Protection | Description                          |
| ------- | ---------------------------- | ---------- | ------------------------------------ |
| POST    | `/api/laboratory/experiment` | ✅ JWT     | Tester une combinaison d'ingrédients |

**Body** :

```json
{
  "ingredientIds": [1, 3, 5]
}
```

**Réponse si match** :

```json
{
  "success": true,
  "recipe": {
    "id": 2,
    "name": "Carbonara",
    "description": "...",
    "sale_price": 15.0
  },
  "message": "Recette découverte !"
}
```

---

### 11.5 Commandes

| Méthode | Endpoint                     | Protection | Description                          |
| ------- | ---------------------------- | ---------- | ------------------------------------ |
| GET     | `/api/orders`                | ✅ JWT     | Liste des commandes de l'utilisateur |
| POST    | `/api/orders/serve/:orderId` | ✅ JWT     | **À IMPLÉMENTER (TICKET #013)**      |

---

### 11.6 Health Check

| Méthode | Endpoint      | Protection | Description        |
| ------- | ------------- | ---------- | ------------------ |
| GET     | `/api/health` | ❌ Public  | Vérifier si API up |

---

## 12. Conventions de Code

### 12.1 Nommage

**Base de données** (snake_case) :

- Tables : `users`, `orders`, `recipe_ingredients`
- Colonnes : `user_id`, `created_at`, `password_hash`

**TypeScript** (camelCase) :

- Variables : `userId`, `createdAt`, `passwordHash`
- Fonctions : `serveOrder()`, `checkExpiredOrders()`
- Interfaces : `AuthRequest`, `ServeOrderResponse`

**Modèles Sequelize** (PascalCase) :

- Classes : `User`, `Order`, `Recipe`
- Associations : `as: 'discoveredRecipes'`

---

### 12.2 Structure des Réponses API

**Succès** :

```json
{
  "success": true,
  "message": "Opération réussie",
  "data": { ... }
}
```

**Erreur** :

```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

---

### 12.3 Transactions Sequelize

**Toujours utiliser des transactions pour les opérations critiques** :

```typescript
const transaction = await sequelize.transaction();

try {
  // Opérations multiples
  await Order.update({ status: 'served' }, { transaction });
  await User.update({ satisfaction: newSatisfaction }, { transaction });

  await transaction.commit();
  res.status(200).json({ success: true });
} catch (error) {
  await transaction.rollback();
  res.status(500).json({ success: false, message: 'Erreur serveur' });
}
```

---

### 12.4 Imports Sequelize

**Configuration** :

```typescript
import sequelize from '../config/db';
import { Op } from 'sequelize';
```

**Modèles** :

```typescript
import { User, Order, Recipe, UserDiscoveredRecipe } from '../models';
```

---

## 📌 Notes Importantes

### Variables d'Environnement (.env)

**Backend** :

```env
DB_NAME=gastrochef
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=your_super_secret_key
PORT=5000
CLIENT_URL=http://localhost:5173
```

**Frontend** :

```env
VITE_API_URL=http://localhost:5000/api
```

---

### Commandes Utiles

**Backend** :

```bash
cd server
npm install
npm run dev          # Démarrage en mode développement
npm run build        # Compilation TypeScript
npm run seed         # Alimenter la BDD avec des données de test
```

**Frontend** :

```bash
cd client
npm install
npm run dev          # Démarrage Vite (http://localhost:5173)
npm run build        # Build de production
```

---

## ✅ Checklist Avant Nouveau Ticket

Avant de démarrer un nouveau ticket, vérifiez :

1. ✅ Le fichier CONTEXT.md est à jour
2. ✅ Les migrations DB sont lancées
3. ✅ Les modèles Sequelize sont synchronisés
4. ✅ Le serveur backend tourne (`npm run dev`)
5. ✅ Le frontend tourne (`npm run dev`)
6. ✅ WebSocket connecté (vérifier console navigateur)

---

## 🚀 Utilisation de ce Document

**Pour chaque nouveau ticket** :

1. Copiez-collez ce fichier CONTEXT.md dans votre prompt
2. Ajoutez le détail du ticket à implémenter
3. Listez les fichiers spécifiques concernés (2-5 fichiers max)
4. L'IA aura tout le contexte nécessaire sans redemander 15 fichiers

**Exemple de prompt optimal** :

```
Voici le contexte global du projet (CONTEXT.md) :
[Copier-coller tout le fichier]

Je veux implémenter le TICKET #013 - Logique de service des commandes.

Fichiers spécifiques concernés :
- server/src/controllers/orderController.ts
- server/src/routes/order.ts
- client/src/components/OrderQueue.tsx

Génère le code complet pour ce ticket.
```

---

**Fin du document CONTEXT.md** 🍽️
