-- Cofre Campneus - Sistema de Gerenciamento de Senhas
-- Script de criação do banco de dados PostgreSQL

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de usuários
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('administrador', 'analista')),
    ativo BOOLEAN DEFAULT true,
    ultimo_acesso TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de localidades
CREATE TABLE localidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_localidade VARCHAR(20) UNIQUE NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    nome_localidade VARCHAR(200) NOT NULL,
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(150),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de prefeituras
CREATE TABLE prefeituras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    localidade_id UUID REFERENCES localidades(id) ON DELETE CASCADE,
    nome_prefeito VARCHAR(100),
    partido VARCHAR(20),
    mandato_inicio DATE,
    mandato_fim DATE,
    populacao INTEGER,
    area_km2 DECIMAL(10,2),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de fornecedores
CREATE TABLE fornecedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    localidade_id UUID REFERENCES localidades(id) ON DELETE CASCADE,
    razao_social VARCHAR(200) NOT NULL,
    nome_fantasia VARCHAR(200),
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    inscricao_estadual VARCHAR(20),
    tipo_fornecedor VARCHAR(50),
    ramo_atividade VARCHAR(100),
    contato_principal VARCHAR(100),
    telefone_contato VARCHAR(20),
    email_contato VARCHAR(150),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de senhas
CREATE TABLE senhas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sistema VARCHAR(200) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('prefeituras', 'fornecedores', 'orgaos', 'b2fleet')),
    localidade_id UUID REFERENCES localidades(id) ON DELETE SET NULL,
    prefeitura_id UUID REFERENCES prefeituras(id) ON DELETE SET NULL,
    fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
    url VARCHAR(500),
    usuario VARCHAR(200) NOT NULL,
    senha_criptografada TEXT NOT NULL,
    observacoes TEXT,
    data_expiracao DATE,
    notificar_expiracao BOOLEAN DEFAULT true,
    dias_aviso_expiracao INTEGER DEFAULT 30,
    criado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    atualizado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de sessões (para express-session)
CREATE TABLE sessoes (
    sid VARCHAR NOT NULL COLLATE "default",
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE sessoes ADD CONSTRAINT sessoes_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX IDX_sessoes_expire ON sessoes(expire);

-- Tabela de logs de acesso
CREATE TABLE logs_acesso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    senha_id UUID REFERENCES senhas(id) ON DELETE SET NULL,
    acao VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX idx_senhas_categoria ON senhas(categoria);
CREATE INDEX idx_senhas_localidade ON senhas(localidade_id);
CREATE INDEX idx_senhas_criado_em ON senhas(criado_em);
CREATE INDEX idx_senhas_atualizado_em ON senhas(atualizado_em);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX idx_localidades_cnpj ON localidades(cnpj);
CREATE INDEX idx_fornecedores_cnpj ON fornecedores(cnpj);
CREATE INDEX idx_logs_acesso_usuario ON logs_acesso(usuario_id);
CREATE INDEX idx_logs_acesso_criado_em ON logs_acesso(criado_em);

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar timestamp automaticamente
CREATE TRIGGER trigger_usuarios_atualizado_em
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_localidades_atualizado_em
    BEFORE UPDATE ON localidades
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_prefeituras_atualizado_em
    BEFORE UPDATE ON prefeituras
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_fornecedores_atualizado_em
    BEFORE UPDATE ON fornecedores
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_senhas_atualizado_em
    BEFORE UPDATE ON senhas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

-- Inserir usuário administrador padrão
INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario) 
VALUES (
    'Administrador',
    'admin@cofrecampneus.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcQs9BpeS', -- senha: admin123
    'administrador'
);

-- Inserir algumas localidades de exemplo
INSERT INTO localidades (codigo_localidade, cnpj, nome_localidade, endereco, telefone, email) VALUES
('LOC001', '12.345.678/0001-90', 'Prefeitura Municipal de São Paulo', 'Viaduto do Chá, 15 - Centro, São Paulo - SP', '(11) 3113-9999', 'contato@prefeitura.sp.gov.br'),
('LOC002', '23.456.789/0001-01', 'Prefeitura Municipal do Rio de Janeiro', 'Rua Afonso Cavalcanti, 455 - Cidade Nova, Rio de Janeiro - RJ', '(21) 2976-1000', 'contato@rio.rj.gov.br'),
('LOC003', '34.567.890/0001-12', 'Fornecedor ABC Ltda', 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP', '(11) 3000-1000', 'contato@fornecedorabc.com.br');

-- Inserir algumas prefeituras de exemplo
INSERT INTO prefeituras (localidade_id, nome_prefeito, partido, mandato_inicio, mandato_fim, populacao, area_km2) VALUES
((SELECT id FROM localidades WHERE codigo_localidade = 'LOC001'), 'Ricardo Nunes', 'MDB', '2021-01-01', '2024-12-31', 12396372, 1521.11),
((SELECT id FROM localidades WHERE codigo_localidade = 'LOC002'), 'Eduardo Paes', 'PSD', '2021-01-01', '2024-12-31', 6775561, 1200.27);

-- Inserir alguns fornecedores de exemplo
INSERT INTO fornecedores (localidade_id, razao_social, nome_fantasia, cnpj, tipo_fornecedor, ramo_atividade, contato_principal, telefone_contato, email_contato) VALUES
((SELECT id FROM localidades WHERE codigo_localidade = 'LOC003'), 'Fornecedor ABC Ltda', 'ABC Fornecimentos', '34.567.890/0001-12', 'Pessoa Jurídica', 'Materiais de Construção', 'João Silva', '(11) 3000-1001', 'joao@fornecedorabc.com.br');

-- Inserir algumas senhas de exemplo
INSERT INTO senhas (sistema, categoria, localidade_id, url, usuario, senha_criptografada, observacoes, criado_por) VALUES
('Portal da Transparência SP', 'prefeituras', (SELECT id FROM localidades WHERE codigo_localidade = 'LOC001'), 'https://transparencia.prefeitura.sp.gov.br', 'admin.sp', 'U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y=', 'Acesso ao portal de transparência', (SELECT id FROM usuarios WHERE email = 'admin@cofrecampneus.com')),
('Sistema B2Fleet', 'b2fleet', NULL, 'https://b2fleet.com.br/login', 'campneus.user', 'U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y=', 'Acesso ao sistema de gestão de frota', (SELECT id FROM usuarios WHERE email = 'admin@cofrecampneus.com')),
('Portal Fornecedor ABC', 'fornecedores', (SELECT id FROM localidades WHERE codigo_localidade = 'LOC003'), 'https://portal.fornecedorabc.com.br', 'campneus', 'U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y=', 'Portal do fornecedor ABC', (SELECT id FROM usuarios WHERE email = 'admin@cofrecampneus.com'));

