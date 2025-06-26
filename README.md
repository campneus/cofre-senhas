# Cofre Campneus - Sistema de Gerenciamento de Senhas

Sistema completo de gerenciamento de senhas desenvolvido em Node.js com Express, PostgreSQL e interface web responsiva.

## 🚀 Funcionalidades

### Dashboard
- Visão geral com estatísticas do sistema
- Gráficos de senhas por categoria
- Últimas senhas criadas/alteradas
- Senhas que expiram em breve
- Atividade recente do sistema

### Gerenciamento de Senhas
- CRUD completo de senhas
- Categorização (Prefeituras, Fornecedores, Órgãos Governamentais, B2Fleet)
- Criptografia de senhas
- Controle de expiração
- Sistema de busca e filtros avançados
- Notificações de expiração

### Localidades
- Cadastro de localidades com CNPJ
- Vinculação de senhas às localidades
- Controle de status (ativo/inativo)

### Usuários
- Dois tipos de usuário: Administrador e Analista
- **Administrador**: Acesso completo ao sistema
- **Analista**: Apenas visualização de senhas
- Sistema de autenticação JWT
- Controle de sessões

### Segurança
- Autenticação JWT
- Criptografia de senhas sensíveis
- Rate limiting
- Validação de dados
- Controle de acesso por tipo de usuário

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **crypto** - Criptografia de dados sensíveis

### Frontend
- **EJS** - Template engine
- **Tailwind CSS** - Framework CSS
- **Font Awesome** - Ícones
- **Chart.js** - Gráficos
- **JavaScript Vanilla** - Interatividade

### Deploy
- **Docker** - Containerização
- **Render** - Plataforma de deploy
- **Neon DB** - PostgreSQL na nuvem

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

## 🔧 Instalação e Configuração

### 1. Clone o repositório
\`\`\`bash
git clone <repository-url>
cd cofre-campneus
\`\`\`

### 2. Instale as dependências
\`\`\`bash
npm install
\`\`\`

### 3. Configure o banco de dados
\`\`\`bash
# Execute o script SQL para criar as tabelas
psql -h hostname -U username -d database_name -f database.sql
\`\`\`

### 4. Configure as variáveis de ambiente
\`\`\`bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
nano .env
\`\`\`

### 5. Inicie a aplicação
\`\`\`bash
# Desenvolvimento
npm run dev

# Produção
npm start
\`\`\`

## 🌐 Deploy no Render

### Usando render.yaml (Recomendado)
1. Faça push do código para um repositório Git
2. Conecte o repositório no Render
3. O arquivo \`render.yaml\` configurará automaticamente:
   - Serviço web
   - Banco de dados PostgreSQL
   - Variáveis de ambiente

### Deploy Manual
1. Crie um novo Web Service no Render
2. Configure as variáveis de ambiente:
   - \`DATABASE_URL\`: String de conexão PostgreSQL
   - \`JWT_SECRET\`: Chave secreta JWT
   - \`SESSION_SECRET\`: Chave secreta da sessão
   - \`NODE_ENV\`: production

## 🐳 Docker

### Build da imagem
\`\`\`bash
docker build -t cofre-campneus .
\`\`\`

### Executar container
\`\`\`bash
docker run -p 3000:3000 --env-file .env cofre-campneus
\`\`\`

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- **usuarios** - Usuários do sistema
- **localidades** - Localidades/empresas
- **senhas** - Senhas criptografadas
- **prefeituras** - Dados das prefeituras
- **fornecedores** - Dados dos fornecedores

### Relacionamentos
- Senhas → Localidades (N:1)
- Senhas → Usuários (N:1 para criador/atualizador)

## 🔐 Usuário Padrão

Após executar o script SQL, será criado um usuário administrador padrão:
- **Email**: admin@cofrecampneus.com
- **Senha**: admin123
- **Tipo**: Administrador

⚠️ **Importante**: Altere a senha padrão após o primeiro login!

## 📁 Estrutura do Projeto

\`\`\`
cofre-campneus/
├── src/
│   ├── config/          # Configurações
│   ├── controllers/     # Controladores
│   ├── middleware/      # Middlewares
│   ├── models/          # Models
│   ├── routes/          # Rotas
│   └── app.js          # Aplicação principal
├── views/              # Templates EJS
├── public/             # Arquivos estáticos
├── uploads/            # Uploads de arquivos
├── database.sql        # Script de criação do BD
├── Dockerfile         # Configuração Docker
├── render.yaml        # Configuração Render
└── package.json       # Dependências
\`\`\`

## 🔧 Scripts Disponíveis

\`\`\`bash
npm start          # Inicia em produção
npm run dev        # Inicia em desenvolvimento
npm run lint       # Executa linting
npm test           # Executa testes
\`\`\`

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
4. Push para a branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através do email: suporte@cofrecampneus.com

## 🔄 Changelog

### v1.0.0 (2024-12-26)
- Lançamento inicial
- Sistema completo de gerenciamento de senhas
- Interface web responsiva
- Sistema de autenticação
- Dashboard com métricas
- Deploy configurado para Render

---

**Cofre Campneus** - Sistema de Gerenciamento de Senhas © 2024

