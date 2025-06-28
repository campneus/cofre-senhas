-- Script de criação do banco de dados Cofre Campneus
-- Execute este script no PostgreSQL para criar as tabelas necessárias

-- Criação da tabela de localidades
CREATE TABLE IF NOT EXISTS localidades (
    id INTEGER PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true
);

-- Criação da tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('admin', 'analista')),
    localidade_id INTEGER REFERENCES localidades(id),
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso TIMESTAMP
);

-- Criação da tabela de senhas
CREATE TABLE IF NOT EXISTS senhas (
    id SERIAL PRIMARY KEY,
    sistema VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('prefeituras', 'fornecedores', 'orgaos', 'b2fleet')),
    localidade_id INTEGER REFERENCES localidades(id),
    usuario VARCHAR(255) NOT NULL,
    senha TEXT NOT NULL,
    url TEXT,
    observacoes TEXT,
    criado_por INTEGER REFERENCES usuarios(id),
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserção das localidades padrão
INSERT INTO localidades (id, nome, ativo) VALUES
(7, 'PETROLINA', true),
(8, 'SOROCABA', true),
(9, 'LONDRINA I', true),
(11, 'RIBEIRÃO PRETO', true),
(12, 'CAMPINA GRANDE', true),
(14, 'PRESIDENTE PRUDENTE', true),
(15, 'SÃO JOSÉ DO RIO PRETO I', true),
(21, 'GOIÂNIA', true),
(22, 'ARACAJU', true),
(23, 'PARNAMIRIM', true),
(25, 'DUQUE DE CAXIAS', true),
(26, 'LAJEADO', true),
(27, 'GRAVATAÍ', true),
(33, 'BAURU I', true),
(34, 'VITÓRIA', true),
(36, 'JUAZEIRO', true),
(47, 'JUAZEIRO DO NORTE', true),
(49, 'ANEL RODOVIÁRIO', true),
(52, 'SANTA CECÍLIA', true),
(58, 'BETIM', true),
(61, 'CAMPINAS ANHANGUERA', true),
(63, 'RECIFE I', true),
(65, 'BLUMENAU', true),
(68, 'FLORIANÓPOLIS', true),
(71, 'RECIFE II', true),
(73, 'VITÓRIA DA CONQUISTA', true),
(74, 'JOÃO PESSOA ll', true),
(75, 'FEIRA DE SANTANA I', true),
(76, 'CARUARU', true),
(77, 'ANÁPOLIS', true),
(82, 'MONTES CLAROS', true),
(88, 'DIVINÓPOLIS', true),
(91, 'BARUERI', true),
(92, 'MACEIÓ', true),
(97, 'AMOREIRAS', true),
(99, 'PIRACICABA', true),
(100, 'PAULINIA', true),
(101, 'MOGI MIRIM', true),
(102, 'ATIBAIA', true),
(103, 'SÃO CARLOS', true),
(104, 'VALINHOS', true),
(105, 'RIO CLARO', true),
(106, 'MOGI GUACU', true),
(107, 'AMERICANA', true),
(109, 'JUNDIAÍ', true),
(111, 'INDAIATUBA', true),
(112, 'FRANCA', true),
(115, 'BAURU II', true),
(118, 'NORTE SUL - BLACK', true),
(120, 'BARÃO DE ITAPURA', true),
(123, 'CAMPO GRANDE', true),
(125, 'TOLEDO', true),
(126, 'MARINGÁ', true),
(127, 'ARAÇATUBA', true),
(128, 'BARRETOS', true),
(132, 'ARARAQUARA', true),
(133, 'ASSIS', true),
(135, 'CATANDUVA', true),
(136, 'MARILIA', true),
(139, 'SÃO JOSÉ DO RIO PRETO II', true),
(140, 'DOURADOS', true),
(141, 'CASCAVEL', true),
(145, 'LAVRAS', true),
(146, 'ALFENAS', true),
(147, 'PARÁ DE MINAS', true),
(148, 'POÇOS DE CALDAS', true),
(149, 'POUSO ALEGRE', true),
(150, 'SÃO SEBASTIÃO DO PARAÍSO', true),
(151, 'VARGINHA', true),
(153, 'GUARAPUAVA', true),
(154, 'PONTA GROSSA I', true),
(155, 'PONTA GROSSA II', true),
(157, 'VILA LEOPOLDINA', true),
(159, 'CURITIBA', true),
(163, 'BENTO GONÇALVES', true),
(167, 'DUTRA', true),
(171, 'FEIRA DE SANTANA II', true),
(172, 'ITABUNA', true),
(173, 'TEIXEIRA DE FREITAS', true),
(176, 'UBERLÂNDIA', true),
(177, 'UBERABA', true),
(178, 'ITAJUBÁ', true),
(179, 'PIRAJÁ', true),
(180, 'BONOCO', true),
(182, 'ITAPUÃ', true),
(185, 'JOINVILLE', true),
(186, 'LAGES', true),
(188, 'FLORIANOPÓLIS SÃO JOSÉ', true),
(189, 'TUBARÃO', true),
(191, 'JABOATÃO DOS GUARARAPES', true),
(193, 'JOINVILLE II', true),
(194, 'CACHOEIRINHA', true),
(196, 'RIBEIRAO PRETO IV', true),
(200, 'PITUBA', true),
(202, 'BRAGANÇA PAULISTA', true),
(203, 'VILA NOVA CONCEIÇÃO', true),
(204, 'CURSINO (SAÚDE)', true),
(205, 'VILA MARIANA (Domingos de Morais)', true),
(206, 'PONTE DO SOCORRO', true),
(207, 'REBOUÇAS (Cerqueira César)', true),
(209, 'CORIFEU', true),
(210, 'BROOKLIN', true),
(211, 'GUARULHOS VILA AUGUSTA', true),
(212, 'SÃO JOSÉ DOS CAMPOS', true),
(213, 'PINHEIROS', true),
(217, 'ANÁLIA FRANCO', true),
(218, 'ITAIM PAULISTA - MARECHAL TITO', true),
(219, 'VILA MATILDE', true),
(221, 'VILA GUILHERME', true),
(222, 'OSASCO CENTRO 2', true),
(223, 'PINDAMONHANGABA', true),
(224, 'SANTO ANDRÉ', true),
(227, 'HEITOR PENTEADO', true),
(229, 'LIMEIRA 2', true),
(230, 'ATIBAIA 2', true),
(232, 'SÃO BERNARDO DO CAMPO', true),
(233, 'SANTANA DE PARNAÍBA (Alphaville)', true),
(234, 'BARÃO GERALDO', true),
(235, 'JOÃO PESSOA', true),
(236, 'MOSSORÓ', true),
(237, 'GOIÂNIA', true)
ON CONFLICT (id) DO NOTHING;

