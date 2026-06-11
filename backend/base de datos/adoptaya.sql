-- ============================================
-- AdoptaYa - SQL de inicialización
-- ============================================
-- Estructura normalizada sin datos duplicados, con claves foráneas
-- para garantizar la integridad referencial.
-- ============================================


-- ============================================
-- TABLA: usuarios
-- ============================================
-- Datos comunes a TODOS los actores (adoptante, refugio, admin).
-- El campo `tipo` diferencia el rol.
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    tipo ENUM('adoptante', 'protectora', 'admin') NOT NULL DEFAULT 'adoptante',
    verificado BOOLEAN DEFAULT FALSE,
    telefono VARCHAR(20) NULL,
    ciudad VARCHAR(100) NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- TABLA: refugios
-- ============================================
-- Datos ESPECÍFICOS del refugio. Los datos comunes (nombre, email,
-- telefono, ciudad) están en `usuarios` y se obtienen con JOIN.
-- Cada refugio está vinculado a una cuenta de usuario mediante
-- una clave foránea con borrado en cascada.
-- ============================================
CREATE TABLE IF NOT EXISTS refugios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    cif VARCHAR(20) NOT NULL,
    descripcion TEXT NULL,
    imagen VARCHAR(255) NULL,
    CONSTRAINT fk_refugios_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);


-- ============================================
-- TABLA: mascotas
-- ============================================
CREATE TABLE IF NOT EXISTS mascotas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    raza VARCHAR(100) NULL,
    sexo VARCHAR(20) NULL,
    edad INT NULL,
    descripcion TEXT NULL,
    ciudad VARCHAR(100) NULL,
    imagen VARCHAR(255) NULL,
    estado ENUM('disponible', 'pendiente', 'reservada', 'adoptado') DEFAULT 'disponible',
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mascotas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);


-- ============================================
-- TABLA: solicitudes_adopcion
-- ============================================
CREATE TABLE IF NOT EXISTS solicitudes_adopcion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    mascota_id INT NOT NULL,
    nombre_solicitante VARCHAR(100) NULL,
    mayor_edad BOOLEAN NULL,
    direccion VARCHAR(255) NULL,
    tipo_vivienda VARCHAR(20) NULL,
    jardin BOOLEAN NULL,
    experiencia BOOLEAN NULL,
    otras_mascotas VARCHAR(255) NULL,
    motivo TEXT NULL,
    situacion_laboral VARCHAR(30) NULL,
    mensaje TEXT NULL,
    estado ENUM('pendiente', 'en_revision', 'aprobada', 'rechazada') DEFAULT 'pendiente',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_solicitudes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_solicitudes_mascota FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE CASCADE
);


-- ============================================
-- TABLA: mensajes
-- ============================================
CREATE TABLE IF NOT EXISTS mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emisor_id INT NOT NULL,
    receptor_id INT NOT NULL,
    texto TEXT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_mensajes_emisor FOREIGN KEY (emisor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_mensajes_receptor FOREIGN KEY (receptor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);


-- ============================================
-- USUARIO ADMIN POR DEFECTO
-- Email: admin@adoptaya.com
-- Contraseña: 1234
-- ============================================
INSERT INTO usuarios (nombre, email, password, tipo, verificado)
VALUES (
    'Administrador',
    'admin@adoptaya.com',
    '$2b$10$wH5n3hQK1JZ.x0EyVxKZ8.LCqsCpHPp0e1bxqAyZc8qXxYn5GqJym',
    'admin',
    TRUE
);