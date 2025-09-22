-- Esquema de base de datos para el gestor de reservas de cine
-- Este archivo se ejecuta automáticamente al inicializar PostgreSQL

-- Crear tablas del sistema
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes'),
    is_premium BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS seats (
    id SERIAL PRIMARY KEY,
    row_letter CHAR(1) NOT NULL,
    number INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'available', -- available, reserved, occupied, premium
    is_premium BOOLEAN DEFAULT FALSE,
    UNIQUE(row_letter, number)
);

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    seat_id INTEGER REFERENCES seats(id) ON DELETE CASCADE,
    combo VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(seat_id) -- Un asiento solo puede tener una reserva activa
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_users_expires_at ON users(expires_at);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_seats_status ON seats(status);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);

-- Inicializar asientos del cine (8 filas x 12 asientos = 96 asientos)
-- Filas A-H, asientos 1-12
INSERT INTO seats (row_letter, number, is_premium, status) VALUES
-- Fila A (primera fila, algunos premium)
('A', 1, FALSE, 'available'),
('A', 2, FALSE, 'available'),
('A', 3, TRUE, 'available'),
('A', 4, TRUE, 'available'),
('A', 5, TRUE, 'available'),
('A', 6, TRUE, 'available'),
('A', 7, TRUE, 'available'),
('A', 8, TRUE, 'available'),
('A', 9, TRUE, 'available'),
('A', 10, TRUE, 'available'),
('A', 11, FALSE, 'available'),
('A', 12, FALSE, 'available'),

-- Fila B
('B', 1, FALSE, 'available'),
('B', 2, FALSE, 'available'),
('B', 3, FALSE, 'available'),
('B', 4, TRUE, 'available'),
('B', 5, TRUE, 'available'),
('B', 6, TRUE, 'available'),
('B', 7, TRUE, 'available'),
('B', 8, TRUE, 'available'),
('B', 9, TRUE, 'available'),
('B', 10, FALSE, 'available'),
('B', 11, FALSE, 'available'),
('B', 12, FALSE, 'available'),

-- Fila C
('C', 1, FALSE, 'available'),
('C', 2, FALSE, 'available'),
('C', 3, FALSE, 'available'),
('C', 4, TRUE, 'available'),
('C', 5, TRUE, 'available'),
('C', 6, TRUE, 'available'),
('C', 7, TRUE, 'available'),
('C', 8, TRUE, 'available'),
('C', 9, TRUE, 'available'),
('C', 10, FALSE, 'available'),
('C', 11, FALSE, 'available'),
('C', 12, FALSE, 'available'),

-- Fila D (mejores asientos - centro del cine)
('D', 1, FALSE, 'available'),
('D', 2, FALSE, 'available'),
('D', 3, TRUE, 'available'),
('D', 4, TRUE, 'available'),
('D', 5, TRUE, 'available'),
('D', 6, TRUE, 'available'),
('D', 7, TRUE, 'available'),
('D', 8, TRUE, 'available'),
('D', 9, TRUE, 'available'),
('D', 10, TRUE, 'available'),
('D', 11, FALSE, 'available'),
('D', 12, FALSE, 'available'),

-- Fila E (mejores asientos - centro del cine)
('E', 1, FALSE, 'available'),
('E', 2, FALSE, 'available'),
('E', 3, TRUE, 'available'),
('E', 4, TRUE, 'available'),
('E', 5, TRUE, 'available'),
('E', 6, TRUE, 'available'),
('E', 7, TRUE, 'available'),
('E', 8, TRUE, 'available'),
('E', 9, TRUE, 'available'),
('E', 10, TRUE, 'available'),
('E', 11, FALSE, 'available'),
('E', 12, FALSE, 'available'),

-- Fila F
('F', 1, FALSE, 'available'),
('F', 2, FALSE, 'available'),
('F', 3, FALSE, 'available'),
('F', 4, FALSE, 'available'),
('F', 5, FALSE, 'available'),
('F', 6, FALSE, 'available'),
('F', 7, FALSE, 'available'),
('F', 8, FALSE, 'available'),
('F', 9, FALSE, 'available'),
('F', 10, FALSE, 'available'),
('F', 11, FALSE, 'available'),
('F', 12, FALSE, 'available'),

-- Fila G
('G', 1, FALSE, 'available'),
('G', 2, FALSE, 'available'),
('G', 3, FALSE, 'available'),
('G', 4, FALSE, 'available'),
('G', 5, FALSE, 'available'),
('G', 6, FALSE, 'available'),
('G', 7, FALSE, 'available'),
('G', 8, FALSE, 'available'),
('G', 9, FALSE, 'available'),
('G', 10, FALSE, 'available'),
('G', 11, FALSE, 'available'),
('G', 12, FALSE, 'available'),

-- Fila H (última fila)
('H', 1, FALSE, 'available'),
('H', 2, FALSE, 'available'),
('H', 3, FALSE, 'available'),
('H', 4, FALSE, 'available'),
('H', 5, FALSE, 'available'),
('H', 6, FALSE, 'available'),
('H', 7, FALSE, 'available'),
('H', 8, FALSE, 'available'),
('H', 9, FALSE, 'available'),
('H', 10, FALSE, 'available'),
('H', 11, FALSE, 'available'),
('H', 12, FALSE, 'available');

-- Función para limpiar usuarios expirados y sus reservas
CREATE OR REPLACE FUNCTION cleanup_expired_users()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Eliminar reservas de usuarios expirados
    DELETE FROM reservations 
    WHERE user_id IN (
        SELECT id FROM users 
        WHERE expires_at <= CURRENT_TIMESTAMP
    );
    
    -- Actualizar estado de asientos liberados
    UPDATE seats 
    SET status = 'available' 
    WHERE id NOT IN (
        SELECT DISTINCT seat_id FROM reservations
    ) AND status IN ('reserved', 'occupied');
    
    -- Eliminar usuarios expirados
    DELETE FROM users 
    WHERE expires_at <= CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Crear un usuario bot para simulaciones (no expira)
INSERT INTO users (username, password_hash, created_at, expires_at, is_premium) 
VALUES ('cinema_bot', '$2b$12$dummy_hash_for_bot_user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 year', FALSE)
ON CONFLICT (username) DO NOTHING;