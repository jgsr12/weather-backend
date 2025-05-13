# 1. Build stage
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

# Copiamos package.json y lock para cachear dependencias
COPY package*.json ./
# Si usas yarn: COPY yarn.lock ./

RUN npm ci        # o yarn install --frozen-lockfile

# Copia el resto y construye
COPY . .
RUN npm run build

# 2. Production image
FROM node:22-alpine
WORKDIR /usr/src/app

# Sólo necesita prod dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copia artefactos compilados
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Si usas .env en tiempo de build, cópialo; si lo montas con docker-compose, no
# COPY .env .env

EXPOSE 4000
ENV NODE_ENV=production

# Arranca la app compilada
CMD ["node", "dist/src/main.js"]
