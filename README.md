# Cofre Campneus - Sistema de Gerenciamento de Senhas

Um sistema completo para gerenciamento seguro de senhas empresariais, desenvolvido para a Campneus.

## Sobre o Projeto

O Cofre Campneus é um sistema de gerenciamento de senhas projetado especificamente para a Campneus, permitindo armazenar e gerenciar credenciais de acesso para diversos sistemas, organizados por categorias:

- Prefeituras
- Fornecedores
- Órgãos Governamentais
- B2Fleet e Locadoras

## Tecnologias Utilizadas

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- Express Handlebars
- JWT para autenticação
- Bcrypt para criptografia de senhas

## Configuração do Ambiente Local

### Pré-requisitos

- Node.js (v14 ou superior)
- PostgreSQL

### Instalação

1. Clone o repositório


2. Instale as dependências


3. Configure o ambiente

Edite o arquivo `.env` com suas configurações locais, especialmente as de conexão ao banco de dados.

4. Crie o banco de dados e execute o esquema


5. Inicie o servidor


O aplicativo estará disponível em `http://localhost:3000`

### Acesso Inicial

Acesse o sistema usando:
- Email: admin@campneus.com.br
- Senha: admin123

⚠️ **IMPORTANTE**: Altere a senha do administrador após o primeiro login!

## Deployment na Render

O sistema está configurado para fácil deployment na plataforma Render. Siga os passos abaixo:

### 1. Crie uma conta na Render

Acesse [render.com](https://render.com/) e crie uma conta se ainda não tiver uma.

### 2. Conecte seu repositório

- No dashboard da Render, clique em "New" e selecione "Blueprint".
- Conecte seu repositório do GitHub/GitLab onde o código está hospedado.
- Selecione o repositório do Cofre Campneus.

### 3. Configure o Banco de Dados

- No dashboard da Render, clique em "New" e selecione "PostgreSQL".
- Preencha as informações:
  - Nome: cofre-campneus-db
  - Plano: Selecione um plano adequado (pelo menos o Standard)
  - Região: Escolha a mais próxima dos seus usuários
- Clique em "Create Database"
- Anote as credenciais fornecidas pela Render.

### 4. Configure o Serviço Web

- No dashboard da Render, clique em "New" e selecione "Web Service".
- Conecte ao seu repositório Git.
- Configure o serviço:
  - Nome: cofre-campneus
  - Ambiente: Node
  - Build Command: `npm install`
  - Start Command: `node server.js`
  - Plano: Selecione um plano adequado

### 5. Configure as Variáveis de Ambiente

Na seção "Environment" do seu serviço web, adicione as seguintes variáveis:

```
NODE_ENV=production
PORT=10000
SESSION_SECRET=use_uma_string_aleatoria_segura
JWT_SECRET=use_outra_string_aleatoria_segura
DB_HOST=seu_host_postgres_render
DB_NAME=seu_nome_db
DB_USER=seu_usuario_db
DB_PASSWORD=sua_senha_db
DB_PORT=5432
COOKIE_SECURE=true
COOKIE_HTTP_ONLY=true
```

### 6. Importe o Esquema do Banco de Dados

Para inicializar seu banco de dados, você pode usar o arquivo `database/schema.sql`.

1. Abra o Dashboard do PostgreSQL na Render
2. Acesse a seção "Shell"
3. Execute o seguinte comando substituindo com seu nome de banco de dados:

```sql
\i database/schema.sql
```

Alternativamente, você pode copiar e colar o conteúdo do arquivo schema.sql diretamente.

### 7. Acesse o Sistema

Após o deploy, seu sistema estará disponível no endereço fornecido pela Render. Use as credenciais de administrador para fazer login e começar a usar o sistema.

## Funcionalidades

- Gerenciamento de senhas por categorias
- Controle de acesso baseado em perfis de usuário (Admin, Gerente, Usuário)
- Localidades com informações fiscais (CNPJ, IE, IM)
- Dashboard com estatísticas e alertas de senhas a expirar
- Registro de acessos para auditoria
- Criptografia segura de senhas

## Segurança

- Todas as senhas de usuários são armazenadas com hash bcrypt
- As credenciais são protegidas e só são exibidas mediante interação do usuário
- Controle de sessão com tokens JWT
- Proteção contra CSRF e XSS

## Suporte

Para suporte ou dúvidas, entre em contato com a equipe de TI da Campneus.
