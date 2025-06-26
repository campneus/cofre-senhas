# Guia de Deploy - Cofre Campneus

Este documento contém instruções detalhadas para fazer o deploy do sistema Cofre Campneus no Render.

## 🚀 Deploy no Render (Recomendado)

### Pré-requisitos
- Conta no [Render](https://render.com)
- Repositório Git com o código do projeto
- Conta no [Neon](https://neon.tech) para PostgreSQL (opcional)

### Método 1: Deploy Automático com render.yaml

1. **Prepare o repositório**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <seu-repositorio-git>
   git push -u origin main
   ```

2. **Conecte no Render**
   - Acesse [Render Dashboard](https://dashboard.render.com)
   - Clique em "New +"
   - Selecione "Blueprint"
   - Conecte seu repositório Git
   - O arquivo `render.yaml` configurará automaticamente:
     - Web Service
     - PostgreSQL Database
     - Variáveis de ambiente

3. **Configure as variáveis de ambiente**
   O Render criará automaticamente as seguintes variáveis:
   - `DATABASE_URL` (do banco PostgreSQL criado)
   - `JWT_SECRET` (gerado automaticamente)
   - `SESSION_SECRET` (gerado automaticamente)
   - Outras variáveis definidas no `render.yaml`

### Método 2: Deploy Manual

#### Passo 1: Criar o Banco de Dados
1. No Render Dashboard, clique em "New +"
2. Selecione "PostgreSQL"
3. Configure:
   - **Name**: `cofre-campneus-db`
   - **Database**: `cofre_campneus`
   - **User**: `cofre_campneus_user`
   - **Plan**: Free
4. Clique em "Create Database"
5. Anote a **Internal Database URL** gerada

#### Passo 2: Executar Script SQL
1. Acesse o banco via psql ou pgAdmin
2. Execute o arquivo `database.sql` para criar as tabelas:
   ```bash
   psql <DATABASE_URL> -f database.sql
   ```

#### Passo 3: Criar o Web Service
1. No Render Dashboard, clique em "New +"
2. Selecione "Web Service"
3. Conecte seu repositório Git
4. Configure:
   - **Name**: `cofre-campneus`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

#### Passo 4: Configurar Variáveis de Ambiente
Adicione as seguintes variáveis no painel do Web Service:

```env
NODE_ENV=production
DATABASE_URL=<url-do-banco-postgresql>
JWT_SECRET=<chave-secreta-jwt-forte>
SESSION_SECRET=<chave-secreta-session-forte>
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=24h
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🗄️ Configuração do Banco de Dados

### Usando Neon (PostgreSQL na nuvem)
1. Crie uma conta no [Neon](https://neon.tech)
2. Crie um novo projeto
3. Copie a connection string
4. Use como `DATABASE_URL`

### Usando Render PostgreSQL
- O Render fornece PostgreSQL gratuito
- Limitado a 1GB de armazenamento
- Ideal para desenvolvimento e testes

### Executando o Script SQL
```bash
# Via psql
psql "postgresql://user:password@host:port/database" -f database.sql

# Via Docker (se necessário)
docker run --rm -v $(pwd):/app postgres:15 psql "postgresql://user:password@host:port/database" -f /app/database.sql
```

## 🔐 Configurações de Segurança

### Variáveis de Ambiente Obrigatórias
- `JWT_SECRET`: Chave para assinatura de tokens JWT (mínimo 32 caracteres)
- `SESSION_SECRET`: Chave para sessões (mínimo 32 caracteres)
- `DATABASE_URL`: String de conexão PostgreSQL

### Gerando Chaves Seguras
```bash
# Gerar chave aleatória
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ou usar openssl
openssl rand -hex 32
```

## 🔧 Troubleshooting

### Erro: "Connection refused"
- Verifique se a variável `PORT` está configurada
- O Render define automaticamente a porta via variável de ambiente

### Erro: "Database connection failed"
- Verifique a `DATABASE_URL`
- Certifique-se que o banco está acessível
- Verifique se as tabelas foram criadas

### Erro: "Module not found"
- Execute `npm install` localmente
- Verifique se todas as dependências estão no `package.json`
- Limpe o cache: `npm cache clean --force`

### Erro: "Health check failed"
- Verifique se a rota `/api/dashboard/status` está funcionando
- Teste localmente: `curl http://localhost:3000/api/dashboard/status`

## 📊 Monitoramento

### Health Check
O sistema inclui um health check em `/api/dashboard/status` que verifica:
- Conectividade com o banco de dados
- Status da aplicação
- Tempo de resposta

### Logs
- Acesse os logs no Render Dashboard
- Use `console.log` para debug (removido em produção)
- Monitore erros de conexão com banco

## 🔄 Atualizações

### Deploy Automático
- Configure webhook no Git para deploy automático
- Cada push na branch `main` fará novo deploy

### Deploy Manual
- No Render Dashboard, clique em "Manual Deploy"
- Selecione a branch desejada
- Aguarde o build e deploy

## 📝 Checklist de Deploy

- [ ] Código commitado no Git
- [ ] Banco de dados PostgreSQL criado
- [ ] Script SQL executado
- [ ] Variáveis de ambiente configuradas
- [ ] Web Service criado no Render
- [ ] Health check funcionando
- [ ] Usuário administrador padrão criado
- [ ] Teste de login realizado
- [ ] SSL/HTTPS funcionando (automático no Render)

## 🆘 Suporte

### Logs de Erro Comuns
```bash
# Ver logs do Render
# Acesse: Dashboard > Service > Logs

# Testar conexão local
npm run dev

# Testar banco de dados
node -e "require('./src/config/database').pool.query('SELECT NOW()', (err, res) => { console.log(err || res.rows[0]); process.exit(); })"
```

### Contato
- Email: suporte@cofrecampneus.com
- Documentação: README.md
- Issues: GitHub Issues (se aplicável)

---

**Nota**: Este guia assume o uso do plano gratuito do Render. Para produção, considere planos pagos para melhor performance e recursos adicionais.

