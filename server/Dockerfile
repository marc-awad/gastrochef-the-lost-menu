# Backend Dockerfile pour GastroChef
FROM node:18-alpine

# Installer curl pour le healthcheck
RUN apk add --no-cache curl

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer TOUTES les dépendances (y compris devDependencies pour le build)
RUN npm ci

# Copier le code source
COPY . .

# Compiler TypeScript
RUN npm run build

# Supprimer les devDependencies après le build pour alléger l'image
RUN npm prune --production

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut (surchargées par docker-compose)
ENV NODE_ENV=production

# Commande de démarrage
CMD ["node", "dist/app.js"]