# Documentação Técnica - Cofre Campneus

## 🏗️ Arquitetura do Sistema

### Visão Geral
O Cofre Campneus é um sistema web de gerenciamento de senhas desenvolvido com arquitetura MVC (Model-View-Controller) usando Node.js, Express e PostgreSQL.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (EJS + JS)    │◄──►│   (Node.js)     │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Tecnologias Utilizadas

#### Backend
- **Node.js 18+**: Runtime JavaScript
- **Express.js 4.x**: Framework web
- **PostgreSQL 12+**: Banco de dados relacional
- **JWT**: Autenticação stateless
- **bcrypt**: Hash de senhas
- **crypto**: Criptografia de dados sensíveis
- **express-session**: Gerenciamento de sessões
- **helmet**: Segurança HTTP
- **cors**: Cross-Origin Resource Sharing

#### Frontend
- **EJS**: Template engine
- **Tailwind CSS**: Framework CSS utilitário
- **Font Awesome**: Biblioteca de ícones
- **Chart.js**: Gráficos interativos
- **JavaScript ES6+**: Funcionalidades do cliente

#### DevOps
- **Docker**: Containerização
- **Render**: Plataforma de deploy
- **Git**: Controle de versão

## 📊 Modelo de Dados

### Diagrama ER
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   usuarios  │     │localidades  │     │   senhas    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │     │ id (PK)     │     │ id (PK)     │
│ nome        │     │ codigo_loc  │     │ sistema     │
│ email       │     │ cnpj        │     │ categoria   │
│ senha_hash  │     │ nome_loc    │     │ usuario     │
│ tipo_usuario│     │ endereco    │     │ senha_cripto│
│ ativo       │     │ telefone    │     │ url         │
│ criado_em   │     │ email       │     │ localidade_id│
│ ultimo_acesso│    │ observacoes │     │ data_expir  │
└─────────────┘     │ ativo       │     │ dias_aviso  │
                    │ criado_em   │     │ notif_expir │
                    └─────────────┘     │ observacoes │
                                        │ criado_por  │
                                        │ atualizado_por│
                                        │ criado_em   │
                                        │ atualizado_em│
                                        └─────────────┘
```

### Relacionamentos
- `senhas.localidade_id` → `localidades.id` (N:1)
- `senhas.criado_por` → `usuarios.id` (N:1)
- `senhas.atualizado_por` → `usuarios.id` (N:1)

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação
1. **Login**: Usuário fornece email/senha
2. **Validação**: bcrypt verifica hash da senha
3. **Token JWT**: Gerado com payload do usuário
4. **Sessão**: Armazenada no servidor
5. **Autorização**: Middleware verifica token/sessão

### Tipos de Usuário
- **Administrador**: Acesso completo (CRUD em todas as entidades)
- **Analista**: Apenas leitura de senhas

### Middleware de Segurança
```javascript
// Autenticação obrigatória
authenticateToken(req, res, next)

// Apenas administradores
requireAdmin(req, res, next)

// Rate limiting
rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
```

## 🔒 Criptografia e Segurança

### Criptografia de Senhas
```javascript
// Algoritmo: AES-256-GCM
const algorithm = 'aes-256-gcm';
const secretKey = crypto.scryptSync(process.env.JWT_SECRET, 'salt', 32);

// Criptografar
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, secretKey);
  // ... implementação
}

// Descriptografar
function decrypt(encryptedData) {
  const decipher = crypto.createDecipher(algorithm, secretKey);
  // ... implementação
}
```

### Hash de Senhas de Usuário
```javascript
// bcrypt com 12 rounds (configurável via .env)
const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### Validação de Dados
- **Sanitização**: Escape de caracteres especiais
- **Validação**: Tipos, tamanhos e formatos
- **CSRF Protection**: Tokens anti-CSRF
- **SQL Injection**: Queries parametrizadas

## 🌐 API REST

### Estrutura de Resposta
```javascript
// Sucesso
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}

// Erro
{
  "success": false,
  "message": "Descrição do erro",
  "errors": [ ... ] // opcional
}
```

### Endpoints Principais

#### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário logado

#### Senhas
- `GET /api/senhas` - Listar senhas (paginado)
- `GET /api/senhas/:id` - Buscar senha por ID
- `POST /api/senhas` - Criar senha (admin)
- `PUT /api/senhas/:id` - Atualizar senha (admin)
- `DELETE /api/senhas/:id` - Excluir senha (admin)

#### Localidades
- `GET /api/localidades` - Listar localidades
- `GET /api/localidades/select/opcoes` - Opções para select
- `POST /api/localidades` - Criar localidade (admin)
- `PUT /api/localidades/:id` - Atualizar localidade (admin)

#### Usuários (apenas admin)
- `GET /api/usuarios` - Listar usuários
- `POST /api/usuarios` - Criar usuário
- `PUT /api/usuarios/:id` - Atualizar usuário
- `POST /api/usuarios/:id/resetar-senha` - Resetar senha

