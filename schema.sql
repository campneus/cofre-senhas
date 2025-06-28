CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS passwords (
    id SERIAL PRIMARY KEY,
    system VARCHAR(255) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    location_id INTEGER REFERENCES locations(id),
    category_id INTEGER REFERENCES categories(id),
    username_credential VARCHAR(255) NOT NULL,
    url VARCHAR(255),
    last_updated DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Inserir dados iniciais (opcional)
INSERT INTO users (username, password, role) VALUES ('admin', 'admin_password_hash', 'admin') ON CONFLICT (username) DO NOTHING;
INSERT INTO categories (name) VALUES ('Prefeituras'), ('Fornecedores'), ('Órgãos Governamentais'), ('B2Fleet e Locadoras') ON CONFLICT (name) DO NOTHING;
INSERT INTO locations (name) VALUES ('São Paulo - SP') ON CONFLICT (name) DO NOTHING;