-- Criação de usuário administrador padrão
-- Senha: admin123 (hash bcrypt)
INSERT INTO usuarios (nome, email, senha, tipo_usuario, localidade_id, ativo) VALUES
('Administrador', 'admin@campneus.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGtrmu3VG', 'admin', 7, true)
ON CONFLICT (email) DO NOTHING;

-- Criação de índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_senhas_categoria ON senhas(categoria);
CREATE INDEX IF NOT EXISTS idx_senhas_localidade ON senhas(localidade_id);
CREATE INDEX IF NOT EXISTS idx_senhas_ativo ON senhas(ativo);

-- Comentários nas tabelas
COMMENT ON TABLE localidades IS 'Tabela de localidades/filiais da empresa';
COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema';
COMMENT ON TABLE senhas IS 'Tabela de senhas/credenciais armazenadas';

COMMENT ON COLUMN usuarios.tipo_usuario IS 'Tipo de usuário: admin (pode criar/editar/deletar) ou analista (apenas visualizar)';
COMMENT ON COLUMN senhas.categoria IS 'Categoria da senha: prefeituras, fornecedores, orgaos, b2fleet';
COMMENT ON COLUMN senhas.senha IS 'Senha criptografada';

-- Função para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_data_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar data_atualizacao
CREATE TRIGGER trigger_update_usuarios_data_atualizacao
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_data_atualizacao();

CREATE TRIGGER trigger_update_senhas_data_atualizacao
    BEFORE UPDATE ON senhas
    FOR EACH ROW
    EXECUTE FUNCTION update_data_atualizacao();

