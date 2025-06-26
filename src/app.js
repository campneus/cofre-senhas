const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
require('dotenv').config();

const { pool } = require('./config/database');

// Importar rotas
const authRoutes = require('./routes/auth');
const senhasRoutes = require('./routes/senhas');
const localidadesRoutes = require('./routes/localidades');
const usuariosRoutes = require('./routes/usuarios');
const dashboardRoutes = require('./routes/dashboard');
const prefeiturasRoutes = require('./routes/prefeituras');
const fornecedoresRoutes = require('./routes/fornecedores');

const app = express();

// Configurações de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://seu-dominio.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Configuração de sessão
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'sessoes'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware para adicionar usuário às views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/senhas', senhasRoutes);
app.use('/api/localidades', localidadesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/prefeituras', prefeiturasRoutes);
app.use('/api/fornecedores', fornecedoresRoutes);

// Rota principal - Dashboard
app.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('dashboard', { 
    title: 'Dashboard - Cofre Campneus',
    user: req.session.user 
  });
});

// Rota de login
app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('login', { title: 'Login - Cofre Campneus' });
});

// Rota de senhas
app.get('/senhas', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('senhas', { 
    title: 'Senhas - Cofre Campneus',
    user: req.session.user 
  });
});

// Rota de localidades
app.get('/localidades', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('localidades', { 
    title: 'Localidades - Cofre Campneus',
    user: req.session.user 
  });
});

// Rota de usuários (apenas administradores)
app.get('/usuarios', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  if (req.session.user.tipo_usuario !== 'administrador') {
    return res.status(403).render('error', {
      title: '403 - Acesso Negado',
      message: 'Você não tem permissão para acessar esta página.'
    });
  }
  res.render('usuarios', { 
    title: 'Usuários - Cofre Campneus',
    user: req.session.user 
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err.stack);
  
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Erro interno do servidor' 
        : err.message
    });
  } else {
    res.status(500).render('error', {
      title: 'Erro - Cofre Campneus',
      message: process.env.NODE_ENV === 'production' 
        ? 'Erro interno do servidor' 
        : err.message
    });
  }
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    res.status(404).json({
      success: false,
      message: 'Rota não encontrada'
    });
  } else {
    res.status(404).render('error', {
      title: '404 - Página não encontrada',
      message: 'A página que você está procurando não foi encontrada.'
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

