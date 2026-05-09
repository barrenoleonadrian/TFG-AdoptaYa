-- ============================================
-- PARCHE SQL: SISTEMA REALISTA DE ADOPCIONES
-- ============================================
-- Ejecutar UNA VEZ en phpMyAdmin sobre 'adoptaya'.
-- ============================================

-- 1) Añadir campos del formulario de adopción a solicitudes_adopcion
ALTER TABLE solicitudes_adopcion
ADD COLUMN nombre_solicitante VARCHAR(100) NULL AFTER usuario_id,
ADD COLUMN mayor_edad BOOLEAN NULL AFTER nombre_solicitante,
ADD COLUMN direccion VARCHAR(255) NULL AFTER mayor_edad,
ADD COLUMN tipo_vivienda VARCHAR(20) NULL AFTER direccion,
ADD COLUMN jardin BOOLEAN NULL AFTER tipo_vivienda,
ADD COLUMN experiencia BOOLEAN NULL AFTER jardin,
ADD COLUMN otras_mascotas VARCHAR(255) NULL AFTER experiencia,
ADD COLUMN motivo TEXT NULL AFTER otras_mascotas,
ADD COLUMN situacion_laboral VARCHAR(30) NULL AFTER motivo;

-- 2) Ampliar el enum de estado para incluir 'en_revision' y 'aprobada'
ALTER TABLE solicitudes_adopcion
MODIFY COLUMN estado ENUM('pendiente','en_revision','aprobada','rechazada') DEFAULT 'pendiente';

-- 3) Ampliar el enum de estado de mascotas para incluir 'reservada'
ALTER TABLE mascotas
MODIFY COLUMN estado ENUM('disponible','pendiente','reservada','adoptado') DEFAULT 'disponible';
