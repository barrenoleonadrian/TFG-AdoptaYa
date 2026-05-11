# ============================================
# Dockerfile - Backend de AdoptaYa
# ============================================

FROM node:20-alpine

WORKDIR /app

# copiar package.json e instalar dependencias primero
# (esto aprovecha la cache de Docker: si no cambia el package.json, no reinstala)
COPY package*.json ./
RUN npm install --production

# copiar el resto del código
COPY . .

# crear la carpeta img si no existe (para Multer)
RUN mkdir -p img

# exponer el puerto que usa Express
EXPOSE 3000

# comando para arrancar
CMD ["node", "server.js"]