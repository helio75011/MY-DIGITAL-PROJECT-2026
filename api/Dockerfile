# Image de l'API Link & Walk (Node.js + Express).
FROM node:20-alpine

WORKDIR /app

# Dépendances d'abord (cache de build optimisé).
COPY package*.json ./
RUN npm ci --omit=dev

# Code source.
COPY src ./src

# Dossier des uploads KYC (monté en volume en prod/dev pour la persistance).
RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "src/server.js"]
