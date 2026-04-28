-- ============================================
-- PARCHE SQL PARA LA TABLA 'refugios'
-- ============================================
-- Ejecuta esto UNA VEZ en phpMyAdmin, pestaña SQL,
-- sobre la base de datos 'adoptaya'.
--
-- Añade la columna 'usuario_id' a la tabla refugios
-- para poder enlazar cada refugio con el usuario que lo creó.
-- ============================================

ALTER TABLE refugios
ADD COLUMN usuario_id INT NULL AFTER id;

-- opcional: crear un índice para que las búsquedas por usuario_id sean rápidas
ALTER TABLE refugios
ADD INDEX idx_usuario_id (usuario_id);
