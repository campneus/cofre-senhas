# Cofre Campneus - Sistema de Gerenciamento de Senhas

Sistema web para gerenciamento seguro de senhas e credenciais da empresa Campneus, desenvolvido em Node.js com PostgreSQL.

## Características

- **Autenticação JWT**: Sistema seguro de login com tokens
- **Dois tipos de usuário**: Administradores (CRUD completo) e Analistas (apenas visualização)
- **Criptografia**: Senhas armazenadas com criptografia AES-256
- **Interface moderna**: Design responsivo com Tailwind CSS
- **Categorização**: Organização por categorias (Prefeituras, Fornecedores, Órgãos, B2Fleet)
- **Localidades**: Sistema pré-configurado com todas as filiais da empresa

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens)
- **Criptografia**: bcryptjs (senhas de usuário), crypto (senhas armazenadas)
- **Frontend**: HTML5, CSS3, JavaScript, Tailwind CSS
- **Segurança**: Helmet, CORS, Rate Limiting

## Instalação Local

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL
- Git

### Passos

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd cofre-campneus
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o banco de dados**
   - Execute o script `database.sql` no seu PostgreSQL
   - Configure as variáveis de ambiente no arquivo `.env`

4. **Execute a aplicação**
   ```bash
   # Desenvolvimento
   npm run dev
   
   # Produção
   npm start
   ```

5. **Acesse o sistema**
   - URL: http://localhost:3000
   - Login padrão: admin@campneus.com
   - Senha padrão: admin123

## Deploy no Render

### Configuração do Banco de Dados

1. **Conecte-se ao PostgreSQL**
   ```bash
   psql -h ep-crimson-meadow-a8krhs13.eastus2.azure.neon.tech -U senhas_campneus_owner -d senhas_campneus
   ```

2. **Execute o script SQL**
   ```bash
   \i database.sql
   ```

### Deploy da Aplicação

1. **Faça upload do projeto** para o Render
2. **Configure as variáveis de ambiente** no painel do Render:
   - `PGHOST`: ep-crimson-meadow-a8krhs13.eastus2.azure.neon.tech
   - `PGDATABASE`: senhas_campneus
   - `PGUSER`: senhas_campneus_owner
   - `PGPASSWORD`: npg_MXP5UK4CqToH
   - `PGSSLMODE`: require
   - `JWT_SECRET`: (gere uma chave segura)
   - `ENCRYPTION_KEY`: (gere uma chave de 32 caracteres)

3. **Configure o comando de build**:
   ```bash
   npm install
   ```

4. **Configure o comando de start**:
   ```bash
   npm start
   ```

## Estrutura do Projeto

```
cofre-campneus/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do banco
│   ├── controllers/
│   │   ├── authController.js    # Controlador de autenticação
│   │   ├── userController.js    # Controlador de usuários
│   │   ├── passwordController.js # Controlador de senhas
│   │   └── locationController.js # Controlador de localidades
│   ├── middleware/
│   │   └── auth.js              # Middleware de autenticação
│   ├── models/
│   │   ├── User.js              # Modelo de usuário
│   │   ├── Password.js          # Modelo de senha
│   │   └── Location.js          # Modelo de localidade
│   ├── routes/
│   │   ├── auth.js              # Rotas de autenticação
│   │   ├── users.js             # Rotas de usuários
│   │   ├── passwords.js         # Rotas de senhas
│   │   └── locations.js         # Rotas de localidades
│   └── app.js                   # Arquivo principal
├── public/
│   ├── js/
│   │   └── app.js               # JavaScript do frontend
│   └── index.html               # Interface do usuário
├── database.sql                 # Script de criação do banco
├── .env                         # Variáveis de ambiente
├── package.json                 # Dependências do projeto
└── README.md                    # Este arquivo
```

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/logout` - Logout do usuário
- `GET /api/auth/me` - Dados do usuário logado
- `POST /api/auth/change-password` - Alterar senha

### Usuários (Admin apenas)
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Buscar usuário por ID
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Senhas
- `GET /api/passwords` - Listar senhas (Admin/Analista)
- `GET /api/passwords/:id` - Buscar senha por ID (Admin/Analista)
- `GET /api/passwords/stats` - Estatísticas (Admin/Analista)
- `POST /api/passwords` - Criar senha (Admin apenas)
- `PUT /api/passwords/:id` - Atualizar senha (Admin apenas)
- `DELETE /api/passwords/:id` - Deletar senha (Admin apenas)

### Localidades
- `GET /api/locations` - Listar localidades (Admin/Analista)
- `GET /api/locations/:id` - Buscar localidade por ID (Admin/Analista)
- `POST /api/locations` - Criar localidade (Admin apenas)
- `PUT /api/locations/:id` - Atualizar localidade (Admin apenas)
- `DELETE /api/locations/:id` - Deletar localidade (Admin apenas)

## Segurança

- **Autenticação**: JWT com expiração de 8 horas
- **Autorização**: Middleware para verificar permissões por tipo de usuário
- **Criptografia**: Senhas de usuário com bcrypt (12 rounds)
- **Criptografia**: Senhas armazenadas com AES-256-CBC
- **Rate Limiting**: Máximo 100 requests por IP a cada 15 minutos
- **Headers de Segurança**: Helmet.js para headers HTTP seguros
- **CORS**: Configurado para permitir apenas origens autorizadas

## Usuário Padrão

- **Email**: admin@campneus.com
- **Senha**: admin123
- **Tipo**: Administrador

**⚠️ IMPORTANTE**: Altere a senha padrão após o primeiro login!

## Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato com a equipe de TI.

## Licença

Este projeto é propriedade da empresa Campneus e é destinado apenas para uso interno.

