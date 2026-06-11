# AdoptaYa 🐾

Plataforma web para la adopción responsable de animales. Centraliza la oferta de refugios verificados y permite gestionar todo el proceso de adopción desde un único punto.

**Trabajo Fin de Grado - Desarrollo de Aplicaciones Web (DAW2)**
Adrián Barreno León - Curso 2025/2026

---

## 📋 Tabla de contenidos

- [Descripción](#descripción)
- [Funcionalidades](#funcionalidades)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Variables de entorno](#variables-de-entorno)
- [Uso](#uso)
- [Seguridad](#seguridad)
- [Licencia](#licencia)

---

## 📖 Descripción

AdoptaYa resuelve tres problemas reales del proceso de adopción animal:

- **Información dispersa** entre redes sociales, blogs y foros.
- **Procesos opacos** sin trazabilidad para el adoptante.
- **Falta de verificación** que abre la puerta a estafas y maltrato.

La plataforma reúne en un único lugar mascotas y refugios verificados, con un proceso de adopción realista basado en una máquina de estados y validación manual de los refugios por parte de un administrador.

---

## ⚡ Funcionalidades

- **Catálogo público** de mascotas con filtros por tipo, ciudad y nombre.
- **Sistema de adopción realista** con formulario detallado y máquina de estados (`pendiente → en_revision → aprobada / rechazada`).
- **Verificación manual de refugios** por parte del administrador.
- **Autenticación con JWT** y tres roles (adoptante, refugio, administrador).
- **Chat interno** entre adoptantes y refugios mediante polling.
- **Panel de administración** para gestionar usuarios, mascotas y solicitudes.
- **Gestión del perfil del refugio** con subida de imágenes.
- **Subida de imágenes** con Multer y servidas a través de Nginx.

---

## 🛠 Tecnologías

### Frontend
- **React 18** con Hooks
- **Vite** como bundler
- **CSS plano**, sin frameworks
- Router casero basado en `window.location.hash`

### Backend
- **Node.js 20** + **Express**
- **MySQL 8** con `mysql2` y pool de conexiones
- **JWT** (jsonwebtoken) para autenticación
- **bcryptjs** para hasheo de contraseñas
- **Multer** para subida de imágenes
- **Helmet** para cabeceras de seguridad HTTP
- **express-rate-limit** anti fuerza bruta
- **express-validator** para validación de datos

### Despliegue
- **Docker** + **Docker Compose**
- **Nginx** como proxy inverso
- Construcción multi-stage del frontend

---

## 🏗 Arquitectura

Arquitectura cliente-servidor REST con tres capas independientes:
┌──────────────┐  JSON  ┌──────────────┐  SQL  ┌──────────────┐
│   FRONTEND   │ ─────> │   BACKEND    │ ────> │    MYSQL     │
│  React + Vite│        │ Node+Express │       │     8.0      │
└──────────────┘ <───── └──────────────┘ <──── └──────────────┘

El despliegue consta de tres contenedores Docker orquestados con Docker Compose. Únicamente el contenedor de Nginx (frontend) está expuesto al exterior; backend y base de datos quedan aislados en la red interna.

---

## ✅ Requisitos previos

- [Docker](https://www.docker.com/get-started/) y Docker Compose
- Git
- Puerto **80** libre en la máquina anfitriona

---

## 🚀 Instalación

Clona el repositorio:

```bash
git clone https://github.com/barrenoleonadrian/TFG-AdoptaYa.git
cd TFG-AdoptaYa
```

Crea el archivo `.env` dentro de `backend/` con las variables necesarias (ver sección [Variables de entorno](#variables-de-entorno)).

Levanta los contenedores:

```bash
docker compose up --build
```

La aplicación estará disponible en: **http://localhost**

---

## 📁 Estructura del proyecto
TFG-AdoptaYa/
├── backend/                    # API Node.js + Express
│   ├── controllers/            # Lógica de negocio por dominio
│   ├── middleware/             # Auth, validaciones, rate limiting
│   ├── routes/                 # Definición de rutas REST
│   ├── base de datos/          # Script SQL de inicialización
│   ├── db.js                   # Pool de conexiones MySQL
│   ├── server.js               # Punto de entrada
│   └── Dockerfile
├── front-end/                  # SPA React + Vite
│   ├── src/
│   ├── nginx.conf              # Configuración del proxy inverso
│   └── Dockerfile              # Multi-stage build
├── docker-compose.yml          # Orquestación de los 3 contenedores
└── README.md

---

## 🔐 Variables de entorno

Crea un archivo `backend/.env` con el siguiente contenido:

```env
JWT_SECRET=tu_clave_secreta_aqui
DB_HOST=mysql
DB_USER=adrian
DB_PASSWORD=mysql
DB_NAME=adoptaya
PORT=3000
FRONTEND_URL=http://localhost
```

⚠️ **Nunca subas este archivo al repositorio.** Está incluido en `.gitignore`.

---

## 💻 Uso

Una vez levantados los contenedores, accede a **http://localhost**.

### Cuenta de administrador por defecto

- **Email:** `admin@adoptaya.com`
- **Contraseña:** `1234`

> Cambia esta contraseña en cuanto puedas en un entorno real.

### Flujos principales

- **Adoptante:** registrarse → explorar catálogo → solicitar adopción.
- **Refugio:** registrarse con CIF → esperar verificación del admin → publicar mascotas y gestionar solicitudes.
- **Administrador:** verificar refugios pendientes, moderar usuarios y mascotas.

---

## 🛡 Seguridad

El proyecto implementa varias capas de seguridad:

- Contraseñas hasheadas con **bcrypt** (irreversible).
- Sesiones sin estado con **JWT** (caducidad de 7 días).
- **Rate limiting** para mitigar ataques de fuerza bruta en el login.
- **Helmet** para cabeceras HTTP de seguridad (XSS, clickjacking, etc.).
- **CORS** restringido al origen del frontend.
- **Validación de entradas** con `express-validator`.
- Consultas SQL **parametrizadas** (anti inyección SQL).
- Variables sensibles fuera del código en archivo `.env`.

---

## 📄 Licencia

Proyecto académico desarrollado como Trabajo Fin de Grado en el ciclo de Desarrollo de Aplicaciones Web (DAW). Uso educativo.

---

## 👤 Autor

**Adrián Barreno León**
TFG DAW2 - Curso 2025/2026

[![GitHub](https://img.shields.io/badge/GitHub-barrenoleonadrian-181717?logo=github)](https://github.com/barrenoleonadrian)