#### Dashboard
- `GET /api/dashboard/estatisticas` - Estatísticas gerais
- `GET /api/dashboard/atividade/recente` - Atividade recente
- `GET /api/dashboard/status` - Health check

## 🎨 Frontend

### Estrutura de Views
```
views/
├── layout.ejs          # Layout base
├── login.ejs           # Página de login
├── dashboard.ejs       # Dashboard principal
├── senhas.ejs          # Gerenciamento de senhas
├── localidades.ejs     # Gerenciamento de localidades
├── usuarios.ejs        # Gerenciamento de usuários
└── error.ejs           # Página de erro
```

### Componentes JavaScript
- **API Helper**: Wrapper para requisições HTTP
- **UI Components**: Modais, alertas, paginação
- **Form Helpers**: Serialização, validação, população
- **Utils**: Formatação, validação, debounce

### Responsividade
- **Mobile First**: Design responsivo
- **Breakpoints**: sm, md, lg, xl (Tailwind)
- **Touch Support**: Eventos touch para mobile
- **Sidebar**: Colapsível em dispositivos móveis

## 📈 Performance

### Otimizações Backend
- **Connection Pooling**: Pool de conexões PostgreSQL
- **Query Optimization**: Índices e queries otimizadas
- **Pagination**: Limitação de resultados
- **Caching**: Headers de cache para assets estáticos

### Otimizações Frontend
- **Lazy Loading**: Carregamento sob demanda
- **Debouncing**: Busca com delay
- **Minification**: CSS/JS minificados em produção
- **CDN**: Bibliotecas externas via CDN

## 🔍 Monitoramento

### Health Check
```javascript
// GET /api/dashboard/status
{
  "status": "healthy",
  "timestamp": "2024-12-26T10:00:00Z",
  "database": "connected",
  "uptime": 3600
}
```

### Logs
- **Winston**: Logger estruturado
- **Levels**: error, warn, info, debug
- **Rotation**: Rotação automática de logs
- **Format**: JSON para parsing

### Métricas
- **Response Time**: Tempo de resposta das APIs
- **Error Rate**: Taxa de erros
- **Database Queries**: Performance das queries
- **Memory Usage**: Uso de memória

## 🧪 Testes

### Estrutura de Testes
```
tests/
├── unit/               # Testes unitários
│   ├── models/         # Testes dos models
│   ├── controllers/    # Testes dos controllers
│   └── utils/          # Testes dos utilitários
├── integration/        # Testes de integração
│   ├── api/            # Testes das APIs
│   └── database/       # Testes do banco
└── e2e/               # Testes end-to-end
    └── scenarios/      # Cenários de uso
```

### Ferramentas
- **Jest**: Framework de testes
- **Supertest**: Testes de API
- **Puppeteer**: Testes E2E
- **Coverage**: Cobertura de código

## 🚀 Deploy

### Containerização
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### CI/CD Pipeline
1. **Build**: Instalação de dependências
2. **Test**: Execução de testes
3. **Security**: Scan de vulnerabilidades
4. **Deploy**: Deploy automático no Render

### Environment Variables
```env
# Obrigatórias
DATABASE_URL=postgresql://...
JWT_SECRET=...
SESSION_SECRET=...

# Opcionais
NODE_ENV=production
PORT=3000
BCRYPT_ROUNDS=12
```

## 📚 Padrões de Código

### Estrutura de Arquivos
```
src/
├── config/             # Configurações
├── controllers/        # Lógica de negócio
├── middleware/         # Middlewares
├── models/            # Modelos de dados
├── routes/            # Definição de rotas
├── utils/             # Utilitários
└── app.js             # Aplicação principal
```

### Convenções
- **Naming**: camelCase para JS, snake_case para DB
- **Error Handling**: Try-catch em todas as operações async
- **Validation**: Validação no backend e frontend
- **Documentation**: JSDoc para funções complexas

### Code Style
- **ESLint**: Linting automático
- **Prettier**: Formatação de código
- **Husky**: Git hooks para qualidade
- **Conventional Commits**: Padrão de commits

## 🔧 Troubleshooting

### Problemas Comuns

#### Erro de Conexão com Banco
```javascript
// Verificar conexão
const { pool } = require('./src/config/database');
pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? err : res.rows[0]);
});
```

#### Erro de Autenticação
```javascript
// Verificar token JWT
const jwt = require('jsonwebtoken');
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('Token válido:', decoded);
} catch (error) {
  console.log('Token inválido:', error.message);
}
```

#### Performance Issues
- Verificar índices no banco
- Analisar queries lentas
- Monitorar uso de memória
- Verificar connection pool

### Debug Mode
```bash
# Ativar debug
DEBUG=app:* npm run dev

# Logs detalhados
NODE_ENV=development npm start
```

---

Esta documentação técnica serve como referência para desenvolvedores que trabalharão na manutenção e evolução do sistema Cofre Campneus.

