-- ========================================================
-- Base de Datos: gamescore_db
-- Proyecto: GameScore App (Prueba Evaluable APIs)
-- Tablas Relacionadas: jugador (1) ---- (N) puntuacion
-- ========================================================

CREATE DATABASE IF NOT EXISTS gamescore_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gamescore_db;

-- 1. Tabla: jugador
DROP TABLE IF EXISTS puntuacion;
DROP TABLE IF EXISTS jugador;

CREATE TABLE jugador (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL
);

-- 2. Tabla: puntuacion (Relacionada con jugador por clave foránea)
CREATE TABLE puntuacion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    puntos INT NOT NULL,
    fecha DATE NOT NULL,
    jugador_id BIGINT NOT NULL,
    CONSTRAINT fk_puntuacion_jugador FOREIGN KEY (jugador_id) REFERENCES jugador(id) ON DELETE CASCADE
);

-- ========================================================
-- Datos de prueba iniciales
-- ========================================================

INSERT INTO jugador (id, nombre) VALUES
(1, 'Juan Pérez'),
(2, 'María González'),
(3, 'Carlos Ruiz'),
(4, 'Laura Gómez');

INSERT INTO puntuacion (puntos, fecha, jugador_id) VALUES
(250, '2026-10-10', 1),
(180, '2026-10-11', 2),
(320, '2026-10-12', 1),
(450, '2026-10-12', 3),
(210, '2026-10-13', 4),
(195, '2026-10-13', 2);
