-- database/schema.sql
-- Database schema for Cofre Campneus Password Management System

-- Create database (run this separately if needed)
-- CREATE DATABASE cofre_campneus;

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    last_login TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    state_registration VARCHAR(50),
    municipal_registration VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_locations_timestamp
BEFORE UPDATE ON locations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Passwords Table
CREATE TABLE IF NOT EXISTS passwords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_name VARCHAR(255) NOT NULL,
    url VARCHAR(255),
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('prefeituras', 'fornecedores', 'orgaos', 'b2fleet')),
    notes TEXT,
    expiry_date DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    location_id UUID REFERENCES locations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_passwords_timestamp
BEFORE UPDATE ON passwords
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Password Access Log Table
CREATE TABLE IF NOT EXISTS password_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    password_id UUID REFERENCES passwords(id),
    user_id UUID REFERENCES users(id),
    access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('view', 'edit', 'delete'))
);

-- Insert default admin user with password 'admin123' (hashed)
-- The password should be changed immediately after first login
INSERT INTO users (name, email, password, role)
VALUES (
    'Administrador', 
    'admin@campneus.com.br',
    '$2a$10$XbCpgETCtLQw5XYmM8NKPeTgG.9P5vQWt3S9.aqRQUKhc1nrCkp7e', -- 'admin123'
    'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Insert sample locations
INSERT INTO locations (code, name, cnpj, state_registration, municipal_registration)
VALUES 
    ('SP001', 'São Paulo - Matriz', '12.345.678/0001-99', '123456789', '987654321'),
    ('RJ001', 'Rio de Janeiro - Filial', '12.345.678/0002-70', '234567890', '876543210')
ON CONFLICT (code) DO NOTHING;