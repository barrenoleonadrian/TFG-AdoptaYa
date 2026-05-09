-- ============================================
-- PARCHE SQL: VERIFICACIÓN DE REFUGIOS
-- ============================================
-- Ejecutar UNA VEZ en phpMyAdmin sobre 'adoptaya'.
--
-- Añade los campos cif y verificado a la tabla usuarios.
-- Los adoptantes y el admin se marcan automáticamente como verificados.
-- Los refugios existentes también, para no romper nada.
-- ============================================

ALTER TABLE usuarios
ADD COLUMN cif VARCHAR(20) NULL AFTER tipo,
ADD COLUMN verificado BOOLEAN DEFAULT FALSE AFTER cif;

-- todos los usuarios actuales se marcan como verificados
-- (para que el sistema siga funcionando como hasta ahora)
UPDATE usuarios SET verificado = TRUE;
