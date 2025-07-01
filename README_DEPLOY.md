# Cofre Campneus - Deploy no Render

## Problema Resolvido

O erro `relation "session" does not exist` foi corrigido criando a tabela de sessão necessária para o `connect-pg-simple`.

## Arquivos Adicionados/Modificados

1. **`.env`** - Arquivo com as variáveis de ambiente do banco de dados
2. **`create_session_table.sql`** - Script SQL para criar a tabela de sessão

## Instruções para Deploy no Render

### 1. Configurar Variáveis de Ambiente

No painel do Render, configure as seguintes variáveis de ambiente:

```
PGUSER=neondb_owner
PGPASSWORD=npg_gB98aKTLscjf
PGHOST=ep-old-base-a8pi79i0-pooler.eastus2.azure.neon.tech
PGDATABASE=neondb
PGSSLMODE=require
PGCHANNELBINDING=require
SESSION_SECRET=your_session_secret_here
```

### 2. Configurar Build Command

No Render, configure o build command como:
```
yarn install
```

### 3. Configurar Start Command

Configure o start command como:
```
node server.js
```

### 4. Executar Script de Migração (Opcional)

Se a tabela `session` ainda não existir no banco de dados, execute o script SQL:
```sql
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");
```

## Estrutura do Projeto

- `server.js` - Arquivo principal da aplicação
- `config/database.js` - Configuração do banco de dados PostgreSQL
- `routes/` - Rotas da aplicação
- `views/` - Templates EJS
- `public/` - Arquivos estáticos (CSS, JS)
- `models/` - Modelos de dados

## Funcionalidades

- Sistema de autenticação com sessões
- Gerenciamento de credenciais/senhas
- Interface web responsiva
- Armazenamento seguro no PostgreSQL

A aplicação agora deve funcionar corretamente no Render sem erros de banco de dados.

