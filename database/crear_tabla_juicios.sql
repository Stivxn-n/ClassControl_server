-- Tabla de juicios evaluativos del aprendiz (SENA).
USE railway;

CREATE TABLE IF NOT EXISTS juicios_evaluativos (
    id_juicio INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Usuarios_id_usuarios INT NOT NULL COMMENT 'Aprendiz evaluado',
    Resultado_aprendizaje_id_resultado_aprendizaje INT NULL,
    Trimestre_id_trimestre INT NULL,
    valoracion VARCHAR(45) NOT NULL COMMENT 'Aprobado / En proceso / Por evaluar',
    observacion VARCHAR(255) NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_juicio_usuario FOREIGN KEY (Usuarios_id_usuarios)
        REFERENCES usuarios (id_usuarios) ON DELETE CASCADE,
    CONSTRAINT fk_juicio_resultado FOREIGN KEY (Resultado_aprendizaje_id_resultado_aprendizaje)
        REFERENCES resultado_aprendizaje (id_resultado_aprendizaje) ON DELETE SET NULL,
    CONSTRAINT fk_juicio_trimestre FOREIGN KEY (Trimestre_id_trimestre)
        REFERENCES trimestre (id_trimestre) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
