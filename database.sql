-- database.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create session table for connect-pg-simple
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- Create credentials table
CREATE TABLE IF NOT EXISTS credentials (
  id SERIAL PRIMARY KEY,
  system_name VARCHAR(100) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  location_id INTEGER REFERENCES locations(id),
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  url VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name) VALUES ('Prefeituras') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name) VALUES ('Fornecedores') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name) VALUES ('Órgãos Governamentais') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name) VALUES ('B2Fleet e Locadoras') ON CONFLICT (name) DO NOTHING;

-- Insert default locations
INSERT INTO locations (name) VALUES ('São Paulo - SP') ON CONFLICT (name) DO NOTHING;
INSERT INTO locations (name) VALUES ('Rio de Janeiro - RJ') ON CONFLICT (name) DO NOTHING;
INSERT INTO locations (name) VALUES ('Belo Horizonte - MG') ON CONFLICT (name) DO NOTHING;
INSERT INTO locations (name) VALUES ('Brasília - DF') ON CONFLICT (name) DO NOTHING;
INSERT INTO locations (name) VALUES ('Salvador - BA') ON CONFLICT (name) DO NOTHING;

-- Insert sample credential
INSERT INTO credentials (system_name, category_id, location_id, username, password, url, notes, last_updated)
VALUES (
  'Portal Municipal', 
  (SELECT id FROM categories WHERE name = 'Prefeituras'), 
  (SELECT id FROM locations WHERE name = 'São Paulo - SP'),
  'admin.sp',
  'senha123',
  'https://portal.prefsp.gov.br',
  'Acesso ao portal municipal',
  '2024-12-10T00:00:00.000Z'
) ON CONFLICT DO NOTHING;

-- Create API function to get credential counts by category
CREATE OR REPLACE FUNCTION get_credential_counts()
RETURNS TABLE (
  category_id INTEGER,
  category_name VARCHAR(100),
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, COUNT(cr.id)
  FROM categories c
  LEFT JOIN credentials cr ON c.id = cr.category_id
  GROUP BY c.id, c.name
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;

-- Create API function to get credential counts by location
CREATE OR REPLACE FUNCTION get_location_counts()
RETURNS TABLE (
  location_id INTEGER,
  location_name VARCHAR(100),
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.name, COUNT(cr.id)
  FROM locations l
  LEFT JOIN credentials cr ON l.id = cr.location_id
  GROUP BY l.id, l.name
  ORDER BY l.name;
END;
$$ LANGUAGE plpgsql;

-- Create API endpoint for dashboard stats
CREATE OR REPLACE FUNCTION dashboard_stats()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'prefeituras', (SELECT COUNT(*) FROM credentials WHERE category_id = (SELECT id FROM categories WHERE name = 'Prefeituras')),
    'fornecedores', (SELECT COUNT(*) FROM credentials WHERE category_id = (SELECT id FROM categories WHERE name = 'Fornecedores')),
    'orgaos', (SELECT COUNT(*) FROM credentials WHERE category_id = (SELECT id FROM categories WHERE name = 'Órgãos Governamentais')),
    'b2fleet', (SELECT COUNT(*) FROM credentials WHERE category_id = (SELECT id FROM categories WHERE name = 'B2Fleet e Locadoras')),
    'total', (SELECT COUNT(*) FROM credentials)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;