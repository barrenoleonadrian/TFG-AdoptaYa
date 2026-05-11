# ============================================
# Dockerfile - Frontend de AdoptaYa
# ============================================
# Construido en dos fases:
#   1) "builder": instala dependencias y compila con Vite (npm run build)
#   2) "nginx": sirve la carpeta dist/ con Nginx
# ============================================

# ---- Fase 1: build con Node ----
FROM node:20-alpine AS builder

WORKDIR /app

# variable que llega del docker-compose.yml para meterla en el build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# instalar dependencias
COPY package*.json ./
RUN npm install

# copiar el resto del código y compilar
COPY . .
RUN npm run build


# ---- Fase 2: servir con Nginx ----
FROM nginx:alpine

# copiar los archivos compilados desde la fase anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# copiar nuestra configuración de Nginx (proxy hacia el backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]