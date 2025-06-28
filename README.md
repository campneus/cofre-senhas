# Cofre Campneus - Sistema de Gerenciamento de Senhas

Sistema web desenvolvido em Node.js para gerenciamento de credenciais e senhas, com interface moderna e conexão ao PostgreSQL.

## 🚀 Funcionalidades

- ✅ Autenticação de usuários com JWT
- ✅ CRUD completo de senhas
- ✅ Busca e filtragem por categoria
- ✅ Interface responsiva e moderna
- ✅ Conexão segura com PostgreSQL
- ✅ Pronto para deploy no Render

## 📋 Pré-requisitos

- Node.js 16+ 
- PostgreSQL (configurado com as credenciais fornecidas)
- npm ou yarn

## 🛠️ Instalação Local

1. Clone ou extraia o projeto
2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados executando o script SQL:
```bash
psql -h ep-crimson-meadow-a8krhs13.eastus2.azure.neon.tech -U senhas_campneus_owner -d senhas_campneus -f schema.sql
```

4. Execute o script de configuração inicial:
```bash
node setup-db.js
```

5. Inicie o servidor:
```bash
npm start
```

6. Acesse: http://localhost:3000

## 🔐 Credenciais Padrão

- **Usuário:** admin
- **Senha:** admin123

## 🌐 Deploy no Render

### Opção 1: Usando render.yaml (Recomendado)

1. Faça upload do projeto para um repositório Git (GitHub, GitLab, etc.)
2. No Render, conecte o repositório
3. O arquivo `render.yaml` já está configurado com todas as variáveis necessárias
4. O deploy será automático

### Opção 2: Configuração Manual

1. Crie um novo Web Service no Render
2. Configure as seguintes variáveis de ambiente:
   - `PGHOST=ep-crimson-meadow-a8krhs13.eastus2.azure.neon.tech`
   - `PGDATABASE=senhas_campneus`
   - `PGUSER=senhas_campneus_owner`
   - `PGPASSWORD=npg_MXP5UK4CqToH`
   - `PGSSLMODE=require`
   - `PGCHANNELBINDING=require`
   - `JWT_SECRET=cofre_campneus_jwt_secret_key_2024_production`
   - `NODE_ENV=production`

3. Configure os comandos:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

## 📁 Estrutura do Projeto

```
cofre-campneus/
├── public/                 # Frontend (HTML, CSS, JS)
│   ├── css/
│   │   └── style.css      # Estilos da aplicação
│   ├── js/
│   │   └── app.js         # JavaScript principal
│   └── index.html         # Página principal
├── server.js              # Servidor Express principal
├── schema.sql             # Script de criação do banco
├── setup-db.js            # Script de configuração inicial
├── render.yaml            # Configuração para deploy no Render
├── package.json           # Dependências e scripts
├── .env                   # Variáveis de ambiente (local)
└── README.md              # Este arquivo
```

## 🔧 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Criptografia de senhas
- **CORS** - Controle de acesso

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilos e responsividade
- **JavaScript ES6+** - Funcionalidades
- **Font Awesome** - Ícones

## 📊 Banco de Dados

O sistema utiliza as seguintes tabelas:

- **users** - Usuários do sistema
- **categories** - Categorias de senhas
- **locations** - Localidades
- **passwords** - Credenciais e senhas

## 🛡️ Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT com expiração
- Conexão SSL com PostgreSQL
- Validação de dados no frontend e backend

## 📱 Interface

A interface foi desenvolvida baseada no design fornecido, incluindo:

- Sidebar com navegação por categorias
- Header com informações do usuário
- Tabela responsiva para listagem
- Modais para criação/edição
- Busca e filtragem em tempo real

## 🚨 Solução de Problemas

### Erro de conexão com banco
- Verifique se as credenciais estão corretas no arquivo `.env`
- Confirme se o banco PostgreSQL está acessível

### Erro de autenticação
- Verifique se o usuário admin foi criado executando `node setup-db.js`
- Confirme as credenciais: admin / admin123

### Problemas no deploy
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme se o `render.yaml` está na raiz do projeto

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Os logs do servidor
2. O console do navegador
3. As configurações do banco de dados
4. As variáveis de ambiente

---

**Desenvolvido para Cofre Campneus** 🛡️

