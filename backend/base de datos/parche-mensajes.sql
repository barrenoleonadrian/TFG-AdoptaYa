-- ============================================
-- PARCHE SQL: TABLA DE MENSAJES
-- ============================================
-- Ejecutar UNA VEZ en phpMyAdmin sobre la base de datos 'adoptaya'.
--
-- Crea la tabla para guardar los mensajes entre adoptantes y refugios.
-- Una "conversación" se compone de todos los mensajes entre dos usuarios.
-- ============================================

CREATE TABLE mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emisor_id INT NOT NULL,
    receptor_id INT NOT NULL,
    texto TEXT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (emisor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (receptor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_conversacion (emisor_id, receptor_id),
    INDEX idx_fecha (fecha)
);
