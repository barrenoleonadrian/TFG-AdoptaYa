# AdoptaYa

Plataforma web de adopción de animales. Proyecto de TFG de DAW2.

## Requisitos previos

Antes de arrancar el proyecto necesitas tener instalado:

- **Node.js** (versión 18 o superior) → https://nodejs.org
- **MySQL** o **MariaDB** con phpMyAdmin (por ejemplo, AMPPS)

## Instalación (solo la primera vez)

### 1. Instalar las dependencias

Desde la carpeta raíz del proyecto, en una terminal:

​```bash
cd backend
npm install

cd ../front-end
npm install
​```

### 2. Configurar la base de datos

- Abre phpMyAdmin desde AMPPS.
- Crea una base de datos llamada `adoptaya`.
- Importa el archivo `backend/base de datos/adoptaya.sql`.
- Ejecuta también los parches que estén en la misma carpeta (por orden).

## Arrancar el entorno de pruebas

Una vez instalado, hacer doble clic en:

​```
start.bat
​```

Este script:
- Levanta el backend (puerto **3000**) en una ventana de consola.
- Levanta el frontend (puerto **5173**) en otra ventana.
- Abre automáticamente el navegador en `http://localhost:5173`.

## Apagar el entorno

Dos formas:

- **Manual**: cerrar las dos ventanas de consola (Backend y Frontend).
- **Automático**: hacer doble clic en `stop.bat`.

## Cuentas de prueba

Para probar la aplicación, hay un usuario administrador creado por defecto:

- **Email**: `admin@adoptaya.com`
- **Contraseña**: `1234`

## Stack técnico

- **Frontend**: React 18, Vite, CSS plano
- **Backend**: Node.js, Express, MySQL (mysql2)
- **Autenticación**: JWT con bcrypt
- **Subida de archivos**: Multer
- **Comunicación tiempo real**: polling cada 5 segundos