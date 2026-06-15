-- ============================================================
-- Script SQL: Sistema de Préstamos Personales
-- ============================================================

CREATE DATABASE IF NOT EXISTS prestamos_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE prestamos_db;

CREATE TABLE IF NOT EXISTS prestamos (
  id            INT           NOT NULL AUTO_INCREMENT,
  prestatario   VARCHAR(150)  NOT NULL,
  monto         DECIMAL(12,2) NOT NULL,
  tasa_interes  DECIMAL(5,4)  NOT NULL COMMENT 'Tasa en decimal, ej: 0.05 = 5%',
  meses         INT           NOT NULL,
  total_devolver DECIMAL(12,2) NOT NULL COMMENT 'Calculado: monto + (monto * tasa * meses)',
  estado        ENUM('pendiente','pagado','vencido') NOT NULL DEFAULT 'pendiente',
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos de ejemplo (opcional)
INSERT INTO prestamos (prestatario, monto, tasa_interes, meses, total_devolver, estado) VALUES
  ('Carlos Ramírez',  5000000.00, 0.0150, 12, 5900000.00, 'pendiente'),
  ('Laura Gómez',     2000000.00, 0.0200,  6, 2240000.00, 'pagado'),
  ('Andrés Morales',  8000000.00, 0.0100, 24, 9920000.00, 'vencido');
