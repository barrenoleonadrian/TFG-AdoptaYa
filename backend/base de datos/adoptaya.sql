-- ============================================
-- AdoptaYa - SQL de inicialización
-- ============================================
-- Crea todas las tablas del proyecto y un usuario admin por defecto.
-- Este archivo lo carga Docker automáticamente al levantar el contenedor
-- de MySQL por primera vez.
-- ============================================

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    tipo ENUM('adoptante', 'protectora', 'admin') NOT NULL DEFAULT 'adoptante',
    cif VARCHAR(20) NULL,
    verificado BOOLEAN DEFAULT FALSE,
    telefono VARCHAR(20) NULL,
    ciudad VARCHAR(100) NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- TABLA: refugios
-- ============================================
CREATE TABLE IF NOT EXISTS refugios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) NULL,
    telefono VARCHAR(20) NULL,
    ciudad VARCHAR(100) NULL,
    descripcion TEXT NULL,
    imagen VARCHAR(255) NULL,
    INDEX idx_usuario_id (usuario_id)
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
    INDEX idx_usuario_id (usuario_id)
);


-- ============================================
-- TABLA: solicitudes_adopcion
-- ============================================
CREATE TABLE IF NOT EXISTS solicitudes_adopcion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre_solicitante VARCHAR(100) NULL,
    mayor_edad BOOLEAN NULL,
    direccion VARCHAR(255) NULL,
    tipo_vivienda VARCHAR(20) NULL,
    jardin BOOLEAN NULL,
    experiencia BOOLEAN NULL,
    otras_mascotas VARCHAR(255) NULL,
    motivo TEXT NULL,
    situacion_laboral VARCHAR(30) NULL,
    mascota_id INT NOT NULL,
    mensaje TEXT NULL,
    estado ENUM('pendiente', 'en_revision', 'aprobada', 'rechazada') DEFAULT 'pendiente',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_mascota_id (mascota_id)
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
    INDEX idx_emisor (emisor_id),
    INDEX idx_receptor (receptor_id)
);


-- ============================================
-- USUARIO ADMIN POR DEFECTO
-- ============================================
-- Email: admin@adoptaya.com
-- Contraseña: 1234
-- (El hash es el resultado de bcrypt sobre "1234")
-- ============================================
INSERT INTO usuarios (nombre, email, password, tipo, verificado)
VALUES (
    'Administrador',
    'admin@adoptaya.com',
    '$2b$10$wH5n3hQK1JZ.x0EyVxKZ8.LCqsCpHPp0e1bxqAyZc8qXxYn5GqJym',
    'admin',
    TRUE
);